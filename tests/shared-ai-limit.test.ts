import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { reserveSharedRequest } from "@/lib/shared-ai-limit";
import { sharedAIAvailable } from "@/lib/ai-router";

beforeEach(() => {
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://quota.example");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-quota-token");
  vi.stubEnv("MOUSA_AI_VISITOR_DAILY_LIMIT", "10");
  vi.stubEnv("MOUSA_AI_GLOBAL_DAILY_LIMIT", "100");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it("uses an atomic, expiring reservation without storing raw IPs or writing content", async () => {
  vi.stubEnv("VERCEL", "1");
  let command: unknown[] = [];
  vi.stubGlobal("fetch", async (_url: URL, options: RequestInit) => {
    command = JSON.parse(String(options.body));
    return Response.json({ result: 1 });
  });
  await reserveSharedRequest(
    new NextRequest("https://mousa.example", {
      headers: { "x-vercel-forwarded-for": "203.0.113.7" },
    }),
  );
  expect(command[0]).toBe("EVAL");
  expect(command[2]).toBe(3);
  expect(command.slice(6)).toEqual([3, 10, 100, 120, 172800, 172800]);
  expect(JSON.stringify(command)).not.toContain("203.0.113.7");
});

it.each([
  Response.json({ error: "secret error" }, { status: 500 }),
  Response.json({ result: "unexpected" }),
])("fails closed when quota storage fails", async (response) => {
  vi.stubGlobal("fetch", async () => response.clone());
  await expect(
    reserveSharedRequest(new NextRequest("https://mousa.example")),
  ).rejects.toMatchObject({ status: 503 });
});

it("fails closed in production if durable counters have not been configured", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("GROQ_API_KEY", "owner-secret");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  expect(sharedAIAvailable()).toBe(false);
  await expect(
    reserveSharedRequest(new NextRequest("https://mousa.example")),
  ).rejects.toMatchObject({ status: 503 });
});

it("does not trust arbitrary forwarded-for headers to create new visitor budgets", async () => {
  vi.stubEnv("VERCEL", "");
  const commands: unknown[][] = [];
  vi.stubGlobal("fetch", async (_url: URL, options: RequestInit) => {
    commands.push(JSON.parse(String(options.body)));
    return Response.json({ result: 1 });
  });
  await reserveSharedRequest(
    new NextRequest("https://mousa.example", {
      headers: { "x-forwarded-for": "203.0.113.7" },
    }),
  );
  await reserveSharedRequest(
    new NextRequest("https://mousa.example", {
      headers: { "x-forwarded-for": "203.0.113.8" },
    }),
  );
  expect(commands[0].slice(3, 6)).toEqual(commands[1].slice(3, 6));
});

it("enforces the local development quota before reserving further requests", async () => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  vi.stubEnv("MOUSA_AI_GLOBAL_DAILY_LIMIT", "2");
  const req = new NextRequest("https://mousa.example");
  await reserveSharedRequest(req);
  await reserveSharedRequest(req);
  await expect(reserveSharedRequest(req)).rejects.toMatchObject({
    status: 429,
  });
});
