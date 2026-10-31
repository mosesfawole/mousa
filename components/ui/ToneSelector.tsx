"use client";
import { MessageCircle, Briefcase, Smile, GraduationCap } from "lucide-react";
import { useContentStore } from "@/store/useContentStore";
import type { Tone } from "@/types";
const tones = [
  { value: "casual", label: "Conversational", icon: MessageCircle },
  { value: "professional", label: "Professional", icon: Briefcase },
  { value: "funny", label: "Playful", icon: Smile },
  { value: "educational", label: "Educational", icon: GraduationCap },
] as const;
export default function ToneSelector({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const { tone, setTone } = useContentStore();
  return (
    <fieldset
      className="field"
      style={{ border: 0, padding: 0 }}
      disabled={disabled}
    >
      <legend>Your voice</legend>
      <div className="tone-grid">
        {tones.map((item) => (
          <button
            key={item.value}
            type="button"
            className="tone-option"
            aria-pressed={tone === item.value}
            onClick={() => setTone(item.value as Tone)}
            disabled={disabled}
          >
            <item.icon size={13} />
            {item.label}
          </button>
        ))}
      </div>
      <span className="field-help">
        An approach to writing, not a personality transplant.
      </span>
    </fieldset>
  );
}
