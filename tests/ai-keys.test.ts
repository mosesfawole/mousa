import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { handleContentRequest } from "@/lib/content-api";

const anthropicKey = "sk-ant-api03-user-test-key-abcdefghijklmnopqrstuvwxyz";
const openaiKey = "sk-proj-user-test-key-abcdefghijklmnopqrstuvwxyz";
const ideas = [1, 2, 3, 4, 5].map((id) => ({
  idea: `Angle ${id}`,
  hook: `Opening ${id}`,
}));
let requests: {
  url: string;
  headers: Headers;
  body: Record<string, unknown>;
}[];
let providerStatus: number;

beforeEach(() => {
  vi.stubEnv("ANTHROPIC_API_KEY", "owner-test-placeholder");
  requests = [];
  providerStatus = 200;
  vi.stubGlobal(
    "fetch",
    async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = String(input);
      requests.push({
        url,
        headers: new Headers(options?.headers),
        body: JSON.parse(String(options?.body)),
      });
      if (providerStatus !== 200)
        return Response.json(
          {
            error: {
              type: "authentication_error",
              message: `Upstream message includes ${openaiKey}`,
            },
          },
          { status: providerStatus },
        );
      const result = JSON.stringify({ ideas });
      return Response.json(
        url.includes("api.openai.com")
          ? {
              id: "resp_test",
              object: "response",
              created_at: 0,
              status: "completed",
              model: "test-model",
              output: [
                {
                  id: "msg_test",
                  type: "message",
                  status: "completed",
                  role: "assistant",
                  content: [
                    { type: "output_text", text: result, annotations: [] },
                  ],
                },
              ],
            }
          : {
              id: "msg_test",
              type: "message",
              role: "assistant",
              model: "test-model",
              content: [{ type: "text", text: result }],
              stop_reason: "end_turn",
              stop_sequence: null,
              usage: { input_tokens: 10, output_tokens: 10 },
            },
      );
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function request(provider: string, key: string, mode = "live") {
  return new NextRequest("https://mousa.example/api/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://mousa.example",
      "x-mousa-provider": provider,
      "x-mousa-api-key": key,
    },
    body: JSON.stringify({ niche: "Developers", tone: "casual", mode }),
  });
}

it("uses a visitor's Anthropic key rather than an owner's fallback", async () => {
  const response = await handleContentRequest(
    request("anthropic", anthropicKey),
    "generate",
  );
  expect(response.status).toBe(200);
  expect(requests[0]?.headers.get("authorization")).toBe(
    `Bearer ${anthropicKey}`,
  );
  expect((await response.json()).ideas).toHaveLength(5);
});

it("routes an OpenAI key through Responses and returns usable ideas", async () => {
  const response = await handleContentRequest(
    request("openai", openaiKey),
    "generate",
  );
  expect(response.status).toBe(200);
  expect(requests[0]?.url).toBe("https://api.openai.com/v1/responses");
  expect(requests[0]?.headers.get("authorization")).toBe(`Bearer ${openaiKey}`);
  expect(requests[0]?.body.store).toBe(false);
  expect((await response.json()).ideas[0].hook).toBe("Opening 1");
});

it("never sends a connected key to a provider in sample mode", async () => {
  const response = await handleContentRequest(
    request("openai", openaiKey, "sample"),
    "generate",
  );
  expect(response.status).toBe(200);
  expect(requests).toEqual([]);
  expect((await response.json()).source).toBe("sample");
});

it("rejects mismatched provider keys without falling back to owner credentials", async () => {
  const response = await handleContentRequest(
    request("openai", anthropicKey),
    "generate",
  );
  expect(response.status).toBe(400);
  expect(requests).toEqual([]);
});

it("returns a safe authentication error without reflecting the upstream key", async () => {
  providerStatus = 401;
  const response = await handleContentRequest(
    request("openai", openaiKey),
    "generate",
  );
  expect(response.status).toBe(401);
  expect(await response.text()).not.toContain(openaiKey);
  expect(requests).toHaveLength(1);
});

it("keeps responses out of caches", async () => {
  const response = await handleContentRequest(
    request("openai", openaiKey, "sample"),
    "generate",
  );
  expect(response.headers.get("cache-control")).toContain("no-store");
});
