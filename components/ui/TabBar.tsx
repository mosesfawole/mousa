"use client";
import { Wand2, BarChart2, Clock } from "lucide-react";
import { useContentStore } from "@/store/useContentStore";

const tabs = [
  { key: "generate", label: "Generate", icon: <Wand2 size={14} /> },
  { key: "analyze", label: "Analyze", icon: <BarChart2 size={14} /> },
  { key: "history", label: "History", icon: <Clock size={14} /> },
] as const;

export default function TabBar() {
  const { activeTab, setActiveTab } = useContentStore();

  return (
    <div
      className="flex gap-1 p-1 rounded-2xl w-fit mx-auto"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
            style={{
              background: isActive
                ? "linear-gradient(135deg, #7c3aed, #c084fc)"
                : "transparent",
              color: isActive ? "white" : "rgba(255,255,255,0.4)",
              boxShadow: isActive ? "0 4px 15px rgba(124,58,237,0.4)" : "none",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
