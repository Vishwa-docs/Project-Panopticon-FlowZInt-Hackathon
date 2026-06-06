import { PanopticonResult, UserPayload } from "@/types/panopticon";

const cache = new Map<string, { expiresAt: number; result: PanopticonResult }>();

function stablePayloadKey(payload: UserPayload): string {
  return JSON.stringify({
    userId: payload.userId,
    tier: payload.tier,
    message: payload.message.trim().toLowerCase(),
    history: payload.history.slice(-5)
  });
}

export function getCachedResult(payload: UserPayload): PanopticonResult | undefined {
  const entry = cache.get(stablePayloadKey(payload));
  if (!entry) {
    return undefined;
  }
  if (entry.expiresAt < Date.now()) {
    cache.delete(stablePayloadKey(payload));
    return undefined;
  }
  return entry.result;
}

export function setCachedResult(payload: UserPayload, result: PanopticonResult): void {
  const ttlSeconds = Number(process.env.PANOPTICON_CACHE_TTL_SECONDS ?? "3600");
  cache.set(stablePayloadKey(payload), {
    expiresAt: Date.now() + ttlSeconds * 1000,
    result
  });
}
