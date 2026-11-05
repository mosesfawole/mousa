import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";
import { ContentError } from "./content-error";

// Reserve all three budgets atomically, before any provider receives the brief.
const reserveScript = `
for i = 1, #KEYS do
  if tonumber(redis.call('GET', KEYS[i]) or '0') >= tonumber(ARGV[i]) then return 0 end
end
for i = 1, #KEYS do
  if redis.call('INCR', KEYS[i]) == 1 then redis.call('EXPIRE', KEYS[i], ARGV[#KEYS + i]) end
end
return 1`;

const localCounts = new Map<string, { count: number; expires: number }>();

export function sharedLimiterConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function limit(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

export async function reserveSharedRequest(req: NextRequest) {
  const now = Date.now();
  // Vercel overwrites this header. Never trust a visitor-supplied forwarded-for.
  // Other hosts share one visitor bucket until a trusted proxy adapter is added.
  const address =
    process.env.VERCEL === "1"
      ? req.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() ||
        "unknown"
      : "local-or-unidentified";
  const visitor = createHmac(
    "sha256",
    process.env.UPSTASH_REDIS_REST_TOKEN || "local-development",
  )
    .update(address)
    .digest("hex");
  const minute = Math.floor(now / 60000),
    day = Math.floor(now / 86400000);
  const keys = [
    `mousa:ai:minute:${minute}:${visitor}`,
    `mousa:ai:day:${day}:${visitor}`,
    `mousa:ai:global:${day}`,
  ];
  const caps = [
    3,
    limit("MOUSA_AI_VISITOR_DAILY_LIMIT", 10),
    limit("MOUSA_AI_GLOBAL_DAILY_LIMIT", 100),
  ];
  const ttls = [120, 172800, 172800];
  let allowed: boolean;
  if (sharedLimiterConfigured()) {
    try {
      const endpoint = new URL(process.env.UPSTASH_REDIS_REST_URL!);
      if (endpoint.protocol !== "https:") throw new Error("HTTPS required");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          "EVAL",
          reserveScript,
          3,
          ...keys,
          ...caps,
          ...ttls,
        ]),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.any([req.signal, AbortSignal.timeout(3000)]),
      });
      const body = await response.json();
      if (!response.ok || ![0, 1].includes(body.result))
        throw new Error("Quota unavailable");
      allowed = body.result === 1;
    } catch {
      throw new ContentError(
        "Mousa’s shared AI is temporarily unavailable. Connect your own key or use the sample workspace.",
        503,
      );
    }
  } else {
    if (process.env.NODE_ENV === "production")
      throw new ContentError(
        "Mousa’s shared AI isn’t ready yet. Connect your own key or use the sample workspace.",
        503,
      );
    // Local development only. Production always requires shared, durable counters.
    for (const [key, value] of localCounts)
      if (value.expires <= now) localCounts.delete(key);
    allowed = keys.every(
      (key, i) => (localCounts.get(key)?.count || 0) < caps[i],
    );
    if (allowed)
      keys.forEach((key, i) => {
        const entry = localCounts.get(key);
        localCounts.set(key, {
          count: (entry?.count || 0) + 1,
          expires: entry?.expires || now + ttls[i] * 1000,
        });
      });
  }
  if (!allowed)
    throw new ContentError(
      "Mousa’s shared AI allowance has been reached. Try again later, connect your own key, or use the sample workspace.",
      429,
    );
}
