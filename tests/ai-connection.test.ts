import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useAIConnection } from "@/store/useAIConnection";
import { useContentStore } from "@/store/useContentStore";
import { postContent } from "@/lib/browser-api";

const key = "sk-proj-browser-test-key-abcdefghijklmnopqrstuvwxyz";
beforeEach(() => useAIConnection.getState().disconnect());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("keeps credentials out of persisted writing work", () => {
  const writes: string[] = [];
  vi.stubGlobal("window", {
    localStorage: {
      setItem: (_key: string, value: string) => writes.push(value),
    },
  });
  expect(useAIConnection.getState().connect("openai", key)).toBe(true);
  useContentStore.getState().setTopic("My next post");
  expect(writes.length).toBeGreaterThan(0);
  expect(writes.join("")).not.toContain(key);
});

it("sends the selected connection only with live writing requests", async () => {
  const headers: Headers[] = [];
  vi.stubGlobal("fetch", async (_url: string, options: RequestInit) => {
    headers.push(new Headers(options.headers));
    return Response.json({ ok: true });
  });
  useAIConnection.getState().connect("openai", key);
  await postContent("/api/generate", { mode: "sample" });
  await postContent("/api/generate", { mode: "live" });
  expect(headers[0].has("x-mousa-api-key")).toBe(false);
  expect(headers[1].get("x-mousa-provider")).toBe("openai");
  expect(headers[1].get("x-mousa-api-key")).toBe(key);
});

it("disconnects credentials and returns to sample mode", () => {
  useAIConnection.getState().connect("openai", key);
  expect(useAIConnection.getState().sampleMode).toBe(false);
  useAIConnection.getState().disconnect();
  expect(useAIConnection.getState()).toMatchObject({
    apiKey: "",
    sampleMode: true,
  });
});

it("rejects a provider mismatch without replacing an existing connection", () => {
  useAIConnection.getState().connect("openai", key);
  expect(useAIConnection.getState().connect("anthropic", key)).toBe(false);
  expect(useAIConnection.getState()).toMatchObject({
    provider: "openai",
    apiKey: key,
  });
});

it("does not forward credentials to arbitrary URLs", async () => {
  useAIConnection.getState().connect("openai", key);
  const calls: string[] = [];
  vi.stubGlobal("fetch", async (url: string) => {
    calls.push(url);
    return Response.json({});
  });
  await expect(
    postContent("https://unrelated.example/api/generate", { mode: "live" }),
  ).rejects.toThrow();
  expect(calls).toEqual([]);
});
