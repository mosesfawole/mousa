"use client";
import { create } from "zustand";
import type { Tone, Idea, AnalyzeResponse } from "@/types";

type Tab = "generate" | "analyze" | "history";

interface ContentStore {
  // ── Active tab ─────────────────────────────────────────
  activeTab: Tab;

  // ── Generator state ────────────────────────────────────
  niche: string; // user's niche e.g. "frontend developer"
  tone: Tone; // selected tone
  topic: string; // optional specific topic
  ideas: Idea[]; // generated ideas for current session
  expandedIdea: Idea | null; // the idea currently being expanded
  isGenerating: boolean;
  isExpanding: boolean;
  generateError: string | null;

  // ── Analyzer state ─────────────────────────────────────
  tweetToAnalyze: string;
  analyzeNiche: string;
  analysisResult: AnalyzeResponse | null;
  isAnalyzing: boolean;
  analyzeError: string | null;

  // ── History state ───────────────────────────────────────
  historyLoaded: boolean;

  // ── Actions ────────────────────────────────────────────
  setActiveTab: (tab: Tab) => void;
  setNiche: (v: string) => void;
  setTone: (v: Tone) => void;
  setTopic: (v: string) => void;
  setIdeas: (ideas: Idea[]) => void;
  setExpandedIdea: (idea: Idea | null) => void;
  setIsGenerating: (v: boolean) => void;
  setIsExpanding: (v: boolean) => void;
  setGenerateError: (v: string | null) => void;
  setTweetToAnalyze: (v: string) => void;
  setAnalyzeNiche: (v: string) => void;
  setAnalysisResult: (v: AnalyzeResponse | null) => void;
  setIsAnalyzing: (v: boolean) => void;
  setAnalyzeError: (v: string | null) => void;
  setHistoryLoaded: (v: boolean) => void;
  clearGenerator: () => void;
  clearAnalyzer: () => void;
}

export const useContentStore = create<ContentStore>((set) => ({
  activeTab: "generate",

  // Generator defaults
  niche: "",
  tone: "casual",
  topic: "",
  ideas: [],
  expandedIdea: null,
  isGenerating: false,
  isExpanding: false,
  generateError: null,

  // Analyzer defaults
  tweetToAnalyze: "",
  analyzeNiche: "",
  analysisResult: null,
  isAnalyzing: false,
  analyzeError: null,

  // History
  historyLoaded: false,

  // Simple setters
  setActiveTab: (activeTab) => set({ activeTab }),
  setNiche: (niche) => set({ niche }),
  setTone: (tone) => set({ tone }),
  setTopic: (topic) => set({ topic }),
  setIdeas: (ideas) => set({ ideas }),
  setExpandedIdea: (expandedIdea) => set({ expandedIdea }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setIsExpanding: (isExpanding) => set({ isExpanding }),
  setGenerateError: (generateError) => set({ generateError }),
  setTweetToAnalyze: (tweetToAnalyze) => set({ tweetToAnalyze }),
  setAnalyzeNiche: (analyzeNiche) => set({ analyzeNiche }),
  setAnalysisResult: (analysisResult) => set({ analysisResult }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setAnalyzeError: (analyzeError) => set({ analyzeError }),
  setHistoryLoaded: (historyLoaded) => set({ historyLoaded }),

  // Reset generator to empty state
  clearGenerator: () =>
    set({
      ideas: [],
      expandedIdea: null,
      generateError: null,
      topic: "",
    }),

  // Reset analyzer to empty state
  clearAnalyzer: () =>
    set({
      tweetToAnalyze: "",
      analysisResult: null,
      analyzeError: null,
    }),
}));
