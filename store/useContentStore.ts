"use client";
import { create } from "zustand";
import type {
  Tone,
  Idea,
  AnalyzeResponse,
  GenerateInput,
  GenerateResponse,
  Content,
  Draft,
  ContentSource,
} from "@/types";
type Tab = "generate" | "analyze" | "history";
interface ContentStore {
  activeTab: Tab;
  niche: string;
  tone: Tone;
  topic: string;
  ideas: Idea[];
  generationBrief: GenerateInput | null;
  generationSource: ContentSource | null;
  draft: Draft | null;
  isGenerating: boolean;
  isExpanding: boolean;
  generateError: string | null;
  tweetToAnalyze: string;
  analyzeNiche: string;
  analysisResult: AnalyzeResponse | null;
  analysisText: string;
  analysisNiche: string;
  isAnalyzing: boolean;
  analyzeError: string | null;
  history: Content[];
  historyLoaded: boolean;
  storageError: string | null;
  setActiveTab: (v: Tab) => void;
  setNiche: (v: string) => void;
  setTone: (v: Tone) => void;
  setTopic: (v: string) => void;
  setIdeas: (v: Idea[]) => void;
  setIsGenerating: (v: boolean) => void;
  setIsExpanding: (v: boolean) => void;
  setGenerateError: (v: string | null) => void;
  setTweetToAnalyze: (v: string) => void;
  setAnalyzeNiche: (v: string) => void;
  setAnalysisResult: (
    v: AnalyzeResponse | null,
    text?: string,
    niche?: string,
  ) => void;
  setIsAnalyzing: (v: boolean) => void;
  setAnalyzeError: (v: string | null) => void;
  clearGenerator: () => void;
  clearAnalyzer: () => void;
  hydrateWorkspace: () => void;
  acceptGeneration: (data: GenerateResponse, brief: GenerateInput) => void;
  openDraft: (draft: Draft) => void;
  setDraftText: (v: string) => void;
  setDraftHashtags: (v: string[]) => void;
  saveDraft: () => boolean;
  addHistory: (item: Content) => void;
  deleteHistory: (id: string) => void;
  reopen: (item: Content) => boolean;
}
const storageKey = "mousa-workspace-v2";
function isIdea(value: unknown): value is Idea {
  return (
    !!value &&
    typeof value === "object" &&
    "id" in value &&
    typeof value.id === "string" &&
    "idea" in value &&
    typeof value.idea === "string" &&
    (!("hook" in value) || typeof value.hook === "string")
  );
}
function isHistory(value: unknown): value is Content {
  return (
    !!value &&
    typeof value === "object" &&
    "id" in value &&
    typeof value.id === "string" &&
    "type" in value &&
    ["idea", "tweet", "analysis"].includes(String(value.type)) &&
    "prompt" in value &&
    typeof value.prompt === "string" &&
    "output" in value &&
    typeof value.output === "string" &&
    "created_at" in value &&
    typeof value.created_at === "string" &&
    Number.isFinite(Date.parse(value.created_at))
  );
}
function isDraft(value: unknown): value is Draft {
  return (
    !!value &&
    typeof value === "object" &&
    "id" in value &&
    typeof value.id === "string" &&
    "tweet" in value &&
    typeof value.tweet === "string" &&
    "hashtags" in value &&
    Array.isArray(value.hashtags) &&
    value.hashtags.every((tag) => typeof tag === "string") &&
    "source" in value &&
    ["sample", "live"].includes(String(value.source))
  );
}
function isAnalysis(value: unknown): value is AnalyzeResponse {
  return (
    !!value &&
    typeof value === "object" &&
    "score" in value &&
    typeof value.score === "number" &&
    value.score >= 1 &&
    value.score <= 10 &&
    "verdict" in value &&
    typeof value.verdict === "string" &&
    "improved" in value &&
    typeof value.improved === "string" &&
    "strengths" in value &&
    Array.isArray(value.strengths) &&
    value.strengths.every((s) => typeof s === "string") &&
    "weaknesses" in value &&
    Array.isArray(value.weaknesses) &&
    value.weaknesses.every((s) => typeof s === "string") &&
    "hashtags" in value &&
    Array.isArray(value.hashtags) &&
    value.hashtags.every((s) => typeof s === "string")
  );
}
export const useContentStore = create<ContentStore>((set, get) => {
  const commit = (patch: Partial<ContentStore>) => {
    set(patch);
    if (typeof window === "undefined") return;
    const s = get();
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          version: 2,
          activeTab: s.activeTab,
          niche: s.niche,
          tone: s.tone,
          topic: s.topic,
          ideas: s.ideas,
          generationBrief: s.generationBrief,
          generationSource: s.generationSource,
          draft: s.draft,
          tweetToAnalyze: s.tweetToAnalyze,
          analyzeNiche: s.analyzeNiche,
          analysisResult: s.analysisResult,
          analysisText: s.analysisText,
          analysisNiche: s.analysisNiche,
          history: s.history,
        }),
      );
      if (s.storageError) set({ storageError: null });
    } catch {
      set({
        storageError:
          "Browser storage is unavailable or full. Your work is still on this page; copy it before leaving.",
      });
    }
  };
  const addHistory = (item: Content) =>
    commit({
      history: [item, ...get().history.filter((h) => h.id !== item.id)].slice(
        0,
        50,
      ),
    });
  const saveDraft = () => {
    const s = get(),
      draft = s.draft;
    if (!draft?.tweet.trim()) return false;
    addHistory({
      id: draft.id,
      type: "tweet",
      niche: draft.brief?.niche || s.generationBrief?.niche || s.niche,
      tone: draft.brief?.tone || s.generationBrief?.tone || s.tone,
      prompt:
        draft.prompt ||
        s.ideas.find((i) => i.id === draft.ideaId)?.idea ||
        "Your draft",
      brief: draft.brief,
      ideaId: draft.ideaId,
      output: draft.tweet,
      hashtags: draft.hashtags,
      platform: "twitter",
      source: draft.source,
      created_at: new Date().toISOString(),
    });
    return true;
  };
  return {
    activeTab: "generate",
    niche: "",
    tone: "casual",
    topic: "",
    ideas: [],
    generationBrief: null,
    generationSource: null,
    draft: null,
    isGenerating: false,
    isExpanding: false,
    generateError: null,
    tweetToAnalyze: "",
    analyzeNiche: "",
    analysisResult: null,
    analysisText: "",
    analysisNiche: "",
    isAnalyzing: false,
    analyzeError: null,
    history: [],
    historyLoaded: false,
    storageError: null,
    setActiveTab: (v) => commit({ activeTab: v }),
    setNiche: (v) => commit({ niche: v }),
    setTone: (v) => commit({ tone: v }),
    setTopic: (v) => commit({ topic: v }),
    setIdeas: (v) => commit({ ideas: v, generationSource: null }),
    setIsGenerating: (v) => set({ isGenerating: v }),
    setIsExpanding: (v) => set({ isExpanding: v }),
    setGenerateError: (v) => set({ generateError: v }),
    setTweetToAnalyze: (v) => commit({ tweetToAnalyze: v }),
    setAnalyzeNiche: (v) => commit({ analyzeNiche: v }),
    setAnalysisResult: (v, text, niche) =>
      commit({
        analysisResult: v,
        analysisText: v ? (text ?? get().tweetToAnalyze).trim() : "",
        analysisNiche: v ? (niche ?? get().analyzeNiche).trim() : "",
      }),
    setIsAnalyzing: (v) => set({ isAnalyzing: v }),
    setAnalyzeError: (v) => set({ analyzeError: v }),
    clearGenerator: () => {
      saveDraft();
      commit({
        ideas: [],
        generationSource: null,
        draft: null,
        generateError: null,
      });
    },
    clearAnalyzer: () =>
      commit({
        tweetToAnalyze: "",
        analysisResult: null,
        analysisText: "",
        analysisNiche: "",
        analyzeError: null,
      }),
    hydrateWorkspace: () => {
      if (typeof window === "undefined") return;
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          const saved = JSON.parse(raw) as Record<string, unknown>;
          if (saved.version !== 2) throw new Error("Unsupported workspace");
          const patch: Partial<ContentStore> = {};
          if (
            ["generate", "analyze", "history"].includes(String(saved.activeTab))
          )
            patch.activeTab = saved.activeTab as Tab;
          if (typeof saved.niche === "string")
            patch.niche = saved.niche.slice(0, 200);
          if (typeof saved.topic === "string")
            patch.topic = saved.topic.slice(0, 500);
          if (
            ["casual", "professional", "funny", "educational"].includes(
              String(saved.tone),
            )
          )
            patch.tone = saved.tone as Tone;
          if (Array.isArray(saved.ideas))
            patch.ideas = saved.ideas.filter(isIdea).slice(0, 5);
          if (isDraft(saved.draft)) patch.draft = saved.draft;
          if (Array.isArray(saved.history))
            patch.history = saved.history.filter(isHistory).slice(0, 50);
          const matchingHistory = patch.history?.find(
            (item) =>
              item.type === "idea" &&
              patch.ideas?.length &&
              patch.ideas.every((idea) => idea.content_id === item.id),
          );
          const source = saved.generationSource ?? matchingHistory?.source;
          patch.generationSource =
            source === "sample" || source === "live" ? source : null;
          if (typeof saved.tweetToAnalyze === "string")
            patch.tweetToAnalyze = saved.tweetToAnalyze.slice(0, 2000);
          if (typeof saved.analyzeNiche === "string")
            patch.analyzeNiche = saved.analyzeNiche.slice(0, 200);
          if (isAnalysis(saved.analysisResult))
            patch.analysisResult = saved.analysisResult;
          patch.analysisText =
            typeof saved.analysisText === "string" ? saved.analysisText : "";
          patch.analysisNiche =
            typeof saved.analysisNiche === "string" ? saved.analysisNiche : "";
          if (
            saved.generationBrief &&
            typeof saved.generationBrief === "object" &&
            "niche" in saved.generationBrief &&
            typeof saved.generationBrief.niche === "string" &&
            "tone" in saved.generationBrief &&
            ["casual", "professional", "funny", "educational"].includes(
              String(saved.generationBrief.tone),
            )
          )
            patch.generationBrief = saved.generationBrief as GenerateInput;
          set(patch);
        }
        set({ historyLoaded: true });
      } catch {
        set({
          historyLoaded: true,
          storageError:
            "Your saved workspace could not be loaded. You can keep writing here; copy new work before leaving.",
        });
      }
    },
    acceptGeneration: (data, brief) => {
      saveDraft();
      commit({
        ideas: data.ideas,
        generationBrief: brief,
        generationSource: data.source,
        draft: null,
        generateError: null,
      });
      addHistory({
        id: data.contentId,
        type: "idea",
        niche: brief.niche,
        tone: brief.tone,
        prompt: brief.topic || brief.niche,
        output: JSON.stringify({ ideas: data.ideas }),
        ideas: data.ideas,
        platform: "twitter",
        source: data.source,
        created_at: new Date().toISOString(),
      });
    },
    openDraft: (draft) => {
      if (get().draft?.id === draft.id) {
        commit({ activeTab: "generate" });
        return;
      }
      saveDraft();
      const brief = draft.brief ||
        get().generationBrief || {
          niche: get().niche,
          tone: get().tone,
          topic: get().topic,
        };
      const previousBrief = get().generationBrief;
      const sameBrief =
        previousBrief?.niche === brief.niche &&
        previousBrief?.tone === brief.tone &&
        (previousBrief?.topic || "") === (brief.topic || "");
      commit({
        draft: { ...draft, brief },
        activeTab: "generate",
        generationBrief: brief,
        niche: brief.niche,
        tone: brief.tone,
        topic: brief.topic || "",
        ideas: sameBrief ? get().ideas : [],
        generationSource: sameBrief ? get().generationSource : null,
      });
    },
    setDraftText: (v) => {
      const draft = get().draft;
      if (draft) commit({ draft: { ...draft, tweet: v } });
    },
    setDraftHashtags: (v) => {
      const draft = get().draft;
      if (draft) commit({ draft: { ...draft, hashtags: v } });
    },
    saveDraft,
    addHistory,
    deleteHistory: (id) =>
      commit({ history: get().history.filter((item) => item.id !== id) }),
    reopen: (item) => {
      try {
        if (item.type === "tweet") {
          get().openDraft({
            id: item.id,
            ideaId: item.ideaId,
            brief: item.brief || {
              niche: item.niche || "",
              tone: item.tone || "casual",
            },
            prompt: item.prompt,
            tweet: item.output,
            hashtags: Array.isArray(item.hashtags) ? item.hashtags : [],
            tip: "A saved draft. Keep shaping it in your own voice.",
            source: item.source || "sample",
          });
          return true;
        }
        if (item.type === "idea") {
          const parsed = JSON.parse(item.output);
          if (!Array.isArray(parsed.ideas) || !parsed.ideas.every(isIdea))
            return false;
          saveDraft();
          commit({
            activeTab: "generate",
            niche: item.niche || "",
            tone: item.tone || "casual",
            topic: item.prompt,
            ideas: parsed.ideas,
            generationSource:
              item.source === "sample" || item.source === "live"
                ? item.source
                : null,
            generationBrief: {
              niche: item.niche || "",
              tone: item.tone || "casual",
              topic: item.prompt,
            },
            draft: null,
          });
          return true;
        }
        const result: unknown = JSON.parse(item.output);
        if (!isAnalysis(result)) return false;
        commit({
          activeTab: "analyze",
          tweetToAnalyze: item.prompt,
          analyzeNiche: item.niche || "",
          analysisResult: result,
          analysisText: item.prompt.trim(),
          analysisNiche: (item.niche || "").trim(),
        });
        return true;
      } catch {
        return false;
      }
    },
  };
});
