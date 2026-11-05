import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { randomInt } from "node:crypto";
import type { NextRequest } from "next/server";
import {
  AI_PROVIDERS,
  isAIProvider,
  isValidAPIKey,
  type AIProvider,
} from "./ai-config";
import { ContentError } from "./content-error";
import {
  reserveSharedRequest,
  sharedLimiterConfigured,
} from "./shared-ai-limit";

const endpoints: Record<AIProvider, string> = {
  anthropic: "https://api.anthropic.com",
  openai: "https://api.openai.com/v1",
  groq: "https://api.groq.com/openai/v1",
  openrouter: "https://openrouter.ai/api/v1",
  fortytwo: "https://api.fortytwo.network/v1",
};
type Connection = { provider: AIProvider; key: string; model: string };

function hostedConnections(): Connection[] {
  const order = (
    process.env.MOUSA_AI_PROVIDER_ORDER ||
    "groq,openrouter,fortytwo,anthropic,openai"
  )
    .split(",")
    .map((item) => item.trim());
  return [...new Set(order)].filter(isAIProvider).flatMap((provider) => {
    const key = process.env[`${provider.toUpperCase()}_API_KEY`]?.trim();
    const model =
      process.env[`${provider.toUpperCase()}_MODEL`]?.trim() ||
      AI_PROVIDERS[provider].model;
    // A host's OpenRouter connection must stay on explicitly free models.
    if (
      !key ||
      (provider === "openrouter" &&
        model !== "openrouter/free" &&
        !model.endsWith(":free"))
    )
      return [];
    return [{ provider, key, model }];
  });
}

export function sharedAIAvailable() {
  return (
    hostedConnections().length > 0 &&
    (process.env.NODE_ENV !== "production" || sharedLimiterConfigured())
  );
}

export function sharedAIProviderNames() {
  return hostedConnections().map(({ provider }) => AI_PROVIDERS[provider].name);
}

function personalConnection(req: NextRequest): Connection | null {
  const selected = req.headers.get("x-mousa-provider");
  if (selected !== null && !isAIProvider(selected))
    throw new ContentError("Choose a provider in Connect your AI.", 400);
  const supplied = req.headers.get("x-mousa-api-key");
  if (supplied === null) {
    if (selected !== null)
      throw new ContentError("Add your API key in Connect your AI.", 400);
    return null;
  }
  const provider = selected || "anthropic";
  const key = supplied.trim();
  if (!isValidAPIKey(provider, key))
    throw new ContentError(
      `Add a valid ${AI_PROVIDERS[provider].name} API key in Connect your AI.`,
      400,
    );
  return { provider, key, model: AI_PROVIDERS[provider].model };
}

async function complete(
  prompt: string,
  connection: Connection,
  signal: AbortSignal,
  timeout: number,
) {
  const { provider, key, model } = connection;
  const options = {
    apiKey: key,
    baseURL: endpoints[provider],
    timeout,
    maxRetries: 0,
    logLevel: "off" as const,
  };
  if (provider === "anthropic") {
    const message = await new Anthropic(options).messages.create(
      {
        model,
        max_tokens: 1600,
        messages: [{ role: "user", content: prompt }],
      },
      { signal },
    );
    if (message.stop_reason && message.stop_reason !== "end_turn")
      throw new ContentError(
        "The writing service couldn’t complete this response. Please try again.",
        502,
      );
    return message.content
      .filter((block) => block.type === "text")
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n");
  }
  const client = new OpenAI(options);
  if (provider === "openai") {
    const response = await client.responses.create(
      {
        model,
        input: prompt,
        max_output_tokens: 2000,
        reasoning: { effort: "none" },
        text: { format: { type: "json_object" } },
        store: false,
      },
      { signal },
    );
    if (response.status !== "completed")
      throw new ContentError(
        "The writing service couldn’t complete this response. Please try again.",
        502,
      );
    return response.output_text;
  }
  const response = await client.chat.completions.create(
    {
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      ...(provider === "fortytwo" ? { reasoning_effort: "none" as const } : {}),
      ...(provider === "groq" ? { reasoning_effort: "low" as const } : {}),
      // OpenRouter's free router can select models without JSON-mode support.
      ...(provider !== "openrouter"
        ? { response_format: { type: "json_object" as const } }
        : {}),
    },
    { signal },
  );
  const choice = response.choices[0];
  if (choice?.finish_reason === "content_filter" || choice?.message.refusal)
    throw new ContentError(
      "The writing provider couldn’t help with this brief. Please revise it.",
      422,
    );
  if (choice?.finish_reason !== "stop" || !choice.message.content)
    throw new ContentError(
      "The writing service returned an incomplete response. Please try again.",
      502,
    );
  return choice.message.content;
}

function parse(output: string): Record<string, unknown> {
  try {
    const result: unknown = JSON.parse(
      output.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "").trim(),
    );
    if (!result || typeof result !== "object" || Array.isArray(result))
      throw new Error("Invalid JSON object");
    return result as Record<string, unknown>;
  } catch {
    throw new ContentError(
      "The writing service returned an incomplete response. Please try again.",
      502,
    );
  }
}

function transient(error: unknown) {
  if (error instanceof ContentError) return false; // Never rotate around refusals or bad output.
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number(error.status)
      : 0;
  return (
    [402, 408, 429, 500, 502, 503, 504].includes(status) ||
    error instanceof OpenAI.APIConnectionError ||
    error instanceof Anthropic.APIConnectionError
  );
}

export async function ask(
  prompt: string,
  req: NextRequest,
): Promise<Record<string, unknown>> {
  const personal = personalConnection(req);
  if (personal)
    return parse(await complete(prompt, personal, req.signal, 30000));
  let connections = hostedConnections();
  if (!connections.length)
    throw new ContentError(
      "Live writing isn’t connected yet. You can explore the sample workspace or connect your own key.",
      503,
    );
  await reserveSharedRequest(req);
  if (process.env.MOUSA_AI_ROUTING === "rotate") {
    // Randomized round-robin starting point works across stateless instances.
    const start = randomInt(connections.length);
    connections = [...connections.slice(start), ...connections.slice(0, start)];
  }
  const deadline = Date.now() + 28000;
  for (const connection of connections) {
    if (req.signal.aborted)
      throw new ContentError("The writing request was cancelled.", 499);
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    try {
      return parse(
        await complete(
          prompt,
          connection,
          AbortSignal.any([req.signal, AbortSignal.timeout(remaining)]),
          Math.min(connections.length === 1 ? 28000 : 10000, remaining),
        ),
      );
    } catch (error) {
      if (!transient(error)) {
        if (error instanceof ContentError) throw error;
        // Host authentication/configuration errors must not blame a visitor's key.
        throw new ContentError(
          "Mousa’s shared AI is temporarily unavailable. Connect your own key or use the sample workspace.",
          503,
        );
      }
    }
  }
  throw new ContentError(
    "Mousa’s shared AI providers are busy or out of allowance. Try again later, connect your own key, or use the sample workspace.",
    503,
  );
}
