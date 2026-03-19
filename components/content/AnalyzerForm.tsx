"use client";
import { BarChart2, Loader2, X } from "lucide-react";
import { useContentStore } from "@/store/useContentStore";
import ScoreRing from "@/components/ui/ScoreRing";

export default function AnalyzerForm() {
  const {
    tweetToAnalyze,
    setTweetToAnalyze,
    analyzeNiche,
    setAnalyzeNiche,
    analysisResult,
    setAnalysisResult,
    isAnalyzing,
    setIsAnalyzing,
    analyzeError,
    setAnalyzeError,
    clearAnalyzer,
  } = useContentStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweetToAnalyze.trim()) return;

    setIsAnalyzing(true);
    setAnalyzeError(null);
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tweet: tweetToAnalyze,
          niche: analyzeNiche,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");

      setAnalysisResult(data);
    } catch (err: any) {
      setAnalyzeError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tweet input */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Paste your tweet
          </label>
          <textarea
            placeholder="Paste the tweet you want to analyze..."
            value={tweetToAnalyze}
            onChange={(e) => setTweetToAnalyze(e.target.value)}
            rows={4}
            className="mousa-input"
            style={{ resize: "vertical" }}
            required
          />
          <p
            className="text-[11px] text-right"
            style={{
              color:
                tweetToAnalyze.length > 280
                  ? "#ff6b8a"
                  : "rgba(255,255,255,0.3)",
            }}
          >
            {tweetToAnalyze.length} characters
          </p>
        </div>

        {/* Niche context */}
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
              (helps Claude give relevant feedback)
            </span>
          </label>
          <input
            type="text"
            placeholder="e.g. frontend developer, fitness coach..."
            value={analyzeNiche}
            onChange={(e) => setAnalyzeNiche(e.target.value)}
            className="mousa-input"
          />
        </div>

        {/* Error */}
        {analyzeError && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{
              background: "rgba(255,77,109,0.1)",
              border: "1px solid rgba(255,77,109,0.2)",
              color: "#ff6b8a",
            }}
          >
            {analyzeError}
          </div>
        )}

        <button
          type="submit"
          disabled={isAnalyzing || !tweetToAnalyze.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <BarChart2 size={16} /> Analyze Performance
            </>
          )}
        </button>
      </form>

      {/* Analysis results */}
      {analysisResult && (
        <div className="space-y-4 animate-slide-up">
          {/* Score + verdict */}
          <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
            <ScoreRing score={analysisResult.score} />
            <div className="flex-1 text-center sm:text-left">
              <p
                className="text-base font-medium leading-relaxed"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {analysisResult.verdict}
              </p>
            </div>
            <button
              onClick={clearAnalyzer}
              className="shrink-0 p-1.5 rounded-lg transition-colors"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Strengths */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h3
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: "#34d399" }}
            >
              ✅ Strengths
            </h3>
            <ul className="space-y-2">
              {analysisResult.strengths.map((s, i) => (
                <li
                  key={i}
                  className="text-sm flex items-start gap-2"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <span style={{ color: "#34d399" }}>•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: "#f472b6" }}>
              ⚠️ Weaknesses
            </h3>
            <ul className="space-y-2">
              {analysisResult.weaknesses.map((w, i) => (
                <li
                  key={i}
                  className="text-sm flex items-start gap-2"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <span style={{ color: "#f472b6" }}>•</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>

          {/* Improved version */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: "#c084fc" }}>
              ✨ Improved Version
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              {analysisResult.improved}
            </p>

            {/* Suggested hashtags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {analysisResult.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[11px]"
                  style={{
                    background: "rgba(124,58,237,0.2)",
                    color: "#c084fc",
                    border: "1px solid rgba(124,58,237,0.3)",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
