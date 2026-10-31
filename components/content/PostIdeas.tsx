"use client";
import { useEffect, useState } from "react";
import {
  Feather,
  ArrowUpRight,
  Loader2,
  Lightbulb,
  Copy,
  Check,
  Bookmark,
  ScanLine,
} from "lucide-react";
import { useContentStore } from "@/store/useContentStore";
import { useAIConnection } from "@/store/useAIConnection";
import {
  postContent,
  errorMessage,
  copyText,
  composePost,
} from "@/lib/browser-api";
import type { Idea, ExpandResponse } from "@/types";
export default function PostIdeas({ sampleMode }: { sampleMode: boolean }) {
  const s = useContentStore();
  const [expandError, setExpandError] = useState<string | null>(null);
  const [expandingId, setExpandingId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [includeTags, setIncludeTags] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    return useAIConnection.subscribe(() => setExpandError(null));
  }, []);
  const ideasLabel =
    s.generationSource === "sample"
      ? "Sample ideas"
      : s.generationSource === "live"
        ? "AI-assisted ideas"
        : "Saved ideas";
  function focusDraft() {
    setTimeout(() => document.getElementById("draft-text")?.focus(), 0);
  }
  async function expand(idea: Idea) {
    if (s.isExpanding || s.isGenerating) return;
    if (s.draft?.id === `draft-${idea.id}`) {
      focusDraft();
      return;
    }
    const existing = s.history.find(
      (item) => item.id === `draft-${idea.id}` && item.type === "tweet",
    );
    if (existing) {
      s.reopen(existing);
      focusDraft();
      setTimeout(
        () =>
          document
            .getElementById("draft-panel")
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        0,
      );
      return;
    }
    s.setIsExpanding(true);
    setExpandingId(idea.id);
    setExpandError(null);
    try {
      const brief = s.generationBrief || { niche: s.niche, tone: s.tone };
      const data = await postContent<ExpandResponse>("/api/expand", {
        idea: idea.idea,
        niche: brief.niche,
        tone: brief.tone,
        mode: sampleMode ? "sample" : "live",
      });
      s.openDraft({
        id: `draft-${idea.id}`,
        ideaId: idea.id,
        brief,
        prompt: idea.idea,
        tweet: data.tweet,
        hashtags: data.hashtags,
        tip: data.tip,
        source: data.source || "sample",
      });
      setNotice("");
      setCopyStatus("idle");
      setIncludeTags(false);
      focusDraft();
      setTimeout(
        () =>
          document
            .getElementById("draft-panel")
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        0,
      );
    } catch (error) {
      setExpandError(errorMessage(error));
    } finally {
      s.setIsExpanding(false);
      setExpandingId(null);
    }
  }
  const draft = s.draft;
  const composed = draft
    ? composePost(draft.tweet, draft.hashtags, includeTags)
    : "";
  const count = Array.from(composed).length;
  const saved = s.history.find((item) => item.id === draft?.id);
  const isSaved =
    !!draft &&
    saved?.output === draft.tweet &&
    JSON.stringify(saved.hashtags || []) === JSON.stringify(draft.hashtags);
  async function copy() {
    if (!draft) return;
    try {
      await copyText(composed);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }
  return (
    <div className="result-column">
      <div className="result-header">
        <h2>Your next starting point</h2>
        <span>
          {s.isGenerating
            ? "Finding angles…"
            : s.ideas.length
              ? `${ideasLabel} · ${s.ideas.length}`
              : "A little room to think"}
        </span>
      </div>
      {s.isGenerating ? (
        <div role="status" aria-label="Finding ideas">
          {[0, 1, 2].map((i) => (
            <div className="skeleton" key={i}>
              <div className="skeleton-line" style={{ width: "85%" }} />
              <div
                className="skeleton-line"
                style={{ width: "65%", marginBottom: 0 }}
              />
            </div>
          ))}
        </div>
      ) : s.ideas.length ? (
        <div className="idea-list" aria-label={ideasLabel}>
          {s.ideas.map((idea, index) => (
            <article
              className={`idea-card ${draft?.ideaId === idea.id ? "selected" : ""}`}
              key={idea.id}
            >
              <span className="idea-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{idea.idea}</h3>
                {idea.hook && <p className="idea-hook">{idea.hook}</p>}
                <div className="idea-actions">
                  <button
                    className="text-button"
                    disabled={s.isExpanding}
                    onClick={() => expand(idea)}
                    aria-label={`Write draft for idea ${index + 1}`}
                  >
                    {expandingId === idea.id ? (
                      <>
                        <Loader2 size={12} className="spin" /> Shaping a draft…
                      </>
                    ) : (
                      <>
                        Make it a draft <ArrowUpRight size={13} />
                      </>
                    )}
                  </button>
                  <small>
                    {s.generationBrief ? "An angle, not a script" : ""}
                  </small>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-symbol">
            <Feather size={32} strokeWidth={1.2} />
          </span>
          <h3 className="serif">Your ideas belong here.</h3>
          <p>
            Start with who you’re writing for and what’s on your mind. We’ll
            find a few ways into it.
          </p>
        </div>
      )}
      <span role="status" className="sr-only">
        {!s.isGenerating && s.ideas.length
          ? `${s.ideas.length} ideas are ready. Choose an idea to write a draft.`
          : ""}
      </span>
      {expandError && (
        <div role="alert" className="error-box">
          {expandError}
        </div>
      )}
      {!draft && (
        <div className="writing-tip">
          <Lightbulb size={15} />
          <p>
            <strong>A small writing thought.</strong> The most interesting post
            is often the thing you almost didn’t share.
          </p>
        </div>
      )}
      {draft && (
        <section
          className="panel draft-panel"
          id="draft-panel"
          aria-label="Draft editor"
        >
          <div className="panel-heading">
            <h2>Make it sound like you.</h2>
            <span className="mode-pill">
              {draft.source === "sample" ? "Sample draft" : "AI-assisted draft"}
            </span>
          </div>
          {draft.source === "sample" && (
            <p className="field-help" style={{ marginBottom: 13 }}>
              An illustrative story. Replace the details with your own
              experience before sharing.
            </p>
          )}
          <label htmlFor="draft-text" className="sr-only">
            Edit your draft
          </label>
          <textarea
            id="draft-text"
            className="mousa-input draft-editor"
            value={draft.tweet}
            onChange={(e) => {
              s.setDraftText(e.target.value);
              setCopyStatus("idle");
              setNotice("");
            }}
            maxLength={2000}
            rows={5}
          />
          <div className="draft-meta">
            <span>Room to edit. Nothing is posted automatically.</span>
            <span className={count > 280 ? "over-limit" : ""}>
              {count} / 280
            </span>
          </div>
          {!!draft.hashtags.length && (
            <>
              <div className="tag-list">
                {draft.hashtags.map((tag) => (
                  <span className="tag" key={tag}>
                    #{tag}
                  </span>
                ))}
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                  color: "var(--muted)",
                }}
              >
                <input
                  type="checkbox"
                  checked={includeTags}
                  onChange={(e) => {
                    setIncludeTags(e.target.checked);
                    setCopyStatus("idle");
                  }}
                />
                Include hashtags when copying
              </label>
            </>
          )}
          <p className="field-help">
            Length guide includes selected hashtags. X may count links and some
            characters differently.
          </p>
          {count > 280 && (
            <p className="field-help over-limit" role="status">
              This draft is over the usual post length. Trim it before sharing.
            </p>
          )}
          <div className="draft-actions">
            <button
              className="btn btn-primary"
              onClick={copy}
              disabled={!draft.tweet.trim()}
            >
              {copyStatus === "copied" ? (
                <Check size={13} />
              ) : (
                <Copy size={13} />
              )}{" "}
              {copyStatus === "copied" ? "Copied" : "Copy post"}
            </button>
            <button
              className="btn"
              onClick={() => {
                if (s.saveDraft()) setNotice("Draft saved in this browser.");
              }}
              disabled={!draft.tweet.trim() || isSaved}
            >
              <Bookmark size={13} />
              {isSaved ? "Saved" : "Save draft"}
            </button>
            <button
              className="btn btn-quiet"
              disabled={!draft.tweet.trim()}
              onClick={() => {
                s.setTweetToAnalyze(draft.tweet);
                s.setAnalyzeNiche(
                  draft.brief?.niche || s.generationBrief?.niche || s.niche,
                );
                s.setAnalysisResult(null);
                s.setActiveTab("analyze");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <ScanLine size={13} />
              Review
            </button>
          </div>
          {copyStatus === "error" && (
            <p role="alert" className="error-box">
              Copy isn’t available in this browser. Select the draft text and
              copy it manually.
            </p>
          )}
          {notice && (
            <p role="status" className="notice" style={{ marginTop: 12 }}>
              {notice}
            </p>
          )}
          {draft.tip && (
            <div
              className="writing-tip"
              style={{ padding: "16px 0 0", borderBottom: 0 }}
            >
              <Lightbulb size={14} />
              <p>{draft.tip}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
