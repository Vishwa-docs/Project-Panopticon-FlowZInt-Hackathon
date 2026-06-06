import { getUserProfile } from "@/lib/profiles";
import { AgentDraft, UserPayload } from "@/types/panopticon";

export async function runSalesAgent(payload: UserPayload): Promise<AgentDraft> {
  const profile = getUserProfile(payload.userId, payload.tier);
  const lower = payload.message.toLowerCase();
  const paymentPain = lower.includes("payment") || lower.includes("gateway") || lower.includes("failover");
  const distress = /(taking my business elsewhere|furious|unacceptable|losing money|crashed again)/.test(lower);

  if (profile.tier === "Enterprise") {
    return {
      agentRole: "Sales",
      draftText: "No upsell is needed because the customer already has Enterprise coverage; reinforce their incident bridge and named support path.",
      confidenceScore: 0.9,
      toolsUsed: ["user-profile", "tier-capability-map"],
      metadata: { suppressed: true, reason: "already-enterprise" }
    };
  }

  if (!paymentPain) {
    return {
      agentRole: "Sales",
      draftText: "Do not introduce an upgrade in the first response; the issue does not map directly to a premium resiliency capability.",
      confidenceScore: 0.76,
      toolsUsed: ["user-profile", "tier-capability-map"],
      metadata: { suppressed: true, reason: "not-capability-mapped" }
    };
  }

  const makeGood = profile.tier === "Standard" ? "with the first three months included as a make-good" : "with an assisted migration";
  return {
    agentRole: "Sales",
    draftText: `Once the immediate incident is stable, offer Enterprise active-active payment failover ${makeGood}; position it as a resiliency path, not a replacement for solving today's outage.`,
    confidenceScore: distress ? 0.7 : 0.86,
    toolsUsed: ["user-profile", "tier-capability-map", "make-good-policy"],
    metadata: {
      currentTier: profile.tier,
      distress,
      mappedFeature: "Enterprise active-active payment failover"
    }
  };
}
