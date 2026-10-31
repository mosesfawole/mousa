"use client";
import {
  ScanLine,
  Loader2,
  ArrowUpRight,
  CheckCircle2,
  PencilLine,
  Feather,
} from "lucide-react";
import { useContentStore } from "@/store/useContentStore";
import { postContent, errorMessage } from "@/lib/browser-api";
import ScoreRing from "@/components/ui/ScoreRing";
import type { AnalyzeResponse } from "@/types";
export default function AnalyzerForm({ sampleMode }: { sampleMode: boolean }) {
  const s = useContentStore();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!s.tweetToAnalyze.trim() || s.isAnalyzing) return;
    const tweet = s.tweetToAnalyze.trim(),
      niche = s.analyzeNiche.trim();
    s.setIsAnalyzing(true);
    s.setAnalyzeError(null);
    try {
      const result = await postContent<AnalyzeResponse>("/api/analyze", {
        tweet,
        niche,
        mode: sampleMode ? "sample" : "live",
      });
      s.setAnalysisResult(result, tweet, niche);
      s.addHistory({
        id: crypto.randomUUID(),
        type: "analysis",
        niche,
        prompt: tweet,
        output: JSON.stringify(result),
        score: result.score,
        source: result.source,
        platform: "twitter",
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      s.setAnalyzeError(errorMessage(error));
    } finally {
      s.setIsAnalyzing(false);
    }
  }
  const result = s.analysisResult;
  return (
    <div className="studio-grid">
      <section className="panel brief-panel">
        <div className="panel-heading">
          <h2>A thoughtful second look</h2>
          <span className="step-tag">02</span>
        </div>
        <form onSubmit={submit} aria-label="Review a draft">
          <div className="field">
            <label htmlFor="review-text">The words you’re working on</label>
            <textarea
              id="review-text"
              className="mousa-input"
              rows={7}
              value={s.tweetToAnalyze}
              onChange={(e) => s.setTweetToAnalyze(e.target.value)}
              placeholder="Paste a draft, or bring one over from Create…"
              maxLength={2000}
              required
              disabled={s.isAnalyzing}
            />
            <span className="field-help">
              {Array.from(s.tweetToAnalyze).length} characters · up to 2,000 for
              review
            </span>
          </div>
          <div className="field">
            <label htmlFor="review-niche">
              Your audience <span>Optional</span>
            </label>
            <input
              id="review-niche"
              className="mousa-input"
              value={s.analyzeNiche}
              onChange={(e) => s.setAnalyzeNiche(e.target.value)}
              placeholder="Who should this resonate with?"
              maxLength={200}
              disabled={s.isAnalyzing}
            />
          </div>
          {s.analyzeError && (
            <div className="error-box" role="alert">
              {s.analyzeError}
            </div>
          )}
          <button
            className="btn btn-violet"
            style={{ width: "100%" }}
            disabled={s.isAnalyzing || !s.tweetToAnalyze.trim()}
          >
            {s.isAnalyzing ? (
              <>
                <Loader2 size={14} className="spin" /> Taking a closer look…
              </>
            ) : (
              <>
                <ScanLine size={14} />
                {sampleMode ? "Explore a sample review" : "Review this draft"}
                <ArrowUpRight size={14} />
              </>
            )}
          </button>
          <p className="brief-footnote">
            {sampleMode
              ? "Example feedback, not an assessment of your writing."
              : "A subjective writing review, not an engagement forecast."}
          </p>
        </form>
      </section>
      <div className="result-column">
        <div className="result-header">
          <h2>A fresh perspective</h2>
          <span>
            {result?.source === "sample"
              ? "Illustrative sample"
              : result
                ? "Writing feedback"
                : "Clarity over cleverness"}
          </span>
        </div>
        {s.isAnalyzing ? (
          <div
            className="skeleton"
            role="status"
            aria-label="Reviewing your draft"
          >
            <div className="skeleton-line" style={{ width: "80%" }} />
            <div className="skeleton-line" style={{ width: "65%" }} />
            <div className="skeleton-line" style={{ width: "90%" }} />
          </div>
        ) : result ? (
          <section className="panel review-panel" aria-label="Writing review">
            <div className="review-summary">
              <ScoreRing score={result.score} />
              <div>
                <p className="eyebrow" style={{ marginBottom: 9 }}>
                  {result.source === "sample"
                    ? "Example writing score"
                    : "Writing score"}
                </p>
                <p>{result.verdict}</p>
              </div>
            </div>
            {(s.tweetToAnalyze.trim() !== s.analysisText ||
              s.analyzeNiche.trim() !== s.analysisNiche) && (
              <p className="field-help" style={{ marginTop: 16 }} role="status">
                You’ve edited the draft or audience since this review. Review it
                again for updated feedback.
              </p>
            )}
            <div className="feedback-grid">
              <div>
                <h3 style={{ color: "var(--green)" }}>
                  <CheckCircle2 size={13} />
                  What’s working
                </h3>
                <ul>
                  {result.strengths.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 style={{ color: "#927747" }}>
                  <PencilLine size={13} />
                  Room to refine
                </h3>
                <ul>
                  {result.weaknesses.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="improved-post">
              <h3>
                {result.source === "sample"
                  ? "Your draft, for reference"
                  : "Another way to say it"}
              </h3>
              <p>{result.improved}</p>
              {!!result.hashtags.length && (
                <div className="tag-list">
                  {result.hashtags.map((tag) => (
                    <span className="tag" key={tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <button
                className="text-button"
                style={{ marginTop: 16 }}
                onClick={() => {
                  s.openDraft({
                    id: crypto.randomUUID(),
                    brief: { niche: s.analysisNiche, tone: "casual" },
                    prompt: "A draft from your review",
                    tweet: result.improved,
                    hashtags: result.hashtags,
                    tip: "Keep the changes that sound like you.",
                    source: result.source || "sample",
                  });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Open in the editor <ArrowUpRight size={14} />
              </button>
            </div>
          </section>
        ) : (
          <div className="empty-state">
            <span className="empty-symbol">
              <Feather size={31} strokeWidth={1.2} />
            </span>
            <h3 className="serif">A second pair of eyes.</h3>
            <p>
              Bring a draft. Look at the opening, the structure, and the details
              that make it yours.
            </p>
          </div>
        )}
        <span className="sr-only" role="status">
          {!s.isAnalyzing && result ? "Your writing review is ready." : ""}
        </span>
      </div>
    </div>
  );
}
