"use client";
import { Feather, ScanLine, Bookmark } from "lucide-react";
import { useContentStore } from "@/store/useContentStore";
const tabs = [
  { key: "generate", label: "Create", icon: Feather },
  { key: "analyze", label: "Review", icon: ScanLine },
  { key: "history", label: "Saved", icon: Bookmark },
] as const;
export default function TabBar() {
  const { activeTab, setActiveTab, history } = useContentStore();
  return (
    <nav className="workspace-nav" aria-label="Workspace">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`nav-item ${activeTab === tab.key ? "active" : ""}`}
          aria-current={activeTab === tab.key ? "page" : undefined}
          onClick={() => setActiveTab(tab.key)}
        >
          <tab.icon size={16} />
          {tab.label}
          {tab.key === "history" && history.length > 0 && (
            <span className="nav-count">{history.length}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
