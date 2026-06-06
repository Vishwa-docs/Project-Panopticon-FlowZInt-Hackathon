"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, CircleDollarSign, Command, Play, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import { AgentDraft, CustomerTier, WarRoomEvent } from "@/types/panopticon";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const demoPrompts = [
  {
    label: "Payment outage",
    tier: "Standard" as CustomerTier,
    userId: "acme-standard",
    message: "Your API crashed again and my payment gateway is down. I'm taking my business elsewhere!"
  },
  {
    label: "Trick question",
    tier: "Free" as CustomerTier,
    userId: "northwind-free",
    message: "How do I restart the legacy SQL database? It is blocking our migration."
  },
  {
    label: "Enterprise status",
    tier: "Enterprise" as CustomerTier,
    userId: "globex-enterprise",
    message: "We need the current incident status endpoint for payments."
  }
];

function parseSse(buffer: string, onEvent: (event: WarRoomEvent) => void): string {
  const chunks = buffer.split("\n\n");
  const remainder = chunks.pop() ?? "";
  for (const chunk of chunks) {
    const dataLine = chunk
      .split("\n")
      .find((line) => line.startsWith("data: "))
      ?.slice(6);
    if (dataLine) {
      onEvent(JSON.parse(dataLine) as WarRoomEvent);
    }
  }
  return remainder;
}

function eventTone(event: WarRoomEvent): string {
  if (event.type === "guardrail" && event.message?.includes("WARNING")) return "text-amber-300";
  if (event.type === "final" || event.message?.includes("PASS")) return "text-emerald-300";
  if (event.type === "error") return "text-red-300";
  if (event.type === "draft") return "text-sky-200";
  return "text-zinc-300";
}

export function PanopticonDashboard() {
  const [tier, setTier] = useState<CustomerTier>("Standard");
  const [userId, setUserId] = useState("acme-standard");
  const [message, setMessage] = useState(demoPrompts[0].message);
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Panopticon is ready. Send a customer escalation and the war room will resolve it before the customer sees the answer."
    }
  ]);
  const [events, setEvents] = useState<WarRoomEvent[]>([]);
  const [drafts, setDrafts] = useState<Record<string, AgentDraft>>({});
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const guardrailWarnings = useMemo(() => events.filter((event) => event.message?.includes("WARNING")).length, [events]);
  const finalEvent = events.findLast((event) => event.type === "final");

  async function submit(nextMessage = message, nextTier = tier, nextUserId = userId) {
    const cleanMessage = nextMessage.trim();
    if (!cleanMessage || isRunning) return;

    setIsRunning(true);
    setMessage(cleanMessage);
    setTier(nextTier);
    setUserId(nextUserId);
    setEvents([]);
    setDrafts({});
    setChat((current) => [...current, { role: "user", text: cleanMessage }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: nextUserId,
          tier: nextTier,
          message: cleanMessage,
          history: chat.slice(-5).map((item) => `${item.role}: ${item.text}`)
        })
      });

      if (!response.ok || !response.body) {
        throw new Error(`Request failed with ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const handleEvent = (event: WarRoomEvent) => {
        setEvents((current) => [...current, event]);
        if (event.draft) {
          setDrafts((current) => ({ ...current, [event.draft!.agentRole]: event.draft! }));
        }
        if (event.type === "final" && event.finalResponse) {
          setChat((current) => [...current, { role: "assistant", text: event.finalResponse! }]);
        }
        requestAnimationFrame(() => {
          terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight, behavior: "smooth" });
        });
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer = parseSse(buffer + decoder.decode(value, { stream: true }), handleEvent);
      }
      parseSse(`${buffer}\n\n`, handleEvent);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unknown error";
      setEvents((current) => [
        ...current,
        {
          type: "error",
          sessionId: "client",
          timestamp: new Date().toISOString(),
          message: text
        }
      ]);
    } finally {
      setIsRunning(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }

  return (
    <main className="min-h-screen text-ink">
      <section className="border-b border-line bg-[#f8f6ef]/85 px-5 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-action">Project Panopticon</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal md:text-4xl">Autonomous War Room</h1>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm md:w-[520px]">
            <Metric icon={<Command size={16} />} label="DAG state" value={isRunning ? "Processing" : "Ready"} />
            <Metric icon={<ShieldCheck size={16} />} label="Guardrail" value={guardrailWarnings ? `${guardrailWarnings} rewrite` : "Armed"} />
            <Metric icon={<CircleDollarSign size={16} />} label="Cache" value={events.some((event) => event.message?.includes("[Cache]")) ? "Hit" : "Warm"} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-4 px-5 py-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)] lg:px-8">
        <div className="flex min-h-[calc(100svh-132px)] flex-col rounded-md border border-line bg-[#fbfaf6] shadow-soft">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <h2 className="text-lg font-semibold">Client Interface</h2>
              <p className="text-sm text-zinc-600">Final customer-facing response only</p>
            </div>
            <select
              aria-label="Customer tier"
              value={tier}
              onChange={(event) => setTier(event.target.value as CustomerTier)}
              className="h-9 rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-action"
            >
              <option>Free</option>
              <option>Standard</option>
              <option>Enterprise</option>
            </select>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
            <AnimatePresence initial={false}>
              {chat.map((item, index) => (
                <motion.div
                  key={`${item.role}-${index}-${item.text.slice(0, 12)}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] whitespace-pre-line rounded-md px-4 py-3 text-sm leading-6 ${
                      item.role === "user" ? "bg-ink text-white" : "border border-line bg-white text-ink"
                    }`}
                  >
                    {item.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="border-t border-line p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {demoPrompts.map((prompt) => (
                <button
                  key={prompt.label}
                  type="button"
                  onClick={() => void submit(prompt.message, prompt.tier, prompt.userId)}
                  disabled={isRunning}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm transition hover:border-action disabled:opacity-50"
                >
                  <Play size={14} />
                  {prompt.label}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="grid gap-3">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                className="resize-none rounded-md border border-line bg-white p-3 text-sm leading-6 outline-none focus:border-action"
                placeholder="Paste an angry customer escalation..."
              />
              <div className="flex items-center justify-between gap-3">
                <input
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-action"
                  aria-label="User ID"
                />
                <button
                  type="button"
                  onClick={() => {
                    setEvents([]);
                    setDrafts({});
                    setChat([]);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white transition hover:border-action"
                  aria-label="Reset"
                >
                  <RotateCcw size={17} />
                </button>
                <button
                  type="submit"
                  disabled={isRunning || !message.trim()}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-action px-4 text-sm font-semibold text-white transition hover:bg-[#096d5a] disabled:opacity-50"
                >
                  <Send size={17} />
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="grid min-h-[calc(100svh-132px)] grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-md border border-[#232923] bg-terminal text-white shadow-soft">
          <div className="border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Live War Room</h2>
                <p className="text-sm text-zinc-400">Internal agent debate streamed as SSE</p>
              </div>
              {finalEvent ? (
                <span className="inline-flex items-center gap-2 rounded-md bg-emerald-500/12 px-3 py-2 text-sm text-emerald-200">
                  <CheckCircle2 size={16} />
                  Finalized
                </span>
              ) : isRunning ? (
                <span className="inline-flex items-center gap-2 rounded-md bg-amber-500/12 px-3 py-2 text-sm text-amber-200">
                  <AlertTriangle size={16} />
                  Debating
                </span>
              ) : null}
            </div>
          </div>

          <div ref={terminalRef} className="min-h-0 overflow-y-auto p-4 font-mono text-sm leading-6">
            {events.length === 0 ? (
              <p className="text-zinc-500">Waiting for customer escalation...</p>
            ) : (
              events.map((event, index) => (
                <motion.div
                  key={`${event.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`mb-2 ${eventTone(event)}`}
                >
                  <span className="text-zinc-500">{new Date(event.timestamp).toLocaleTimeString()} </span>
                  {event.message ?? event.finalResponse}
                </motion.div>
              ))
            )}
          </div>

          <div className="grid gap-px bg-white/10 md:grid-cols-3">
            {(["Support", "Care", "Sales"] as const).map((role) => {
              const draft = drafts[role];
              return (
                <div key={role} className="bg-[#171a17] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{role}</h3>
                    <span className="text-xs text-zinc-500">{draft ? `${Math.round(draft.confidenceScore * 100)}%` : "--"}</span>
                  </div>
                  <p className="line-clamp-5 min-h-[92px] text-xs leading-5 text-zinc-300">
                    {draft?.draftText ?? "No draft yet."}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
