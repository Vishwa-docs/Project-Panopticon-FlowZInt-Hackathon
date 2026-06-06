import { runPanopticon } from "@/agents/router";
import { UserPayload, WarRoomEvent } from "@/types/panopticon";
import { z } from "zod";

export const dynamic = "force-dynamic";

const PayloadSchema = z.object({
  userId: z.string().min(1),
  tier: z.enum(["Free", "Standard", "Enterprise"]),
  message: z.string().min(1).max(4000),
  history: z.array(z.string()).max(5).default([])
});

function encodeSse(event: WarRoomEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: Request): Promise<Response> {
  const parsed = PayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid payload",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const payload: UserPayload = parsed.data;
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await runPanopticon(payload, (event) => {
          controller.enqueue(encoder.encode(encodeSse(event)));
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown orchestration error";
        controller.enqueue(
          encoder.encode(
            encodeSse({
              type: "error",
              sessionId: "unavailable",
              timestamp: new Date().toISOString(),
              message
            })
          )
        );
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
