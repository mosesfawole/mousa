import type { Metadata } from "next";
import Studio from "@/components/Studio";
import { sharedAIAvailable, sharedAIProviderNames } from "@/lib/ai-router";
export const metadata: Metadata = { title: "Your writing room" };
export const dynamic = "force-dynamic";
export default function DashboardPage() {
  return (
    <Studio
      liveAvailable={sharedAIAvailable()}
      sharedProviders={sharedAIProviderNames()}
    />
  );
}
