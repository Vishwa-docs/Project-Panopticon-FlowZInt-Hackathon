import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const logs = [
  "[System] Spawning 3 parallel agents...",
  "[Support] Draft complete. confidence=0.81",
  "[Care] Draft complete. flightRisk=HIGH",
  "[Sales] Draft complete. Enterprise failover mapped",
  "[ContextGuard] WARNING: deprecated legacy API key detected",
  "[Support] Rewrite complete after adversarial review",
  "[ContextGuard] PASS. Synthesizing final response"
];

export function PanopticonDemo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleY = spring({ frame, fps, config: { damping: 16 } });
  const progress = interpolate(frame, [0, 330], [0, 100], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#ede9df", color: "#121212", fontFamily: "Inter, Arial, sans-serif" }}>
      <div style={{ padding: 70 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ transform: `translateY(${(1 - titleY) * 24}px)`, opacity: titleY }}>
            <div style={{ color: "#0e7c66", fontSize: 28, fontWeight: 800, letterSpacing: 3 }}>PROJECT PANOPTICON</div>
            <div style={{ fontSize: 82, fontWeight: 800, marginTop: 12 }}>Autonomous War Room</div>
            <div style={{ fontSize: 32, marginTop: 20, maxWidth: 920, lineHeight: 1.25 }}>
              Three specialist agents draft in parallel. ContextGuard attacks the result before the customer sees a word.
            </div>
          </div>
          <div style={{ width: 380, height: 12, background: "#d8d2c5", borderRadius: 6, overflow: "hidden", marginTop: 28 }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "#0e7c66" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "0.86fr 1.14fr", gap: 32, marginTop: 62 }}>
          <div style={{ background: "#fbfaf6", border: "2px solid #d8d2c5", borderRadius: 10, padding: 34, height: 650 }}>
            <div style={{ fontSize: 30, fontWeight: 800 }}>Client Interface</div>
            <div style={{ marginTop: 34, background: "#121212", color: "white", borderRadius: 8, padding: 24, fontSize: 28, lineHeight: 1.35 }}>
              Your API crashed again and my payment gateway is down. I'm taking my business elsewhere!
            </div>
            <div style={{ marginTop: 30, background: "white", border: "2px solid #d8d2c5", borderRadius: 8, padding: 24, fontSize: 25, lineHeight: 1.36 }}>
              I am sorry this disrupted your team. Use Payments API v3, enable <b>gateway_failover=true</b>, retry with <b>Idempotency-Key</b>, and check <b>/v3/status/incidents</b>.
            </div>
          </div>

          <div style={{ background: "#111311", color: "#dce8df", borderRadius: 10, padding: 34, height: 650 }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: "white" }}>Live War Room</div>
            <div style={{ marginTop: 28, fontFamily: "Menlo, monospace", fontSize: 25, lineHeight: 1.55 }}>
              {logs.map((line, index) => {
                const opacity = interpolate(frame, [index * 34 + 35, index * 34 + 49], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp"
                });
                const color = line.includes("WARNING") ? "#f3c178" : line.includes("PASS") ? "#8be5b2" : "#dce8df";
                return (
                  <div key={line} style={{ opacity, color, marginBottom: 10 }}>
                    {line}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
