export type CustomerTier = "Free" | "Standard" | "Enterprise";
export type AgentRole = "Support" | "Care" | "Sales";
export type GuardrailStatus = "PASS" | "FAIL";
export type WarRoomEventType =
  | "state"
  | "log"
  | "draft"
  | "guardrail"
  | "final"
  | "done"
  | "error";

export interface UserPayload {
  userId: string;
  tier: CustomerTier;
  message: string;
  history: string[];
}

export interface UserProfile {
  userId: string;
  companyName: string;
  tier: CustomerTier;
  monthlySpendUsd: number;
  contractRenewalDays: number;
  criticalIntegrations: string[];
  accountOwner: string;
}

export interface RetrievedDocument {
  id: string;
  title: string;
  section: string;
  text: string;
  score: number;
  tags: string[];
}

export interface AgentDraft {
  agentRole: AgentRole;
  draftText: string;
  confidenceScore: number;
  toolsUsed: string[];
  metadata?: Record<string, string | number | boolean>;
}

export interface GuardrailEvaluation {
  status: GuardrailStatus;
  critique: string;
  violatingAgent?: AgentRole;
  synthesizedResponse?: string;
  rewrittenDraft?: AgentDraft;
}

export interface WarRoomEvent {
  type: WarRoomEventType;
  sessionId: string;
  timestamp: string;
  message?: string;
  draft?: AgentDraft;
  evaluation?: GuardrailEvaluation;
  finalResponse?: string;
}

export interface PanopticonResult {
  sessionId: string;
  events: WarRoomEvent[];
  drafts: AgentDraft[];
  guardrail: GuardrailEvaluation;
  finalResponse: string;
  cacheHit: boolean;
}

export interface VectorIndexEntry {
  id: string;
  title: string;
  section: string;
  text: string;
  tags: string[];
  tokens: string[];
  termFrequency: Record<string, number>;
}

export interface VectorIndex {
  version: number;
  generatedAt: string;
  documents: VectorIndexEntry[];
  inverseDocumentFrequency: Record<string, number>;
}
