// ── Tone options ───────────────────────────────────────
export type Tone = "professional" | "casual" | "funny" | "educational";

// ── Content types ──────────────────────────────────────
export type ContentType = "idea" | "tweet" | "analysis";

// ── A single post idea ─────────────────────────────────
export interface Idea {
  id: string;
  content_id: string;
  idea: string;
  expanded?: string;
  hashtags?: string[];
  created_at: string;
}

// ── A content session ──────────────────────────────────
// One session = one AI request with multiple ideas
export interface Content {
  id: string;
  type: ContentType;
  niche?: string;
  tone?: string;
  prompt: string;
  output: string;
  platform: string;
  score?: number;
  created_at: string;
  ideas?: Idea[];
}

// ── What you send to generate ideas ───────────────────
export interface GenerateInput {
  niche: string;
  tone: Tone;
  topic?: string; // optional specific topic
}

// ── What you send to expand an idea ───────────────────
export interface ExpandInput {
  idea: string;
  niche: string;
  tone: Tone;
}

// ── What you send to analyze a tweet ──────────────────
export interface AnalyzeInput {
  tweet: string;
  niche: string;
}

// ── What Claude returns for generation ────────────────
export interface GenerateResponse {
  ideas: {
    idea: string;
    hook: string; // the opening line
  }[];
}

// ── What Claude returns for expansion ─────────────────
export interface ExpandResponse {
  tweet: string;
  hashtags: string[];
  tip: string; // one tip for why this works
}

// ── What Claude returns for analysis ──────────────────
export interface AnalyzeResponse {
  score: number; // 1-10
  verdict: string; // one sentence summary
  strengths: string[]; // what works
  weaknesses: string[]; // what doesn't
  improved: string; // rewritten version
  hashtags: string[]; // suggested hashtags
}

// ── History item (for the history panel) ──────────────
export interface HistoryItem {
  id: string;
  type: ContentType;
  prompt: string;
  output: string;
  score?: number;
  created_at: string;
}
