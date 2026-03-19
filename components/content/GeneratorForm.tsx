"use client";
import { useState } from "react";
import { Wand2, Loader2, Sparkles } from "lucide-react";
import { useContentStore } from "@/store/useContentStore";
import ToneSelector from "@/components/ui/ToneSelector";

export default function GeneratorForm() {
  const {
    niche,
    setNiche,
    tone,
    topic,
    setTopic,
    setIdeas,
    setIsGenerating,
    isGenerating,
    generateError,
    setGenerateError,
    clearGenerator,
  } = useContentStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return;

    setIsGenerating(true);
    setGenerateError(null);
    clearGenerator();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, tone, topic }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setIdeas(data.ideas);
    } catch (err: any) {
      setGenerateError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Niche input */}
      <div className="space-y-2">
        <label
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Your niche
          <span
            className="ml-1 text-xs"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            (who are you and what do you talk about?)
          </span>
        </label>
        <input
          type="text"
          placeholder="e.g. frontend developer sharing tips, fitness coach, startup founder..."
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className="mousa-input"
          required
        />
      </div>

      {/* Tone selector */}
      <ToneSelector />

      {/* Optional topic */}
      <div className="space-y-2">
        <label
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Specific topic
          <span
            className="ml-1 text-xs"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            (optional — leave blank for variety)
          </span>
        </label>
        <input
          type="text"
          placeholder="e.g. TypeScript tips, morning routines, fundraising..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mousa-input"
        />
      </div>

      {/* Error */}
      {generateError && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(255,77,109,0.1)",
            border: "1px solid rgba(255,77,109,0.2)",
            color: "#ff6b8a",
          }}
        >
          {generateError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isGenerating || !niche.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating ideas...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate Post Ideas
          </>
        )}
      </button>
    </form>
  );
}
