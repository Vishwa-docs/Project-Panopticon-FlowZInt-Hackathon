# Demo Instructions

1. Start the app with `npm run dev`.
2. Open `http://127.0.0.1:3000`.
3. Click **Payment outage** or paste:

```text
Your API crashed again and my payment gateway is down. I'm taking my business elsewhere!
```

4. Point to the left pane first: the customer only sees a final, polished response.
5. Point to the right pane next: Support, Care, and Sales draft in parallel.
6. Pause when ContextGuard warns about the deprecated `X-LEGACY-API-KEY`.
7. Show the Support rewrite and the final response using `gateway_failover=true`, `Idempotency-Key`, and `/v3/status/incidents`.
8. Click **Trick question** and show that the system refuses to invent a legacy SQL restart procedure.
9. Click **Enterprise status** and show that Sales is suppressed because an Enterprise customer should not be upsold.

Close by saying: Panopticon is not another chatbot. It is a real-time adversarial support operating system that resolves technical, retention, and commercial risk before the customer response is delivered.
