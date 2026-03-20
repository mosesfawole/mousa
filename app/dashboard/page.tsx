"use client";
import { useContentStore } from "@/store/useContentStore";
import Navbar from "@/components/ui/Navbar";
import TabBar from "@/components/ui/TabBar";
import GeneratorForm from "@/components/content/GeneratorForm";
import PostIdeas from "@/components/content/PostIdeas";
import AnalyzerForm from "@/components/content/AnalyzerForm";
import HistoryPanel from "@/components/content/HistoryPanel";
import Footer from "@/components/ui/Footer";

export default function DashboardPage() {
  const { activeTab } = useContentStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Page title */}
        <div className="text-center space-y-2">
          <h1
            className="font-display text-3xl font-bold"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            What will you <span className="gradient-text">create today?</span>
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Generate ideas, write tweets or analyze your content
          </p>
        </div>

        {/* Tab navigation */}
        <TabBar />

        {/* Tab content */}
        <div className="animate-fade-in">
          {activeTab === "generate" && (
            <div className="space-y-6">
              {/* Generator form in a glass card */}
              <div className="glass rounded-2xl p-6">
                <h2
                  className="text-sm font-semibold mb-5"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Describe yourself
                </h2>
                <GeneratorForm />
              </div>

              {/* Generated ideas appear below the form */}
              <PostIdeas />
            </div>
          )}

          {activeTab === "analyze" && (
            <div className="glass rounded-2xl p-6">
              <h2
                className="text-sm font-semibold mb-5"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Paste a tweet to analyze
              </h2>
              <AnalyzerForm />
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <HistoryPanel />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
