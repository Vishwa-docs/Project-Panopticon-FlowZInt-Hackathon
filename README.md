# Project Panopticon

Project Panopticon is a zero-escalation support system that turns a customer escalation into an invisible multi-agent war room. The customer sees one calm, grounded response; judges can see the internal Support, Customer Care, Sales, and ContextGuard agents debate in real time.

## What It Does

- Runs Support, Care, and Sales agents in parallel through a TypeScript DAG.
- Uses a local vector database built from `data/synthetic_kb.md` for grounded support retrieval.
- Applies adversarial review through ContextGuard before any customer-facing message is released.
- Streams every internal event to the right-side Live War Room terminal using Server-Sent Events.
- Caches identical adjudicated requests so repeated judge prompts use zero model credits.
- Includes OpenAPI documentation, test cases, Remotion video generation, and submission packaging.

## Run Locally

```bash
npm install
npm run index:kb
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Verify

```bash
npm run verify
```

The verification script builds the vector index, typechecks, runs Vitest, and creates a production Next.js build.

## Demo Prompt

Paste this:

```text
Your API crashed again and my payment gateway is down. I'm taking my business elsewhere!
```

The Support draft intentionally includes a deprecated key from retrieved context. ContextGuard catches it, forces a rewrite, and the final answer excludes the unsafe instruction.

## Environment

The app runs without external credentials. Optional FlowZint and Redis settings are documented in `.env.example`; when keys are present, `lib/flowzint.ts` is ready for provider-backed completions.

## Project Layout

```text
app/                 Next.js app, SSE routes, UI
agents/              Support, Care, Sales, ContextGuard, DAG router
data/                Synthetic KB, test cases, local vector index
docs/                Architecture, prompts, OpenAPI docs
lib/                 Vector search, cache, profiles, provider hooks
remotion/            Programmatic demo video composition
scripts/             Indexing, screenshots, submission packaging
tests/               Orchestration and guardrail tests
submission/          Final code bundle, screenshots, LaTeX, demo script
```
