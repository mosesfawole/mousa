"use client";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useContentStore } from "@/store/useContentStore";
import { postContent, errorMessage } from "@/lib/browser-api";
import ToneSelector from "@/components/ui/ToneSelector";
import type { GenerateResponse } from "@/types";
export default function GeneratorForm({ sampleMode }: { sampleMode: boolean }) {
  const s = useContentStore();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!s.niche.trim() || s.isGenerating || s.isExpanding) return;
    const brief = {
      niche: s.niche.trim(),
      tone: s.tone,
      topic: s.topic.trim(),
    };
    s.setIsGenerating(true);
    s.setGenerateError(null);
    try {
      const data = await postContent<GenerateResponse>("/api/generate", {
        ...brief,
        mode: sampleMode ? "sample" : "live",
      });
      s.acceptGeneration(data, brief);
    } catch (error) {
      s.setGenerateError(errorMessage(error));
    } finally {
      s.setIsGenerating(false);
    }
  }
  const busy = s.isGenerating || s.isExpanding;
  return (
    <form onSubmit={submit} aria-label="Writing brief">
      <div className="field">
        <label htmlFor="niche">Who are you writing for?</label>
        <input
          id="niche"
          className="mousa-input"
          placeholder="e.g. developers building side projects"
          value={s.niche}
          onChange={(e) => s.setNiche(e.target.value)}
          maxLength={200}
          required
          disabled={busy}
        />
        <span className="field-help">
          Your audience, niche, or the things you know well.
        </span>
      </div>
      <div className="field">
        <label htmlFor="topic">
          What’s on your mind? <span>Optional</span>
        </label>
        <textarea
          id="topic"
          className="mousa-input"
          rows={3}
          placeholder="A lesson, an opinion, a tiny win..."
          value={s.topic}
          onChange={(e) => s.setTopic(e.target.value)}
          maxLength={500}
          disabled={busy}
        />
      </div>
      <ToneSelector disabled={busy} />
      {s.generateError && (
        <div className="error-box" role="alert">
          {s.generateError}
        </div>
      )}
      <button
        className="btn btn-violet"
        style={{ width: "100%" }}
        type="submit"
        disabled={busy || !s.niche.trim()}
      >
        {s.isGenerating ? (
          <>
            <Loader2 className="spin" size={14} /> Finding a few angles…
          </>
        ) : (
          <>
            <Sparkles size={14} />
            {sampleMode ? "Explore sample ideas" : "Find five ideas"}
            <ArrowRight size={14} />
          </>
        )}
      </button>
      <p className="brief-footnote">
        {sampleMode
          ? "Five illustrative angles. Yours to explore."
          : "AI suggestions are a starting point. Your judgement comes next."}
      </p>
    </form>
  );
}
