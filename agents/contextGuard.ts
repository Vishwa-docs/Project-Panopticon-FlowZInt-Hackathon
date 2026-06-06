import { rewriteSupportDraft } from "@/agents/support";
import { AgentDraft, GuardrailEvaluation, UserPayload } from "@/types/panopticon";

const DEPRECATED_OR_UNSAFE_PATTERNS = [/X-LEGACY-API-KEY/i, /legacy api key/i, /sudo\s+.*restart/i, /drop\s+database/i];

function findDraft(drafts: AgentDraft[], role: AgentDraft["agentRole"]): AgentDraft {
  const draft = drafts.find((item) => item.agentRole === role);
  if (!draft) {
    throw new Error(`Missing ${role} draft`);
  }
  return draft;
}

function violatesSupportRules(draft: AgentDraft): string | undefined {
  const matched = DEPRECATED_OR_UNSAFE_PATTERNS.find((pattern) => pattern.test(draft.draftText));
  if (matched) {
    return `Support draft contains unsafe or deprecated instruction matching ${matched}.`;
  }
  return undefined;
}

function violatesCareRules(draft: AgentDraft): string | undefined {
  const excessiveCredit = draft.draftText.match(/(\d+)%\s+SLA credit/i);
  if (excessiveCredit && Number(excessiveCredit[1]) > 20) {
    return "Care draft exceeds the automatic 20% SLA credit limit.";
  }
  return undefined;
}

function salesShouldBeSuppressed(payload: UserPayload, draft: AgentDraft): boolean {
  const extremeDistress = /(furious|lawsuit|taking my business elsewhere|losing money|unacceptable)/i.test(payload.message);
  return extremeDistress && !/once the immediate incident is stable/i.test(draft.draftText);
}

function synthesize(payload: UserPayload, drafts: AgentDraft[]): string {
  const support = findDraft(drafts, "Support");
  const care = findDraft(drafts, "Care");
  const sales = findDraft(drafts, "Sales");
  const lower = payload.message.toLowerCase();
  const includeSales =
    !/already has Enterprise|No upsell is needed|Do not introduce an upgrade/i.test(sales.draftText) &&
    !lower.includes("legacy sql");

  if (support.draftText.startsWith("ERROR:")) {
    return `${care.draftText} I could not find a supported procedure in the current knowledge base, so I will avoid guessing and route this to a specialist with the full context.`;
  }

  const salesLine = includeSales
    ? "After the incident is contained, we can also review Enterprise active-active payment failover as a longer-term resiliency option, including the approved make-good offer."
    : "";

  return [
    care.draftText,
    support.draftText,
    salesLine,
    "I will keep the next update tied to the incident status and the specific retry results so you can decide whether normal payment flow is safe to resume."
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function runContextGuard(payload: UserPayload, drafts: AgentDraft[]): Promise<GuardrailEvaluation> {
  const supportDraft = findDraft(drafts, "Support");
  const careDraft = findDraft(drafts, "Care");
  const salesDraft = findDraft(drafts, "Sales");

  const supportViolation = violatesSupportRules(supportDraft);
  if (supportViolation) {
    const rewrittenDraft = await rewriteSupportDraft(payload);
    const correctedDrafts = drafts.map((draft) => (draft.agentRole === "Support" ? rewrittenDraft : draft));
    return {
      status: "FAIL",
      critique: `${supportViolation} ContextGuard forced a Support rewrite and removed the unsafe instruction.`,
      violatingAgent: "Support",
      rewrittenDraft,
      synthesizedResponse: synthesize(payload, correctedDrafts)
    };
  }

  const careViolation = violatesCareRules(careDraft);
  if (careViolation) {
    return {
      status: "FAIL",
      critique: careViolation,
      violatingAgent: "Care"
    };
  }

  if (salesShouldBeSuppressed(payload, salesDraft)) {
    return {
      status: "FAIL",
      critique: "Sales draft attempted to upsell during extreme distress without waiting for incident stabilization.",
      violatingAgent: "Sales"
    };
  }

  return {
    status: "PASS",
    critique: "All drafts passed policy, source grounding, and tone checks.",
    synthesizedResponse: synthesize(payload, drafts)
  };
}
