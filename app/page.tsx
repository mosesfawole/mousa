import Link from "next/link";
import { Sparkles, Wand2, BarChart2, Clock, ArrowRight } from "lucide-react";
import Footer from "@/components/ui/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav
        className="h-16 flex items-center px-6 md:px-12"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #c084fc)",
              boxShadow: "0 0 20px rgba(124,58,237,0.4)",
            }}
          >
            <Sparkles size={15} color="white" />
          </div>
          <span
            className="font-display font-bold text-lg"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Mou<span style={{ color: "#c084fc" }}>sa</span>
          </span>
        </div>

        <div className="ml-auto">
          <Link
            href="/dashboard"
            className="btn-primary flex items-center gap-2"
            style={{ padding: "8px 20px", fontSize: "13px" }}
          >
            Get Started
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8 animate-fade-in"
          style={{
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.3)",
            color: "#c084fc",
          }}
        >
          <Sparkles size={12} />
          Powered by Claude AI
        </div>

        {/* Headline */}
        <h1
          className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6 animate-slide-up"
          style={{ color: "rgba(255,255,255,0.95)", maxWidth: "800px" }}
        >
          Your AI <span className="gradient-text">Content Muse</span> for
          Twitter/X
        </h1>

        {/* Subheading */}
        <p
          className="text-lg md:text-xl mb-10 leading-relaxed animate-slide-up"
          style={{
            color: "rgba(255,255,255,0.5)",
            maxWidth: "560px",
            animationDelay: "100ms",
          }}
        >
          Generate post ideas, write high-performing tweets and analyze your
          content — all powered by AI trained on what actually works.
        </p>

        {/* CTA */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          <Link
            href="/dashboard"
            className="btn-primary flex items-center gap-2 text-base"
            style={{ padding: "14px 32px", fontSize: "15px" }}
          >
            <Wand2 size={18} />
            Start Creating Free
          </Link>
        </div>

        {/* Feature cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 w-full animate-slide-up"
          style={{ maxWidth: "800px", animationDelay: "300ms" }}
        >
          {[
            {
              icon: <Wand2 size={20} />,
              color: "#c084fc",
              title: "Generate Ideas",
              desc: "Get 5 unique post ideas tailored to your niche and tone in seconds",
            },
            {
              icon: <Sparkles size={20} />,
              color: "#f472b6",
              title: "Write Tweets",
              desc: "Expand any idea into a full tweet with hashtags and a performance tip",
            },
            {
              icon: <BarChart2 size={20} />,
              color: "#60a5fa",
              title: "Analyze Content",
              desc: "Get a score, strengths, weaknesses and an improved version of any tweet",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-6 text-left space-y-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `${feature.color}18`,
                  border: `1px solid ${feature.color}30`,
                  color: feature.color,
                }}
              >
                {feature.icon}
              </div>
              <h3
                className="font-semibold text-sm"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {feature.title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
