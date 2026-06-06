import { clamp } from "@/lib/text";
import { AgentDraft, UserPayload } from "@/types/panopticon";

export function scoreFlightRisk(message: string): number {
  const lower = message.toLowerCase();
  let score = 18;
  if (/(leaving|elsewhere|cancel|churn|competitor|business elsewhere)/.test(lower)) score += 40;
  if (/(crashed|down|outage|failed|blocking|broken)/.test(lower)) score += 22;
  if (/(payment|money|revenue|invoice|gateway)/.test(lower)) score += 15;
  if (/(again|always|angry|furious|unacceptable)/.test(lower)) score += 10;
  return clamp(score, 0, 100);
}

export async function runCareAgent(payload: UserPayload): Promise<AgentDraft> {
  const riskScore = scoreFlightRisk(payload.message);
  const flightRisk = riskScore >= 70 ? "HIGH" : riskScore >= 45 ? "MEDIUM" : "LOW";
  const creditLine =
    flightRisk === "HIGH"
      ? "I can apply a 20% SLA credit for this month while we stabilize the incident."
      : "I will keep the response focused and make sure the issue is tracked clearly.";

  return {
    agentRole: "Care",
    draftText: `I am sorry this disrupted your team, especially with a production workflow at stake. ${creditLine}`,
    confidenceScore: flightRisk === "HIGH" ? 0.94 : 0.82,
    toolsUsed: ["sentiment-risk-scorer", "sla-policy-table"],
    metadata: {
      flightRisk,
      riskScore
    }
  };
}
