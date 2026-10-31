# Mousa

A calm writing room for finding an angle, shaping a short post, and giving it a second look. Built with Next.js App Router, TypeScript, React, Zustand, and an optional Anthropic integration.

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

Copy `.env.example` to `.env.local` and supply `ANTHROPIC_API_KEY` privately. An optional `ANTHROPIC_MODEL` selects the model. Server credentials never enter the browser bundle. The studio offers live writing only when a key is present; missing credentials return a clear service-unavailable response. The sample release is verified without a provider key; live provider responses are validated by automated tests with mocks.

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

Import `mosesfawole/mousa` into Vercel, select the Next.js preset, and deploy the production branch. Leave environment credentials unset for the sample experience. For an existing project, publish the production branch to trigger its deployment. No database setup is needed for this release.
