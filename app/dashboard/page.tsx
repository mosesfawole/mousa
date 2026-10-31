import type { Metadata } from "next";
import Studio from "@/components/Studio";
export const metadata: Metadata = { title: "Your writing room" };
export const dynamic = "force-dynamic";
export default function DashboardPage() {
  return <Studio liveAvailable={Boolean(process.env.ANTHROPIC_API_KEY)} />;
}
