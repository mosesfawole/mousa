"use client";
import { useEffect, useState } from "react";
import { Trash2, Wand2, BarChart2, Lightbulb, RefreshCw } from "lucide-react";
import type { Content } from "@/types";

export default function HistoryPanel() {
  const [history, setHistory] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/history?id=${id}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const typeConfig = {
    idea: {
      icon: <Lightbulb size={12} />,
      label: "Ideas",
      color: "#c084fc",
    },
    tweet: {
      icon: <Wand2 size={12} />,
      label: "Tweet",
      color: "#60a5fa",
    },
    analysis: {
      icon: <BarChart2 size={12} />,
      label: "Analysis",
      color: "#f472b6",
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 shimmer"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              height: "80px",
            }}
          />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(124,58,237,0.15)" }}
        >
          <Lightbulb size={20} style={{ color: "#c084fc" }} />
        </div>
        <p
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          No history yet
        </p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          Generate ideas or analyze a tweet to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          {history.length} sessions saved
        </p>
        <button
          onClick={fetchHistory}
          className="flex items-center gap-1 text-xs transition-colors"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <RefreshCw size={11} />
          Refresh
        </button>
      </div>

      {history.map((item) => {
        const config = typeConfig[item.type] ?? typeConfig.idea;

        return (
          <div
            key={item.id}
            className="glass-hover rounded-2xl p-4 space-y-2 animate-fade-in"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 shrink-0">
                {/* Type badge */}
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                  style={{
                    background: `${config.color}18`,
                    color: config.color,
                    border: `1px solid ${config.color}30`,
                  }}
                >
                  {config.icon}
                  {config.label}
                </span>

                {/* Score badge for analysis */}
                {item.type === "analysis" && item.score && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{
                      background:
                        item.score >= 7
                          ? "rgba(52,211,153,0.15)"
                          : "rgba(255,77,109,0.15)",
                      color: item.score >= 7 ? "#34d399" : "#ff6b8a",
                    }}
                  >
                    {item.score}/10
                  </span>
                )}
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="p-1.5 rounded-lg transition-colors shrink-0"
                style={{ color: "rgba(255,255,255,0.2)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#ff6b8a")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "rgba(255,255,255,0.2)")
                }
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Prompt */}
            <p
              className="text-xs leading-relaxed line-clamp-2"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {item.prompt}
            </p>

            {/* Timestamp */}
            <p
              className="text-[10px]"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              {new Date(item.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
}
