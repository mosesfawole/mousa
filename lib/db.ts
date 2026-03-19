import { supabaseAdmin } from "./supabase-server";
import type { Content, Idea } from "@/types";

// ── Save a generation session ──────────────────────────
// Called after Claude generates post ideas
export async function saveContent(data: {
  type: string;
  niche?: string;
  tone?: string;
  prompt: string;
  output: string;
  score?: number;
}): Promise<Content | null> {
  const { data: result, error } = await supabaseAdmin
    .from("content")
    .insert({ ...data, platform: "twitter" })
    .select()
    .single();

  if (error) {
    console.error("saveContent error:", error);
    return null;
  }
  return result as Content;
}

// ── Save individual ideas linked to a content session ──
export async function saveIdeas(
  contentId: string,
  ideas: { idea: string; hook: string }[],
): Promise<Idea[]> {
  const rows = ideas.map((i) => ({
    content_id: contentId,
    idea: i.idea,
  }));

  const { data, error } = await supabaseAdmin
    .from("ideas")
    .insert(rows)
    .select();

  if (error) {
    console.error("saveIdeas error:", error);
    return [];
  }
  return data as Idea[];
}

// ── Update an idea with its expanded tweet ─────────────
// Called when user clicks "expand" on an idea
export async function updateIdeaExpanded(
  ideaId: string,
  expanded: string,
  hashtags: string[],
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("ideas")
    .update({ expanded, hashtags })
    .eq("id", ideaId);

  if (error) {
    console.error("updateIdeaExpanded error:", error);
    return false;
  }
  return true;
}

// ── Get content history ────────────────────────────────
// Returns the last 20 sessions newest first
export async function getHistory(): Promise<Content[]> {
  const { data, error } = await supabaseAdmin
    .from("content")
    .select("*, ideas(*)")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("getHistory error:", error);
    return [];
  }
  return data as Content[];
}

// ── Delete a content session ───────────────────────────
export async function deleteContent(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from("content").delete().eq("id", id);

  return !error;
}
