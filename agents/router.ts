import { runCareAgent } from "@/agents/care";
import { runContextGuard } from "@/agents/contextGuard";
import { runSalesAgent } from "@/agents/sales";
import { runSupportAgent } from "@/agents/support";
import { getCachedResult, setCachedResult } from "@/lib/cache";
import { saveSession } from "@/lib/sessionStore";
import { AgentDraft, PanopticonResult, UserPayload, WarRoomEvent } from "@/types/panopticon";

type Emit = (event: WarRoomEvent) => void;

function sessionId(): string {
  return `pan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function event(sessionIdValue: string, partial: Omit<WarRoomEvent, "sessionId" | "timestamp">): WarRoomEvent {
  return {
    sessionId: sessionIdValue,
    timestamp: new Date().toISOString(),
    ...partial
  };
}

async function withTiming<T>(minimumMs: number, task: () => Promise<T>): Promise<T> {
  const started = Date.now();
  const result = await task();
  const remaining = minimumMs - (Date.now() - started);
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
  return result;
}

export async function runPanopticon(payload: UserPayload, emit?: Emit): Promise<PanopticonResult> {
  const cached = getCachedResult(payload);
  if (cached) {
    const cachedSessionId = sessionId();
    const cachedEvents = [
      event(cachedSessionId, { type: "log", message: "[Cache] Identical query found. Replaying prior adjudicated response with zero model credits." }),
      event(cachedSessionId, { type: "final", finalResponse: cached.finalResponse }),
      event(cachedSessionId, { type: "done", message: "Complete" })
    ];
    cachedEvents.forEach((item) => emit?.(item));
    return {
      ...cached,
      sessionId: cachedSessionId,
      events: cachedEvents,
      cacheHit: true
    };
  }

  const id = sessionId();
  const events: WarRoomEvent[] = [];
  const push = (partial: Omit<WarRoomEvent, "sessionId" | "timestamp">) => {
    const item = event(id, partial);
    events.push(item);
    emit?.(item);
  };

  push({ type: "state", message: "PROCESSING" });
  push({ type: "log", message: "[System] Session initialized. Building adversarial DAG." });
  push({ type: "log", message: "[System] Spawning 3 parallel agents..." });

  const [support, care, sales] = await Promise.all([
    withTiming(560, () => runSupportAgent(payload)),
    withTiming(430, () => runCareAgent(payload)),
    withTiming(510, () => runSalesAgent(payload))
  ]);

  const drafts: AgentDraft[] = [support, care, sales];
  for (const draft of drafts) {
    push({
      type: "draft",
      message: `[${draft.agentRole}] Draft complete. confidence=${draft.confidenceScore.toFixed(2)} tools=${draft.toolsUsed.join(", ")}`,
      draft
    });
  }

  push({ type: "log", message: "[ContextGuard] Evaluating source grounding, discount policy, and tone..." });
  const guardrail = await withTiming(650, () => runContextGuard(payload, drafts));

  const finalDrafts = guardrail.rewrittenDraft
    ? drafts.map((draft) => (draft.agentRole === guardrail.rewrittenDraft?.agentRole ? guardrail.rewrittenDraft : draft))
    : drafts;

  if (guardrail.status === "FAIL" && guardrail.rewrittenDraft) {
    push({
      type: "guardrail",
      message: `[ContextGuard] WARNING: ${guardrail.critique}`,
      evaluation: guardrail
    });
    push({
      type: "draft",
      message: `[${guardrail.rewrittenDraft.agentRole}] Rewrite complete after adversarial review.`,
      draft: guardrail.rewrittenDraft
    });
    push({ type: "log", message: "[ContextGuard] PASS after rewrite. Synthesizing final response." });
  } else if (guardrail.status === "PASS") {
    push({
      type: "guardrail",
      message: `[ContextGuard] PASS. ${guardrail.critique}`,
      evaluation: guardrail
    });
  } else {
    push({
      type: "guardrail",
      message: `[ContextGuard] BLOCKED. ${guardrail.critique}`,
      evaluation: guardrail
    });
  }

  const finalResponse =
    guardrail.synthesizedResponse ??
    "I am pausing the automated response because the guardrail found a policy issue. A human specialist should review this case.";
  push({ type: "final", finalResponse });
  push({ type: "done", message: "Complete" });

  const result: PanopticonResult = {
    sessionId: id,
    events,
    drafts: finalDrafts,
    guardrail: {
      ...guardrail,
      status: guardrail.synthesizedResponse ? "PASS" : guardrail.status,
      critique: guardrail.critique
    },
    finalResponse,
    cacheHit: false
  };
  saveSession(result);
  setCachedResult(payload, result);
  return result;
}
