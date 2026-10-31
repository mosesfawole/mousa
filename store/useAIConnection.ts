"use client";
import { create } from "zustand";
import { isValidAPIKey, type AIProvider } from "@/lib/ai-config";

interface AIConnection {
  provider: AIProvider;
  apiKey: string;
  sampleMode: boolean;
  connect: (provider: AIProvider, apiKey: string) => boolean;
  disconnect: () => void;
  setSampleMode: (sample: boolean) => void;
}

// Intentionally separate from the persisted workspace: credentials live in tab memory only.
export const useAIConnection = create<AIConnection>((set) => ({
  provider: "anthropic",
  apiKey: "",
  sampleMode: true,
  connect: (provider, value) => {
    const apiKey = value.trim();
    if (!isValidAPIKey(provider, apiKey)) return false;
    set({ provider, apiKey, sampleMode: false });
    return true;
  },
  disconnect: () => set({ apiKey: "", sampleMode: true }),
  setSampleMode: (sampleMode) => set({ sampleMode }),
}));
