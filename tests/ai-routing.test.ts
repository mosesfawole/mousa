import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { handleContentRequest } from "@/lib/content-api";
import { sharedAIAvailable, sharedAIProviderNames } from "@/lib/ai-router";

const rotation = vi.hoisted(() => ({ start: 0 }));
vi.mock("node:crypto", async (original) => ({
  ...(await original<typeof import("node:crypto")>()),
  randomInt: () => rotation.start,
}));

const fixtures = {
  generate: {
    ideas: [1, 2, 3, 4, 5].map((n) => ({
      idea: `Angle ${n}`,
      hook: `Hook ${n}`,
    })),
  },
  expand: {
    tweet: "A specific short draft.",
    hashtags: [],
    tip: "Keep the detail.",
  },
  analyze: {
    score: 7,
    verdict: "Clear",
    strengths: ["Specific"],
    weaknesses: [],
    improved: "A clearer draft.",
    hashtags: [],
  },
};
type Kind = keyof typeof fixtures;
let calls: { url: string; headers: Headers; body: Record<string, unknown> }[];
let statuses: Record<string, number>;
let output: unknown;
let quota: number;
let failure: string;

beforeEach(() => {
  rotation.start = 0;
  for (const provider of [
    "GROQ",
    "OPENROUTER",
    "FORTYTWO",
    "ANTHROPIC",
    "OPENAI",
  ]) {
    vi.stubEnv(`${provider}_API_KEY`, "");
    vi.stubEnv(`${provider}_MODEL`, "");
  }
  vi.stubEnv(
    "MOUSA_AI_PROVIDER_ORDER",
    "groq,openrouter,fortytwo,anthropic,openai",
  );
  vi.stubEnv("MOUSA_AI_ROUTING", "priority");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://quota.example");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "quota-test-token");
  calls = [];
  statuses = {};
  quota = 1;
  output = fixtures.generate;
  failure = "";
  vi.stubGlobal(
    "fetch",
    async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = String(input);
      calls.push({
        url,
        headers: new Headers(options?.headers),
        body: JSON.parse(String(options?.body)),
      });
      if (url.startsWith("https://quota.example"))
        return Response.json({ result: quota });
      if (failure === "network" && url.includes("groq.com"))
        throw new TypeError("fetch failed");
      const status =
        Object.entries(statuses).find(([host]) => url.includes(host))?.[1] ||
        200;
      if (status !== 200)
        return Response.json(
          {
            error: {
              message: "private-provider-error-secret",
              type: "upstream_error",
            },
          },
          { status },
        );
      return Response.json({
        id: "chat_test",
        object: "chat.completion",
        created: 0,
        model: "test",
        choices: [
          {
            index: 0,
            finish_reason: failure === "refusal" ? "content_filter" : "stop",
            message: {
              role: "assistant",
              content:
                typeof output === "string" ? output : JSON.stringify(output),
            },
          },
        ],
      });
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function request(
  kind: Kind = "generate",
  headers: Record<string, string> = {},
  mode = "live",
) {
  const body =
    kind === "generate"
      ? { niche: "Developers", tone: "casual" }
      : kind === "expand"
        ? { idea: "A small refactor", niche: "Developers", tone: "casual" }
        : { tweet: "A useful post", niche: "Developers" };
  return new NextRequest(`https://mousa.example/api/${kind}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://mousa.example",
      ...headers,
    },
    body: JSON.stringify({ ...body, mode }),
  });
}
const providerCalls = () =>
  calls.filter(({ url }) => !url.includes("quota.example"));

it.each(["generate", "expand", "analyze"] as const)(
  "uses FortyTwo alone for %s without a visitor key",
  async (kind) => {
    vi.stubEnv("FORTYTWO_API_KEY", "fortytwo-owner-secret");
    output = fixtures[kind];
    const response = await handleContentRequest(request(kind), kind);
    expect(response.status).toBe(200);
    expect((await response.json()).source).toBe("live");
    expect(providerCalls()).toHaveLength(1);
    expect(providerCalls()[0].url).toBe(
      "https://api.fortytwo.network/v1/chat/completions",
    );
    expect(providerCalls()[0].headers.get("authorization")).toBe(
      "Bearer fortytwo-owner-secret",
    );
    expect(providerCalls()[0].body).toMatchObject({
      model: "qwen/qwen3.8-27b",
      reasoning_effort: "none",
      response_format: { type: "json_object" },
    });
  },
);

it("falls from Groq to free OpenRouter to FortyTwo on quota and availability failures", async () => {
  vi.stubEnv("GROQ_API_KEY", "groq-owner-secret");
  vi.stubEnv("OPENROUTER_API_KEY", "openrouter-owner-secret");
  vi.stubEnv("FORTYTWO_API_KEY", "fortytwo-owner-secret");
  statuses = { "groq.com": 429, "openrouter.ai": 503 };
  const response = await handleContentRequest(request(), "generate");
  expect(response.status).toBe(200);
  expect(providerCalls().map(({ url }) => new URL(url).host)).toEqual([
    "api.groq.com",
    "openrouter.ai",
    "api.fortytwo.network",
  ]);
  expect(providerCalls()[1].body.model).toBe("openrouter/free");
  expect(calls.filter(({ url }) => url.includes("quota.example"))).toHaveLength(
    1,
  );
  expect(
    new Set(providerCalls().map(({ body }) => JSON.stringify(body.messages)))
      .size,
  ).toBe(1);
});

it("can rotate the starting provider across stateless instances", async () => {
  vi.stubEnv("MOUSA_AI_ROUTING", "rotate");
  vi.stubEnv("GROQ_API_KEY", "groq-owner-secret");
  vi.stubEnv("FORTYTWO_API_KEY", "fortytwo-owner-secret");
  rotation.start = 1;
  expect((await handleContentRequest(request(), "generate")).status).toBe(200);
  expect(providerCalls()).toHaveLength(1);
  expect(providerCalls()[0].url).toContain("fortytwo.network");
});

it("does not retry the same provider after network errors", async () => {
  vi.stubEnv("GROQ_API_KEY", "groq-owner-secret");
  vi.stubEnv("FORTYTWO_API_KEY", "fortytwo-owner-secret");
  failure = "network";
  expect((await handleContentRequest(request(), "generate")).status).toBe(200);
  expect(providerCalls()).toHaveLength(2);
});

it.each([
  ["groq", "gsk_personal-test-key-abcdefghijklmnopqrstuvwxyz", "api.groq.com"],
  [
    "openrouter",
    "sk-or-personal-test-key-abcdefghijklmnopqrstuvwxyz",
    "openrouter.ai",
  ],
  [
    "fortytwo",
    "fortytwo-personal-test-key-abcdefghijklmnopqrstuvwxyz",
    "api.fortytwo.network",
  ],
])(
  "keeps a personal %s key outside the hosted pool and limiter",
  async (provider, key, host) => {
    vi.stubEnv("GROQ_API_KEY", "groq-owner-secret");
    const response = await handleContentRequest(
      request("generate", {
        "x-mousa-provider": provider,
        "x-mousa-api-key": key,
      }),
      "generate",
    );
    expect(response.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(new URL(calls[0].url).host).toBe(host);
    expect(calls[0].headers.get("authorization")).toBe(`Bearer ${key}`);
  },
);

it("never falls from an exhausted personal key into owner credits", async () => {
  vi.stubEnv("FORTYTWO_API_KEY", "owner-secret");
  statuses = { "groq.com": 429 };
  const response = await handleContentRequest(
    request("generate", {
      "x-mousa-provider": "groq",
      "x-mousa-api-key": "gsk_personal-test-key-abcdefghijklmnopqrstuvwxyz",
    }),
    "generate",
  );
  expect(response.status).toBe(429);
  expect(calls).toHaveLength(1);
});

it.each(["refusal", "invalid-json", "invalid-shape"])(
  "does not rotate around %s",
  async (problem) => {
    vi.stubEnv("GROQ_API_KEY", "groq-owner-secret");
    vi.stubEnv("FORTYTWO_API_KEY", "fortytwo-owner-secret");
    if (problem === "refusal") failure = "refusal";
    else output = problem === "invalid-json" ? "not JSON" : { ideas: [] };
    const response = await handleContentRequest(request(), "generate");
    expect(response.status).toBe(problem === "refusal" ? 422 : 502);
    expect(providerCalls()).toHaveLength(1);
  },
);

it("reports host authentication errors without blaming visitors or leaking upstream text", async () => {
  vi.stubEnv("GROQ_API_KEY", "groq-owner-secret");
  vi.stubEnv("FORTYTWO_API_KEY", "fortytwo-owner-secret");
  statuses = { "groq.com": 401 };
  const response = await handleContentRequest(request(), "generate");
  expect(response.status).toBe(503);
  const body = await response.text();
  expect(body).toContain("Mousa’s shared AI");
  expect(body).not.toContain("secret");
  expect(providerCalls()).toHaveLength(1);
});

it("blocks shared requests before inference when the quota is exhausted", async () => {
  vi.stubEnv("GROQ_API_KEY", "groq-owner-secret");
  quota = 0;
  expect((await handleContentRequest(request(), "generate")).status).toBe(429);
  expect(providerCalls()).toEqual([]);
});

it("never spends paid OpenRouter credits through a host model override", async () => {
  vi.stubEnv("OPENROUTER_API_KEY", "openrouter-owner-secret");
  vi.stubEnv("OPENROUTER_MODEL", "paid/model");
  expect(sharedAIAvailable()).toBe(false);
  expect((await handleContentRequest(request(), "generate")).status).toBe(503);
  expect(calls).toEqual([]);
});

it("honors provider ordering, deduplicates it, and omits unconfigured providers", () => {
  vi.stubEnv("GROQ_API_KEY", "groq-owner-secret");
  vi.stubEnv("FORTYTWO_API_KEY", "fortytwo-owner-secret");
  vi.stubEnv("MOUSA_AI_PROVIDER_ORDER", "fortytwo,unknown,groq,fortytwo");
  expect(sharedAIProviderNames()).toEqual(["FortyTwo", "Groq"]);
});

it("leaves sample requests completely outside the provider pool and quota", async () => {
  vi.stubEnv("FORTYTWO_API_KEY", "fortytwo-owner-secret");
  expect(
    (await handleContentRequest(request("generate", {}, "sample"), "generate"))
      .status,
  ).toBe(200);
  expect(calls).toEqual([]);
});

it("does not begin inference when the client has already disconnected", async () => {
  vi.stubEnv("FORTYTWO_API_KEY", "fortytwo-owner-secret");
  const req = request();
  vi.spyOn(req.signal, "aborted", "get").mockReturnValue(true);
  expect((await handleContentRequest(req, "generate")).status).toBe(499);
  expect(providerCalls()).toEqual([]);
});
