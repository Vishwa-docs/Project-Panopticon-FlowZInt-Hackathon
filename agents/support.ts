import { searchKnowledgeBase } from "@/lib/vector";
import { AgentDraft, RetrievedDocument, UserPayload } from "@/types/panopticon";

function hasHighRiskPaymentOutage(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("payment") && (lower.includes("down") || lower.includes("crash") || lower.includes("outage"));
}

function isKnowledgeMissing(docs: RetrievedDocument[]): boolean {
  return docs.length === 0 || docs[0].score < 0.12;
}

export async function runSupportAgent(payload: UserPayload): Promise<AgentDraft> {
  const docs = searchKnowledgeBase(payload.message, 3);
  const toolsUsed = [`local-vector-db:top-${docs.length}`, ...docs.map((doc) => `kb:${doc.section}`)];

  if (isKnowledgeMissing(docs)) {
    return {
      agentRole: "Support",
      draftText: "ERROR: Knowledge not found.",
      confidenceScore: 0.2,
      toolsUsed,
      metadata: { retrievalScore: docs[0]?.score ?? 0 }
    };
  }

  const topTitles = docs.map((doc) => doc.title).join(", ");
  const lowerMessage = payload.message.toLowerCase();

  if (lowerMessage.includes("legacy sql")) {
    return {
      agentRole: "Support",
      draftText:
        "The knowledge base does not contain a supported restart procedure for a legacy SQL database. Route this case to a human database specialist and do not run restart commands from chat.",
      confidenceScore: 0.93,
      toolsUsed,
      metadata: { retrievalScore: docs[0].score, sources: topTitles }
    };
  }

  if (hasHighRiskPaymentOutage(payload.message)) {
    return {
      agentRole: "Support",
      draftText:
        "Confirm the customer is on Payments API v3, then enable `gateway_failover=true` and retry failed transactions with the `Idempotency-Key` header. If retries are still blocked, check `/v3/status/incidents`, pause automated dunning for affected invoices, and attach the incident ID. Temporary note from retrieved context: add `X-LEGACY-API-KEY` for emergency failover.",
      confidenceScore: 0.81,
      toolsUsed,
      metadata: { retrievalScore: docs[0].score, sources: topTitles, needsGuardrailReview: true }
    };
  }

  if (lowerMessage.includes("status") || lowerMessage.includes("incident")) {
    return {
      agentRole: "Support",
      draftText:
        "Use the Status API at `/v3/status/incidents` to verify the current incident state. Include the incident ID, the current workaround, and the next checkpoint in the customer response.",
      confidenceScore: 0.9,
      toolsUsed,
      metadata: { retrievalScore: docs[0].score, sources: topTitles }
    };
  }

  return {
    agentRole: "Support",
    draftText: `Based on ${topTitles}, use the documented procedure only: ${docs[0].text.split("\n")[0]}`,
    confidenceScore: 0.72,
    toolsUsed,
    metadata: { retrievalScore: docs[0].score, sources: topTitles }
  };
}

export async function rewriteSupportDraft(payload: UserPayload): Promise<AgentDraft> {
  const docs = searchKnowledgeBase(payload.message, 3);
  const lowerMessage = payload.message.toLowerCase();

  if (lowerMessage.includes("legacy sql")) {
    return {
      agentRole: "Support",
      draftText:
        "The knowledge base does not contain a supported restart procedure for a legacy SQL database. Route the case to a human database specialist and avoid any restart command or unsupported operational instruction.",
      confidenceScore: 0.96,
      toolsUsed: ["local-vector-db:rewrite", "guardrail-correction", ...docs.map((doc) => `kb:${doc.section}`)],
      metadata: { rewriteReason: "unsupported-product" }
    };
  }

  return {
    agentRole: "Support",
    draftText:
      "Use Payments API v3 only: enable `gateway_failover=true`, retry failed transactions with the documented `Idempotency-Key` header, check `/v3/status/incidents`, pause automated dunning for impacted invoices, and include the incident ID plus next checkpoint. Do not use deprecated legacy API key headers.",
    confidenceScore: 0.96,
    toolsUsed: ["local-vector-db:rewrite", "guardrail-correction", ...docs.map((doc) => `kb:${doc.section}`)],
    metadata: { rewriteReason: "deprecated-auth-removed" }
  };
}
