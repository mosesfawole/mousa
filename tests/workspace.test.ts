import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { useContentStore } from "@/store/useContentStore";

beforeEach(() => {
  useContentStore.setState({
    history: [],
    draft: null,
    storageError: null,
    generationBrief: null,
    analysisResult: null,
  } as never);
});

it("keeps later edits when the current draft is reopened", () => {
  const s = useContentStore.getState();
  s.openDraft({
    id: "same",
    tweet: "Saved version",
    hashtags: [],
    tip: "",
    source: "sample",
  });
  s.saveDraft();
  const saved = useContentStore.getState().history[0];
  s.setDraftText("My later edits");
  s.reopen(saved);
  expect(useContentStore.getState().draft?.tweet).toBe("My later edits");
});

it("restores the saved draft's audience, tone and idea when switching briefs", () => {
  const s = useContentStore.getState();
  useContentStore.setState({
    generationBrief: { niche: "Audience A", tone: "professional" },
  });
  s.openDraft({
    id: "a",
    tweet: "A draft",
    hashtags: [],
    tip: "",
    source: "sample",
  });
  s.saveDraft();
  const saved = useContentStore.getState().history[0];
  useContentStore.setState({
    draft: null,
    generationBrief: { niche: "Audience B", tone: "funny" },
    ideas: [
      {
        id: "idea-b",
        idea: "For audience B",
        content_id: "b",
        created_at: new Date().toISOString(),
      },
    ],
  });
  s.reopen(saved);
  s.setDraftText("Revised A");
  s.saveDraft();
  expect(useContentStore.getState().history[0]).toMatchObject({
    niche: "Audience A",
    tone: "professional",
    prompt: saved.prompt,
  });
  expect(useContentStore.getState().generationBrief?.niche).toBe("Audience A");
  expect(useContentStore.getState().ideas).toEqual([]);
});

it("persists the actual reviewed text separately from subsequent edits", () => {
  const memory = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
    },
  });
  const s = useContentStore.getState();
  s.setTweetToAnalyze("Original text");
  s.setAnalysisResult({
    score: 7,
    verdict: "Review",
    strengths: [],
    weaknesses: [],
    improved: "Original text",
    hashtags: [],
    source: "sample",
  });
  s.setTweetToAnalyze("Later edits");
  useContentStore.setState({ analysisResult: null });
  s.hydrateWorkspace();
  expect(useContentStore.getState()).toMatchObject({
    tweetToAnalyze: "Later edits",
    analysisText: "Original text",
  });
});
afterEach(() => vi.unstubAllGlobals());

it("updates a saved draft rather than duplicating it", () => {
  const store = useContentStore.getState();
  expect(typeof store.openDraft).toBe("function");
  store.openDraft({
    id: "draft-1",
    tweet: "First version",
    hashtags: [],
    tip: "",
    source: "sample",
  });
  useContentStore.getState().saveDraft();
  useContentStore.getState().setDraftText("Revised version");
  useContentStore.getState().saveDraft();
  expect(useContentStore.getState().history).toHaveLength(1);
  expect(useContentStore.getState().history[0].output).toBe("Revised version");
});

it("keeps an edited draft in history when another idea is opened", () => {
  const store = useContentStore.getState();
  expect(typeof store.openDraft).toBe("function");
  store.openDraft({
    id: "draft-a",
    tweet: "Keep these edits",
    hashtags: [],
    tip: "",
    source: "sample",
  });
  useContentStore.getState().openDraft({
    id: "draft-b",
    tweet: "Another draft",
    hashtags: [],
    tip: "",
    source: "sample",
  });
  expect(
    useContentStore.getState().history.find((item) => item.id === "draft-a")
      ?.output,
  ).toBe("Keep these edits");
});

it("reopens the exact edited draft with its hashtags", () => {
  const store = useContentStore.getState();
  expect(typeof store.openDraft).toBe("function");
  store.openDraft({
    id: "draft-1",
    tweet: "My actual words",
    hashtags: ["Writing"],
    tip: "",
    source: "sample",
  });
  useContentStore.getState().saveDraft();
  const saved = useContentStore.getState().history[0];
  useContentStore.setState({ draft: null });
  expect(useContentStore.getState().reopen(saved)).toBe(true);
  expect(useContentStore.getState().draft?.tweet).toBe("My actual words");
  expect(useContentStore.getState().draft?.hashtags).toEqual(["Writing"]);
});

it("persists saved work across a workspace reload", () => {
  const memory = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
    },
  });
  const store = useContentStore.getState();
  expect(typeof store.openDraft).toBe("function");
  store.openDraft({
    id: "draft-1",
    tweet: "Still here after reload",
    hashtags: [],
    tip: "",
    source: "sample",
  });
  useContentStore.getState().saveDraft();
  useContentStore.setState({ history: [], draft: null });
  useContentStore.getState().hydrateWorkspace();
  expect(useContentStore.getState().history[0].output).toBe(
    "Still here after reload",
  );
});

it("shows a storage failure without losing the in-memory draft", () => {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: () => null,
      setItem: () => {
        throw new Error("Quota exceeded");
      },
    },
  });
  const store = useContentStore.getState();
  expect(typeof store.openDraft).toBe("function");
  store.openDraft({
    id: "draft-1",
    tweet: "Do not lose this",
    hashtags: [],
    tip: "",
    source: "sample",
  });
  expect(useContentStore.getState().draft?.tweet).toBe("Do not lose this");
  expect(useContentStore.getState().storageError).toBeTruthy();
});
