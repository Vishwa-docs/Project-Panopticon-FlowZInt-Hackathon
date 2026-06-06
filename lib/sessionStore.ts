import { PanopticonResult } from "@/types/panopticon";

const store = new Map<string, PanopticonResult>();

export function saveSession(result: PanopticonResult): void {
  store.set(result.sessionId, result);
}

export function getSession(sessionId: string): PanopticonResult | undefined {
  return store.get(sessionId);
}
