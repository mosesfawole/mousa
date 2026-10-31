"use client";
import { useState } from "react";
import { Search, Bookmark, ArrowUpRight, Trash2, Undo2 } from "lucide-react";
import { useContentStore } from "@/store/useContentStore";
import type { Content } from "@/types";
const labels = { idea: "Ideas", tweet: "Draft", analysis: "Review" };
export default function HistoryPanel() {
  const s = useContentStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleted, setDeleted] = useState<Content | null>(null);
  const [error, setError] = useState("");
  const items = s.history.filter(
    (item) =>
      (filter === "all" || item.type === filter) &&
      (item.prompt + " " + item.output)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section aria-label="Saved work">
      <div className="history-toolbar">
        <div style={{ position: "relative", width: "100%", maxWidth: 360 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              top: 14,
              left: 12,
              color: "var(--muted)",
            }}
          />
          <label htmlFor="history-search" className="sr-only">
            Search saved work
          </label>
          <input
            id="history-search"
            className="mousa-input"
            style={{ paddingLeft: 34 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a thought, draft, or idea…"
          />
        </div>
        <label htmlFor="history-filter" className="sr-only">
          Filter saved work
        </label>
        <select
          id="history-filter"
          className="mousa-input"
          style={{ width: "auto", minWidth: 115 }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All work</option>
          <option value="idea">Ideas</option>
          <option value="tweet">Drafts</option>
          <option value="analysis">Reviews</option>
        </select>
        <span className="muted" style={{ fontSize: 11 }}>
          {items.length} saved
        </span>
      </div>
      {deleted && (
        <div className="toast" role="status">
          <span>Removed from saved work.</span>
          <button
            className="text-button"
            onClick={() => {
              s.addHistory(deleted);
              setDeleted(null);
            }}
          >
            <Undo2 size={13} />
            Undo
          </button>
        </div>
      )}
      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}
      {!s.historyLoaded ? (
        <p className="field-help" role="status">
          Opening your saved workspace…
        </p>
      ) : !items.length ? (
        <div className="empty-state">
          <span className="empty-symbol">
            <Bookmark size={29} strokeWidth={1.2} />
          </span>
          <h3 className="serif">
            {s.history.length
              ? "No matching thoughts."
              : "Good thoughts are worth keeping."}
          </h3>
          <p>
            {s.history.length
              ? "Try another search or show all types of work."
              : "Your ideas and reviews are saved here. Save a draft from the editor to come back to it later."}
          </p>
          {!s.history.length && (
            <button
              className="text-button"
              style={{ marginTop: 20 }}
              onClick={() => s.setActiveTab("generate")}
            >
              Find your first idea <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      ) : (
        <div className="history-list">
          {items.map((item) => (
            <article className="panel history-card" key={item.id}>
              <div className="history-card-top">
                <span className="eyebrow">{labels[item.type]}</span>
                <span className="mode-pill">
                  {item.source === "live" ? "AI-assisted" : "Sample workspace"}
                </span>
              </div>
              <h3>
                {item.type === "tweet"
                  ? "A draft in your voice"
                  : item.type === "analysis"
                    ? "A second look at your words"
                    : item.prompt}
              </h3>
              {item.type === "tweet" ? (
                <p>{item.output}</p>
              ) : item.type === "analysis" ? (
                <p>{item.prompt}</p>
              ) : (
                <p>
                  {item.ideas
                    ?.slice(0, 2)
                    .map((idea) => idea.hook || idea.idea)
                    .join(" · ") || "Five saved angles for your next post."}
                </p>
              )}
              <div className="history-card-footer">
                <time dateTime={item.created_at}>
                  {new Intl.DateTimeFormat(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(item.created_at))}
                </time>
                <div style={{ display: "flex", gap: 18 }}>
                  <button
                    className="text-button"
                    onClick={() => {
                      if (!s.reopen(item))
                        setError(
                          "This saved item couldn’t be opened. Its text is still shown here.",
                        );
                      else window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Reopen <ArrowUpRight size={13} />
                  </button>
                  <button
                    className="text-button"
                    style={{ color: "var(--muted)" }}
                    aria-label={`Remove saved ${labels[item.type].toLowerCase()}`}
                    onClick={() => {
                      s.deleteHistory(item.id);
                      setDeleted(item);
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="field-help" style={{ marginTop: 22 }}>
        Up to 50 items stay in this browser. Copy important drafts before
        clearing browser data.
      </p>
    </section>
  );
}
