"use client";
import { useState } from "react";
import {
  Wand2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Hash,
} from "lucide-react";
import { useContentStore } from "@/store/useContentStore";
import type { Idea } from "@/types";

function IdeaCard({ idea, index }: { idea: Idea; index: number }) {
  const { niche, tone, setIdeas, ideas } = useContentStore();
  const [isExpanding, setIsExpanding] = useState(false);
  const [expanded, setExpanded] = useState<{
    tweet: string;
    hashtags: string[];
    tip: string;
  } | null>(null);
  const [showExpanded, setShowExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExpand = async () => {
    if (expanded) {
      setShowExpanded(!showExpanded);
      return;
    }

    setIsExpanding(true);
    setError(null);

    try {
      const res = await fetch("/api/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: idea.idea,
          niche,
          tone,
          ideaId: idea.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to expand");

      setExpanded(data);
      setShowExpanded(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExpanding(false);
    }
  };

  const copyTweet = async () => {
    if (!expanded) return;
    await navigator.clipboard.writeText(
      `${expanded.tweet}\n\n${expanded.hashtags.map((h) => `#${h}`).join(" ")}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Gradient colors cycling through for each card
  const gradients = [
    "rgba(124,58,237,0.15)",
    "rgba(244,114,182,0.12)",
    "rgba(96,165,250,0.12)",
    "rgba(52,211,153,0.12)",
    "rgba(251,191,36,0.12)",
  ];

  return (
    <div
      className="glass-hover rounded-2xl p-5 space-y-4 animate-slide-up"
      style={{
        background: gradients[index % gradients.length],
        border: "1px solid rgba(255,255,255,0.08)",
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Idea number + idea text */}
      <div className="flex items-start gap-3">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #c084fc)",
            color: "white",
          }}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium leading-relaxed"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            {idea.idea}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs" style={{ color: "#ff6b8a" }}>
          {error}
        </p>
      )}

      {/* Expanded tweet */}
      {expanded && showExpanded && (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Tweet text */}
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            {expanded.tweet}
          </p>

          {/* Character count */}
          <p
            className="text-[11px]"
            style={{
              color:
                expanded.tweet.length > 280
                  ? "#ff6b8a"
                  : "rgba(255,255,255,0.3)",
            }}
          >
            {expanded.tweet.length} / 280 characters
          </p>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-1.5">
            {expanded.hashtags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
                style={{
                  background: "rgba(124,58,237,0.2)",
                  color: "#c084fc",
                  border: "1px solid rgba(124,58,237,0.3)",
                }}
              >
                <Hash size={9} />
                {tag}
              </span>
            ))}
          </div>

          {/* Tip */}
          <div
            className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
            style={{
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.2)",
              color: "#34d399",
            }}
          >
            <span className="shrink-0">💡</span>
            {expanded.tip}
          </div>

          {/* Copy button */}
          <button
            onClick={copyTweet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all w-full justify-center"
            style={{
              background: copied
                ? "rgba(52,211,153,0.15)"
                : "rgba(255,255,255,0.07)",
              border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.1)"}`,
              color: copied ? "#34d399" : "rgba(255,255,255,0.6)",
            }}
          >
            {copied ? (
              <>
                <Check size={12} /> Copied!
              </>
            ) : (
              <>
                <Copy size={12} /> Copy Tweet + Hashtags
              </>
            )}
          </button>
        </div>
      )}

      {/* Expand button */}
      <button
        onClick={handleExpand}
        disabled={isExpanding}
        className="flex items-center gap-1.5 text-xs font-medium transition-all"
        style={{ color: "#c084fc" }}
      >
        {isExpanding ? (
          <>
            <Loader2 size={12} className="animate-spin" /> Writing tweet...
          </>
        ) : expanded ? (
          showExpanded ? (
            <>
              <ChevronUp size={12} /> Hide tweet
            </>
          ) : (
            <>
              <ChevronDown size={12} /> Show tweet
            </>
          )
        ) : (
          <>
            <Wand2 size={12} /> Write Tweet
          </>
        )}
      </button>
    </div>
  );
}

export default function PostIdeas() {
  const { ideas, isGenerating } = useContentStore();

  // Loading skeletons while generating
  if (isGenerating) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 space-y-3"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-lg shimmer shrink-0"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
              <div className="flex-1 space-y-2">
                <div
                  className="h-3 rounded-full shimmer w-full"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <div
                  className="h-3 rounded-full shimmer w-3/4"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (ideas.length === 0) return null;

  return (
    <div className="space-y-3">
      <p
        className="text-xs font-medium"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        {ideas.length} ideas generated — click "Write Tweet" to expand any idea
      </p>
      {ideas.map((idea, i) => (
        <IdeaCard key={idea.id ?? i} idea={idea} index={i} />
      ))}
    </div>
  );
}
