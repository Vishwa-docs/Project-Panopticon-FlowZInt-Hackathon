interface FlowZintCompletionOptions {
  model: string;
  system: string;
  prompt: string;
  temperature?: number;
}

export async function flowZintCompletion(options: FlowZintCompletionOptions): Promise<string | undefined> {
  const apiKey = process.env.FLOWZINT_API_KEY;
  const baseUrl = process.env.FLOWZINT_BASE_URL;
  if (!apiKey || !baseUrl) {
    return undefined;
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: options.model,
      temperature: options.temperature ?? 0.2,
      messages: [
        { role: "system", content: options.system },
        { role: "user", content: options.prompt }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`FlowZint request failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return payload.choices?.[0]?.message?.content;
}
