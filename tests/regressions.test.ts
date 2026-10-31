import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server";
import { useContentStore } from "@/store/useContentStore";
import ScoreRing from "@/components/ui/ScoreRing";

const provider = vi.hoisted(() => ({ output: "" }));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = {
      create: async () => ({
        content: [{ type: "text", text: provider.output }],
      }),
    };
  },
}));
// The external database is unavailable; successful AI output must still reach the user.
vi.mock("@/lib/db", () => ({
  saveContent: async () => null,
  saveIdeas: async () => [],
  getHistory: async () => [],
  deleteContent: async () => true,
  updateIdeaExpanded: async () => false,
}));

const fixtureIdeas = [
  { idea: "Explain narrowing", hook: "Your union type is hiding a bug." },
  { idea: "Show a small refactor", hook: "Three lines I removed today." },
  { idea: "Share a debugging lesson", hook: "The bug was in my assumption." },
  { idea: "Explain accessible labels", hook: "A placeholder is not a label." },
  { idea: "Compare loading states", hook: "Make waiting feel intentional." },
];
function request(path: string, body: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = "test-only-placeholder";
  provider.output = JSON.stringify({ ideas: fixtureIdeas });
});

describe("Mousa regressions", () => {
  it("keeps the brief topic when clearing old generation results", () => {
    useContentStore.getState().setTopic("TypeScript narrowing");
    useContentStore.getState().clearGenerator();
    expect(useContentStore.getState().topic).toBe("TypeScript narrowing");
  });

  it("renders the review score as an accessible numeric meter", () => {
    const html = renderToStaticMarkup(
      createElement(ScoreRing, { score: 7 } as never),
    );
    expect(html).toContain('role="meter"');
    expect(html).toContain('aria-valuenow="7"');
  });

  it("returns all generated ideas when database persistence is unavailable", async () => {
    const { POST } = await import("@/app/api/generate/route");
    const response = await POST(
      request("/api/generate", { niche: "Developer", tone: "casual" }),
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ideas).toHaveLength(5);
    expect(data.ideas[0].hook).toBe("Your union type is hiding a bug.");
  });

  it("rejects a whitespace-only brief before calling the provider", async () => {
    const { POST } = await import("@/app/api/generate/route");
    const response = await POST(
      request("/api/generate", { niche: "   ", tone: "casual" }),
    );
    expect(response.status).toBe(400);
  });

  it("rejects malformed provider analysis instead of sending it to the UI", async () => {
    provider.output = JSON.stringify({
      score: 99,
      verdict: "Great",
      strengths: [],
      weaknesses: [],
      improved: "Try this",
      hashtags: [],
    });
    const { POST } = await import("@/app/api/analyze/route");
    const response = await POST(
      request("/api/analyze", { tweet: "A useful post", niche: "Developer" }),
    );
    expect(response.status).toBe(502);
  });

  it("does not expose global content history to anonymous visitors", async () => {
    const { GET } = await import("@/app/api/histore/route");
    const response = await GET();
    expect(response.status).toBe(410);
  });

  it("labels sample ideas and requires no provider credentials", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { POST } = await import("@/app/api/generate/route");
    const response = await POST(
      request("/api/generate", {
        niche: "Developer",
        tone: "casual",
        mode: "sample",
      }),
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.source).toBe("sample");
    expect(data.ideas).toHaveLength(5);
  });

  it("fails clearly when live AI is requested without a configured key", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { POST } = await import("@/app/api/generate/route");
    const response = await POST(
      request("/api/generate", {
        niche: "Developer",
        tone: "casual",
        mode: "live",
      }),
    );
    expect(response.status).toBe(503);
  });

  it("rejects invalid tones rather than sending arbitrary values to the provider", async () => {
    const { POST } = await import("@/app/api/generate/route");
    const response = await POST(
      request("/api/generate", {
        niche: "Developer",
        tone: "invalid",
        mode: "sample",
      }),
    );
    expect(response.status).toBe(400);
  });

  it("accepts a same-site request when Next normalizes the internal URL hostname", async () => {
    const { POST } = await import("@/app/api/generate/route");
    const request = new NextRequest("http://localhost:3108/api/generate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "127.0.0.1:3108",
        origin: "http://127.0.0.1:3108",
      },
      body: JSON.stringify({
        niche: "Developer",
        tone: "casual",
        mode: "sample",
      }),
    });
    expect((await POST(request)).status).toBe(200);
  });

  it("rejects cross-site origin requests", async () => {
    const { POST } = await import("@/app/api/generate/route");
    const request = new NextRequest("http://localhost/api/generate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "localhost",
        origin: "https://unrelated.example",
      },
      body: JSON.stringify({
        niche: "Developer",
        tone: "casual",
        mode: "sample",
      }),
    });
    expect((await POST(request)).status).toBe(403);
  });
});
