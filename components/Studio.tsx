"use client";
import { useEffect, useState } from "react";
import { ChevronRight, Sparkles, Info, ArrowUpRight } from "lucide-react";
import { useContentStore } from "@/store/useContentStore";
import Navbar from "@/components/ui/Navbar";
import GeneratorForm from "@/components/content/GeneratorForm";
import PostIdeas from "@/components/content/PostIdeas";
import AnalyzerForm from "@/components/content/AnalyzerForm";
import HistoryPanel from "@/components/content/HistoryPanel";
export default function Studio({ liveAvailable }: { liveAvailable: boolean }) {
  const s = useContentStore();
  const [sampleMode, setSampleMode] = useState(!liveAvailable);
  useEffect(() => {
    useContentStore.getState().hydrateWorkspace();
  }, []);
  const titles = {
    generate: [
      "A good post starts",
      "with a good idea.",
      "A thought, a few angles, and room to make it yours.",
    ],
    analyze: [
      "A little distance.",
      "A clearer draft.",
      "Look at your words with fresh eyes. Keep what feels right.",
    ],
    history: [
      "Keep the thoughts",
      "worth coming back to.",
      "Your ideas, drafts, and second looks. All in one place.",
    ],
  };
  const title = titles[s.activeTab];
  function sampleBrief() {
    s.setNiche("Developers building side projects");
    s.setTopic("Lessons from shipping a side project");
    s.setTone("casual");
    s.setActiveTab("generate");
  }
  return (
    <div className="workspace">
      <Navbar />
      <div className="workspace-body">
        <header className="workspace-topbar">
          <div className="breadcrumbs">
            <span>Your writing room</span>
            <ChevronRight size={11} />
            <strong>
              {s.activeTab === "generate"
                ? "Create"
                : s.activeTab === "analyze"
                  ? "Review"
                  : "Saved work"}
            </strong>
          </div>
          {liveAvailable ? (
            <button
              className="mode-pill"
              onClick={() => setSampleMode(!sampleMode)}
              disabled={s.isGenerating || s.isExpanding || s.isAnalyzing}
              aria-label={
                sampleMode
                  ? "Switch to live AI writing"
                  : "Switch to sample workspace"
              }
            >
              <span className="mode-dot" />
              {sampleMode ? "Sample workspace" : "Live AI writing"}
            </button>
          ) : (
            <span className="mode-pill">
              <span className="mode-dot" />
              Sample workspace
            </span>
          )}
        </header>
        <main id="main" className="workspace-main">
          <div className="workspace-heading">
            <div>
              <span className="eyebrow">
                {s.activeTab === "generate"
                  ? "From a thought to a post"
                  : s.activeTab === "analyze"
                    ? "A thoughtful second look"
                    : "Your collected thoughts"}
              </span>
              <h1 className="serif">
                {title[0]}
                <br />
                {title[1]}
              </h1>
              <p>{title[2]}</p>
            </div>
            {s.activeTab === "generate" && (
              <button
                className="btn"
                onClick={sampleBrief}
                disabled={s.isGenerating || s.isExpanding}
              >
                <Sparkles size={13} />
                Try a sample brief <ArrowUpRight size={13} />
              </button>
            )}
          </div>
          {sampleMode && (
            <div className="sample-banner">
              <Info size={14} />
              <p>
                <strong>You’re exploring a sample workspace.</strong> Ideas,
                drafts, and reviews are illustrative examples, not live AI. Edit
                and save your own words; your work stays in this browser.
              </p>
            </div>
          )}
          {s.storageError && (
            <div className="error-box" role="alert">
              {s.storageError}
            </div>
          )}
          {s.activeTab === "generate" && (
            <div className="studio-grid">
              <section className="panel brief-panel">
                <div className="panel-heading">
                  <h2>Let’s find a starting point</h2>
                  <span className="step-tag">01</span>
                </div>
                <GeneratorForm sampleMode={sampleMode} />
              </section>
              <PostIdeas sampleMode={sampleMode} />
            </div>
          )}
          {s.activeTab === "analyze" && (
            <AnalyzerForm sampleMode={sampleMode} />
          )}
          {s.activeTab === "history" && <HistoryPanel />}
        </main>
        <footer className="workspace-footer">
          <span>A starting point. Always your final say.</span>
          <a
            href="https://github.com/mosesfawole/mousa"
            target="_blank"
            rel="noreferrer"
          >
            Behind the build ↗
          </a>
        </footer>
      </div>
    </div>
  );
}
