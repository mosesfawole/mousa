import { afterEach, beforeEach, vi } from "vitest";

// Never let a developer's real provider credentials or network enter a unit test.
beforeEach(() => {
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
  for (const setting of [
    "MOUSA_AI_PROVIDER_ORDER",
    "MOUSA_AI_ROUTING",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "VERCEL",
  ])
    vi.stubEnv(setting, "");
  vi.stubGlobal("fetch", () => {
    throw new Error("Unexpected network request in unit test");
  });
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
