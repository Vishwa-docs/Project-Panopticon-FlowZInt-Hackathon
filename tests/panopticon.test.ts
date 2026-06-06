import { describe, expect, it } from "vitest";
import testCases from "@/data/test_cases.json";
import { runPanopticon } from "@/agents/router";
import { scoreFlightRisk } from "@/agents/care";
import { searchKnowledgeBase } from "@/lib/vector";
import { UserPayload } from "@/types/panopticon";

describe("Project Panopticon orchestration", () => {
  it("retrieves local knowledge base documents", () => {
    const docs = searchKnowledgeBase("payment gateway failover incident", 2);
    expect(docs[0].title).toMatch(/Payment Gateway|Incident/);
    expect(docs[0].score).toBeGreaterThan(0.1);
  });

  it("scores churn risk from angry outage language", () => {
    expect(scoreFlightRisk("Your payment gateway is down and I am taking my business elsewhere")).toBeGreaterThanOrEqual(70);
  });

  it.each(testCases)("satisfies demo case: $name", async ({ payload, expected }) => {
    const result = await runPanopticon(payload as UserPayload);
    for (const phrase of expected.contains) {
      expect(result.finalResponse).toContain(phrase);
    }
    for (const phrase of expected.forbidden) {
      expect(result.finalResponse).not.toContain(phrase);
    }
    expect(result.guardrail.status).toBe("PASS");
  });

  it("forces a support rewrite when a deprecated key appears", async () => {
    const result = await runPanopticon({
      userId: "acme-standard-rewrite",
      tier: "Standard",
      message: "Your API crashed again and my payment gateway is down. I'm taking my business elsewhere!",
      history: []
    });

    expect(result.events.some((event) => event.message?.includes("WARNING"))).toBe(true);
    expect(result.drafts.find((draft) => draft.agentRole === "Support")?.draftText).not.toContain("X-LEGACY-API-KEY");
    expect(result.finalResponse).toContain("gateway_failover=true");
  });
});
