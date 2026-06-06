# Project Panopticon Demo Script

## Opening

Project Panopticon is a zero-escalation support war room. The customer never talks to a single bot. Their escalation triggers Support, Care, Sales, and ContextGuard agents that debate privately before one safe final answer is delivered.

## Show The App

1. Open `http://127.0.0.1:3000`.
2. Show the split screen: customer interface on the left, Live War Room on the right.
3. Click **Payment outage**.
4. Read the customer prompt aloud: "Your API crashed again and my payment gateway is down. I'm taking my business elsewhere!"
5. Point to the terminal as the three agents complete in parallel.
6. Pause at the ContextGuard warning. Explain that Support retrieved a deprecated key pattern, and ContextGuard blocked it before the customer saw it.
7. Show the Support rewrite.
8. Show the final answer on the left: it includes the technical fix, 20% SLA credit, and a calm Enterprise failover make-good after stabilization.

## Trick Question

1. Click **Trick question**.
2. Explain that many chatbots would invent a restart command.
3. Show that Panopticon refuses to hallucinate and routes the case to a human database specialist.

## Enterprise Case

1. Click **Enterprise status**.
2. Show `/v3/status/incidents`.
3. Point out that Sales is suppressed because the customer is already Enterprise.

## Close

Panopticon combines grounded RAG, churn scoring, make-good strategy, adversarial guardrails, and streaming observability. It is built for support outcomes, not chatbot theater.
