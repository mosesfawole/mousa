"use client";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <nav
      className="h-16 flex items-center px-6 md:px-12 sticky top-0 z-30"
      style={{
        background: "rgba(13,0,21,0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
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
      </Link>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-4">
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
          style={{
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.3)",
            color: "#c084fc",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#c084fc" }}
          />
          Powered by Claude AI
        </div>
      </div>
    </nav>
  );
}
