# Project: Project Panopticon (The Autonomous "War Room")

**Tagline:** *Zero-Escalation Support through Adversarial Multi-Agent Orchestration.*

## 1. The Core Concept (Hitting the 30% Innovation Criteria)
Customer issues aren't one-dimensional. When an enterprise client is angry about a bug, they need Support (the fix), Customer Care (the apology/retention), and Sales (the strategic "make-good" upsell). 

**Project Panopticon** completely re-imagines the chatbot. When a user sends a message, they don't talk to a bot; they trigger an **invisible, micro-second "War Room."** Using the 5000 FlowZint Credits, Panopticon spins up 4 distinct agents in the backend that debate and construct the perfect response before the user ever sees a single word.

## 2. The Multi-Agent Workflow (The "War Room" in Action)

1. **The User Prompt:** *"Your API crashed again and my payment gateway is down. I'm taking my business elsewhere!"*
2. **Phase 1: Parallel Processing (The 3 Tracks)**
   * **The Support Agent:** Immediately runs a semantic search on the documentation vector database, identifies the API outage, and generates the technical workaround.
   * **The Care Agent:** Analyzes the churn risk (High) and drafts an empathetic apology, authorizing a 20% SLA credit.
   * **The Sales Agent:** Looks at the user's tier. Notices they are on the "Standard" tier which lacks dedicated failover servers. Drafts an upsell to the "Enterprise" tier, offering the first 3 months free as an apology.
3. **Phase 2: The Adversarial Guardrail (The RedTeam Feature)**
   * The **ContextGuard Agent** receives all three drafts. Its sole job is to attack the outputs.
   * *Guardrail Action:* It flags that the Support Agent hallucinated a deprecated API key. It forces the Support Agent to rewrite the fix. It combines the Care and Sales drafts into one cohesive, non-aggressive message.
4. **Phase 3: The Output**
   * A single, flawless, fact-checked, and commercially optimized response is delivered to the user.

## 3. Planned Architecture & FlowZint Integration (The 25% Tech Arch Criteria)

*   **Orchestration Engine:** FlowZint API (Handles the state-machine logic. Instead of chaining prompts, we use a directed acyclic graph (DAG) where agents only trigger when dependencies are met).
*   **LLM Routing (Mixture of Experts):** 
    *   *Router/Guardrail:* High-logic model (e.g., GPT-4o / Claude 3.5 Sonnet / Gemini 1.5 Pro).
    *   *Support/Care Agents:* Fast, low-latency models (e.g., Llama 3 8B or Gemini Flash) to save credits and reduce Time-to-First-Token.
*   **Memory & Context:** Redis (for session state) + Pinecone/Milvus (Vector DB for Support RAG).
*   **Frontend:** Next.js + Tailwind UI.

## 4. Feature Matrix Mapped to Hackathon Tracks

| Track | Panopticon Feature | Why it Wins |
| :--- | :--- | :--- |
| **Support** | **Self-Reflective RAG** | It doesn't just retrieve docs; it writes a fix, tests it against the ContextGuard, and rewrites it if it hallucinates. |
| **Customer Care** | **Predictive Churn Scoring** | Assigns a real-time "Flight Risk" score based on sentiment, automatically unlocking SLA credits without human approval. |
| **Sales** | **Contextual "Make-Good" Upselling** | Turns a crisis into revenue by offering premium tier upgrades as solutions to the user's technical problems. |

## 5. Team Division (Max 4 Members, 4-Week Sprint)

*   **Week 1 (Registration/Setup):** Team forms. **AI Lead** maps the agent prompt structures. **Data Lead** generates a synthetic enterprise knowledge base (fake API docs, pricing tiers).
*   **Week 2 (Core Build):** **Backend Engineer** builds the FlowZint orchestration loop (Agent A -> Agent B -> Guardrail). **Frontend Engineer** builds the chat UI.
*   **Week 3 (Refinement):** Implement the "Split-Screen" view. This is crucial. The UI must show the user chat on the left, and a "Live Terminal" on the right where judges can literally see the agents debating and correcting each other.
*   **Week 4 (Submission/Docs):** Polish the README, record the demo video, ensure zero private links.

## 6. The Masterpiece Repository (The 20% Documentation Criteria)

To avoid the automated rejection and secure perfect documentation points, your repo must look like a venture-backed startup, not a weekend project.

```text
├── .github/workflows/    # CI/CD pipelines
├── web/                  # Next.js Frontend
├── orchestration/        # Python/Node backend for FlowZint mapping
├── data/
│   ├── synthetic_kb.md   # The fake company data the bot uses
│   └── test_cases.json   # Pre-built scenarios for the judges to test
├── docs/
│   ├── ARCHITECTURE.md   # Detailed system design diagram
│   └── PROMPTS.md        # The exact system prompts for all 4 agents
├── .env.example          # Clean, well-commented env file
├── README.md             # The Hook, The Problem, The Solution, The Setup
└── DEMO_INSTRUCTIONS.md  # "Copy and paste this exact prompt to see the Guardrail work"

---

### The "Kill Shot" Demo Strategy
When it comes time for the evaluation (Days 28-29), the judges will look at dozens of standard chatbots. 

**Do not just record a screen of a chatbot working.** 
Instead, start your video presentation by explicitly typing a trick question designed to make the AI fail (e.g., *"How do I restart the legacy SQL database?"* — a database your synthetic company doesn't use). 

Show the judges the "Debug View." Let them watch your Support Agent attempt to hallucinate an answer, and then watch your ContextGuard Agent intervene, block the message, and force a correction in real-time. Proving your system is *safe* and *self-correcting* is the ultimate flex that guarantees a Gold Tier finish.