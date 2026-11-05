# Mousa

A calm writing room for finding an angle, shaping a short post, and giving it a second look. Built with Next.js App Router, TypeScript, React, Zustand, and server-side AI provider routing.

## The writing flow

- Set an audience, topic, and tone; explore five ideas with opening hooks.
- Choose an idea, edit the draft, check its length, and copy it with optional hashtags.
- Review a draft and keep control of the final wording.
- Search and reopen saved ideas, drafts, and reviews. Draft edits persist across reloads.

The interface works on desktop and mobile, with labelled controls, keyboard focus, reduced-motion support, and explicit loading and error states.

## Sample launch

Without a shared AI configuration or a personal API key, Mousa launches as a clearly labelled sample workspace. Ideas and drafts are authored examples; review notes illustrate the interface rather than assess the user's writing. Sample mode makes no external AI requests and does not require a database or account. Nothing is published automatically.

Work stays in this browser's local storage, including up to 50 saved items. It does not sync across devices. Copy important drafts before clearing browser data. Storage failures show a message while preserving the in-memory draft.

## Run locally

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For a production run:

```sh
npm run build
npm start
```

## Optional live AI

Users can select **Connect your AI**, choose Anthropic, OpenAI, Groq, OpenRouter, or FortyTwo, and add their own API key. Models are listed in the connection panel. Adding a key checks its format without an AI request; the provider verifies it on the first live request. Usage counts against the provider's free allowance or credits, separately from ChatGPT/Claude subscriptions. Sample mode remains available without a key.

Credentials live in a separate, non-persisted store in the current tab. Reload or Disconnect clears them. Keys travel through Mousa's server to the selected provider over HTTPS and are used only for that request; they are excluded from saved work, local/session storage, and database writes. Provider SDK logging and automatic retries are disabled, responses use `Cache-Control: no-store`, and OpenAI Responses uses `store: false`. Provider data retention policies still apply.

### Shared AI and provider fallback

Copy `.env.example` to `.env.local`, or add the variables in your deployment's private settings. Configure any subset of `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `FORTYTWO_API_KEY`, `ANTHROPIC_API_KEY`, and `OPENAI_API_KEY`. Each has a matching optional `*_MODEL` variable. **FortyTwo can be the only configured provider**; its default model is `qwen/qwen3.8-27b` at `https://api.fortytwo.network/v1`. Your account's available credits pay for those requests. Never prefix secrets with `NEXT_PUBLIC_`.

The default `MOUSA_AI_PROVIDER_ORDER=groq,openrouter,fortytwo,anthropic,openai` tries configured free services before credit-backed ones. Missing keys are skipped. Set the order to `fortytwo` to use only FortyTwo, or omit any provider you do not want to fund. Host OpenRouter models must be `openrouter/free` or end in `:free`; paid model overrides are excluded. Groq's eligibility and quotas depend on your account plan. Configure provider-side spending limits for credit-backed accounts.

With `MOUSA_AI_ROUTING=priority`, the first available configured provider is tried first. With `MOUSA_AI_ROUTING=rotate`, each request starts at a randomly selected provider, then walks through the remaining providers in order. This distributes first attempts across stateless server instances; it does not guarantee equal traffic. Rotation can use FortyTwo or other paid credits even when a free provider is available. Priority is the default to conserve credits.

Fallback happens on network errors, timeouts, exhausted credits (402), rate limits (429), and transient service failures (408/500/502/503/504). Each provider is attempted once, with no SDK retries and a 28-second total provider budget. Invalid credentials, permissions, refusals, malformed output, and validation errors stop the request. Failed shared AI requests remain errors; Mousa never substitutes a sample response and labels it as live. A fallback may send the same brief to another provider and may incur provider usage even if an earlier request timed out.

A visitor's supplied key takes priority and never falls back to host credentials or another provider after validation or provider errors. Host credentials never enter the browser bundle. The studio starts in shared live mode when configured and offers a switch to sample mode; without a working configuration, it starts in sample mode. The live banner names the configured shared providers.

### Shared usage caps

Production shared AI requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from an Upstash Redis database. These protect the same budget across Vercel instances and restarts. The app reserves three atomic budgets before calling AI: 3 shared writing requests per minute per visitor IP, `MOUSA_AI_VISITOR_DAILY_LIMIT=10` per UTC day per visitor IP, and `MOUSA_AI_GLOBAL_DAILY_LIMIT=100` per UTC day across the deployment. Each generate, draft, or review operation counts as one reservation, including failures; provider fallback does not reserve again. These are request caps, not dollar spending limits.

Redis stores only expiring counter keys and counts. Visitor IPs are HMAC-hashed, and drafts and provider credentials are not written to Redis. On Vercel, only its platform-controlled `x-vercel-forwarded-for` header identifies the visitor; on other hosts, all visitors conservatively share one visitor bucket until a trusted proxy adapter is added. People behind the same IP share an allowance.

If Redis is unavailable, shared requests fail closed with an explanation and the option to connect a personal key or use sample mode. If Redis is not configured, shared live mode stays disabled in production. Local development uses in-memory counters when Redis is absent. Personal keys and sample mode do not use the shared limiter and need no Redis connection.

For a first FortyTwo-only production setup:

1. Add `FORTYTWO_API_KEY` privately to Vercel; keep `FORTYTWO_MODEL=qwen/qwen3.8-27b`.
2. Add the two Upstash Redis REST variables privately. Set provider-side spend limits in your FortyTwo account.
3. Set `MOUSA_AI_PROVIDER_ORDER=fortytwo` and `MOUSA_AI_ROUTING=priority`, then deploy this version.
4. Open the studio and make a small live request to verify your account's model access and credits. Automated tests use simulated provider HTTP responses, not your account.
5. Later, add Groq and/or OpenRouter keys and change the order to `groq,openrouter,fortytwo`. No code change is needed.

Provider references: [FortyTwo API](https://docs.fortytwo.network/), [FortyTwo models](https://docs.fortytwo.network/docs/models), [Groq compatibility](https://console.groq.com/docs/openai), [OpenRouter free models](https://openrouter.ai/collections/free-models), [Upstash REST API](https://upstash.com/docs/redis/features/restapi).

Tests exercise the actual SDKs against simulated HTTP responses for key routing and errors. The browser flow is verified without a valid paid provider key; successful generation against real provider accounts is not part of that verification.

The server validates input lengths, tones, modes, and provider output. Legacy anonymous server history is retired: `/api/history` and `/api/histore` return 410. Current saved work uses browser storage, independent of Supabase availability.

## Checks

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

Regression tests cover request validation, missing credentials, malformed provider output, working generation without a database, local origin handling, draft edit preservation, saved brief context, review provenance, persistence, and storage failure.

## Deploy

Import `mosesfawole/mousa` into Vercel, select the Next.js preset, and deploy the production branch. Leave host credentials unset to default to sample mode while allowing users to add their own keys. To include shared AI, configure at least one host provider and the durable usage caps described above. For an existing project, publish the production branch to trigger its deployment. No content database is needed; only shared host-funded AI requires Redis.
