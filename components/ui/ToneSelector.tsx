"use client";
import { useContentStore } from "@/store/useContentStore";
import type { Tone } from "@/types";

const tones: { value: Tone; label: string; emoji: string; color: string }[] = [
  { value: "casual", label: "Casual", emoji: "😊", color: "#60a5fa" },
  {
    value: "professional",
    label: "Professional",
    emoji: "💼",
    color: "#c084fc",
  },
  { value: "funny", label: "Funny", emoji: "😂", color: "#f472b6" },
  { value: "educational", label: "Educational", emoji: "🎓", color: "#34d399" },
];

export default function ToneSelector() {
  const { tone, setTone } = useContentStore();

  return (
    <div className="space-y-2">
      <p
        className="text-xs font-medium"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        Tone
      </p>
      <div className="flex flex-wrap gap-2">
        {tones.map((t) => {
          const isActive = tone === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
              style={{
                background: isActive
                  ? `${t.color}20`
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${isActive ? t.color : "rgba(255,255,255,0.08)"}`,
                color: isActive ? t.color : "rgba(255,255,255,0.5)",
                boxShadow: isActive ? `0 0 12px ${t.color}30` : "none",
              }}
            >
              <span>{t.emoji}</span>
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
