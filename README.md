# Mousa

A calm writing room for finding an angle, shaping a short post, and giving it a second look. Built with Next.js App Router, TypeScript, React, Zustand, and Anthropic/OpenAI integrations.

## The writing flow

- Set an audience, topic, and tone; explore five ideas with opening hooks.
- Choose an idea, edit the draft, check its length, and copy it with optional hashtags.
- Review a draft and keep control of the final wording.
- Search and reopen saved ideas, drafts, and reviews. Draft edits persist across reloads.

The interface works on desktop and mobile, with labelled controls, keyboard focus, reduced-motion support, and explicit loading and error states.

## Sample launch

Without an API key, Mousa launches as a clearly labelled sample workspace. Ideas and drafts are authored examples; review notes illustrate the interface rather than assess the user's writing. Sample mode makes no external AI requests and does not require a database or account. Nothing is published automatically.

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

Users can select **Connect your AI**, choose Anthropic or OpenAI, and add their own API key. Live writing uses Claude Sonnet 5.5 or GPT-5.6 Terra. Adding a key checks its format without an AI request; the provider verifies it on the first live request. API usage is billed by the provider, separately from ChatGPT/Claude subscriptions. Sample mode remains available without a key.

Credentials live in a separate, non-persisted store in the current tab. Reload or Disconnect clears them. Keys travel through Mousa's server to the selected provider over HTTPS and are used only for that request; they are excluded from saved work, local/session storage, and database writes. Provider SDK logging and automatic retries are disabled, responses use `Cache-Control: no-store`, and OpenAI Responses uses `store: false`. Provider data retention policies still apply.

An optional host-configured Anthropic connection remains available: copy `.env.example` to `.env.local` and supply `ANTHROPIC_API_KEY` privately. `ANTHROPIC_MODEL` can configure that host connection. A visitor's supplied key takes priority and never falls back to host credentials after validation or provider errors. Host credentials never enter the browser bundle.

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

Import `mosesfawole/mousa` into Vercel, select the Next.js preset, and deploy the production branch. Leave host credentials unset to default to sample mode while allowing users to add their own keys. For an existing project, publish the production branch to trigger its deployment. No database setup is needed.
