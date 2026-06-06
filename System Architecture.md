Here is the complete, comprehensive technical specification for Project Panopticon. You can copy and paste this entire block directly into your coding agent (like Cursor, Aider, or Devin) as a `SYSTEM_SPEC.md` file. It contains the architecture, schemas, prompts, and the exact step-by-step logic required to build the Gold Tier submission.

```markdown
# SYSTEM SPECIFICATION: Project Panopticon
**Version:** 1.0 (Hackathon Gold-Tier Build)
**Objective:** Build an Adversarial Multi-Agent State Machine for Zero-Escalation Customer Resolution.

---

## 1. System Architecture overview

### Tech Stack
* **Frontend:** Next.js (App Router), Tailwind CSS, Framer Motion (for UI transitions).
* **Backend:** Node.js (Express or Next.js API Routes) / TypeScript.
* **Orchestration Engine:** FlowZint API (Handling LLM calls and credit routing).
* **Vector Database:** Pinecone or Milvus (for Support documentation RAG).
* **State Management/Memory:** Redis (Upstash) to maintain the multi-agent debate state before sending the final payload to the client.

### Directory Structure Requirements
```text
/project-panopticon
├── /app                  # Next.js Frontend
│   ├── /api              # Backend endpoints
│   ├── /components       # UI components (ChatBox, LiveDebugTerminal)
│   └── page.tsx          # Main Split-Screen Dashboard
├── /agents               # Core Agent Logic
│   ├── router.ts         # Directs initial traffic
│   ├── support.ts        # RAG implementation
│   ├── care.ts           # Sentiment & SLA logic
│   ├── sales.ts          # Upsell logic
│   └── contextGuard.ts   # Adversarial evaluation
├── /data                 # Vector DB seed scripts & synthetic data
├── /lib                  # Utilities (FlowZint API wrapper, Redis client)
└── /types                # TypeScript interfaces (Strict JSON schemas)

```

---

## 2. Multi-Agent Orchestration Flow (The DAG)

When a user submits a message, the backend executes the following Directed Acyclic Graph (DAG):

1. **Ingestion:** User message hits `/api/chat`.
2. **State Initialization:** Session ID created in Redis. Status: `PROCESSING`.
3. **Parallel Execution (The Generators):**
* `Support Agent` triggered -> Queries Vector DB -> Drafts Technical Fix.
* `Care Agent` triggered -> Analyzes Sentiment -> Drafts Apology/SLA Credit.
* `Sales Agent` triggered -> Analyzes User Profile -> Drafts Premium Upsell.


4. **Aggregation:** All three drafts are saved to Redis under the Session ID.
5. **Adversarial Evaluation (The Guardrail):**
* `ContextGuard Agent` pulls the three drafts + User Message.
* *Critique Loop:* ContextGuard evaluates against hardcoded rules (e.g., "No hallucinated API endpoints", "Max 20% discount").
* *Action:* If FAIL, triggers a rewrite command to the offending agent. If PASS, synthesizes all three drafts into one cohesive message.


6. **Delivery:** Final synthesized message is streamed to the user via Server-Sent Events (SSE). Debug logs streamed to the "Live Debug Terminal" in the UI.

---

## 3. Data Schemas (Strict JSON I/O)

Coding Agent: Enforce these interfaces strictly for all LLM structured outputs.

```typescript
// Initial User Payload
interface UserPayload {
  userId: string;
  tier: "Free" | "Standard" | "Enterprise";
  message: string;
  history: string[]; // Last 5 messages
}

// Internal Draft Payload (From Generators to Guardrail)
interface AgentDraft {
  agentRole: "Support" | "Care" | "Sales";
  draftText: string;
  confidenceScore: number;
  toolsUsed: string[];
}

// Guardrail Evaluation Payload
interface GuardrailEvaluation {
  status: "PASS" | "FAIL";
  critique: string;
  violatingAgent?: "Support" | "Care" | "Sales";
  synthesizedResponse?: string; // Only populated if PASS
}

```

---

## 4. Agent Prompts & System Instructions

### Agent 1: The Support Agent (RAG Focused)

**Model Requirement:** Fast, cheap model (e.g., Llama 3 8B or Gemini Flash via FlowZint).
**System Prompt:**

> "You are the Support Agent for a B2B SaaS platform. You receive user issues and technical documentation from the Vector Database. Your ONLY job is to draft a technical, step-by-step fix based strictly on the provided context. Do NOT apologize. Do NOT try to upsell. If the context does not contain the answer, state explicitly: 'ERROR: Knowledge not found.' Return your answer in plain text."

### Agent 2: The Customer Care Agent (Sentiment Focused)

**Model Requirement:** Fast, cheap model.
**System Prompt:**

> "You are the Customer Care Agent. Analyze the user's latest message for frustration. If they mention leaving, crashing, or losing money, set flightRisk to HIGH. Draft a 1-2 sentence empathetic apology. If flightRisk is HIGH, you are authorized to offer a standard '20% SLA Credit for this month'. Do not offer technical fixes."

### Agent 3: The Sales Agent (Contextual Upsell)

**Model Requirement:** Fast, cheap model.
**System Prompt:**

> "You are the Strategic Sales Agent. Look at the user's problem and their current tier. Draft a 1-2 sentence upsell that positions a higher tier as the permanent solution to their problem. For example, if they lack failover servers on the 'Standard' tier, pitch the 'Enterprise' tier. Be subtle, not aggressive."

### Agent 4: The ContextGuard Agent (The Adjudicator - CRITICAL)

**Model Requirement:** High-logic reasoning model (e.g., GPT-4o / Claude 3.5 Sonnet via FlowZint).
**System Prompt:**

> "You are ContextGuard, the final adversarial adjudicator. You will receive a user query and three drafted responses (Support, Care, Sales).
> **Your Rules:**
> 1. Verify the Support draft against common hallucination patterns (e.g., fake IP addresses).
> 2. Ensure Care is not offering more than 20% SLA credit.
> 3. Ensure Sales is not offering an upsell if the user is in extreme distress (overrule Sales if needed).
> **Task:** Synthesize the drafts into ONE seamless, professional response. Output your decision strictly as a JSON object matching the GuardrailEvaluation schema."
> 
> 

---

## 5. FlowZint API Integration Strategy

To maximize the 5000 FlowZint credits for the hackathon evaluation:

1. **Caching:** Implement an LRU cache or Redis cache for identical queries. If a judge asks the same test question twice, serve it from the cache. (0 credits used).
2. **Tiered Routing:** Only the `ContextGuard` uses the heavy, expensive FlowZint models. The other three agents use the cheapest available models, as their outputs are merely "drafts" that the Guardrail fixes.
3. **Dummy Data Webhooks:** Do not make real external API calls for billing/user profiles. Hardcode a `userProfile.json` in the backend to simulate database lookups instantly.

---

## 6. Frontend: The "Split-Screen" Demo UI

This is the most important part for the judges. The UI MUST be a split screen.

**Left Pane: The Client Interface**

* Standard, polished Chatbot UI (similar to ChatGPT or Intercom).
* Shows user messages and final Panopticon responses.

**Right Pane: The "Live War Room" (Debug Terminal)**

* A dark-mode terminal UI.
* **Functionality:** When the user hits send on the left pane, the right pane streams the internal multi-agent debate.
* **Visual cues to code:**
* `[System] Spawning 3 parallel agents...`
* `[Support] Draft complete (0.8s).`
* `[Sales] Draft complete (0.9s).`
* `[ContextGuard] Evaluating... WARNING: Hallucinated API key detected in Support Draft.`
* `[ContextGuard] Forcing Support rewrite...`
* `[ContextGuard] PASS. Synthesizing final response.`



## 7. Execution Steps for the Coding Agent

1. **Initialize Project:** Run `npx create-next-app@latest` with TypeScript and Tailwind.
2. **Install Dependencies:** `npm i redis @pinecone-database/pinecone framer-motion`.
3. **Setup Environment:** Create `.env` expecting `FLOWZINT_API_KEY`, `PINECONE_API_KEY`, `REDIS_URL`.
4. **Build API Routes:** Construct `/api/chat` to handle the DAG execution logic described in Section 2.
5. **Build Parallel Promises:** Use `Promise.all()` to trigger Support, Care, and Sales agents simultaneously to reduce latency.
6. **Implement Guardrail:** Take the results of the `Promise.all()` and feed them into the `ContextGuard` LLM call.
7. **Build UI:** Create the split-screen layout and connect it to the API. Use Server-Sent Events (SSE) so the right pane updates in real-time as the agents work.

```

```