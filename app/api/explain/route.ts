import { NextResponse } from "next/server";

type Level = "beginner" | "intermediate" | "advanced";

const LEVEL_GUIDANCE: Record<Level, string> = {
  beginner:
    "Audience: complete beginner with no prior knowledge. Use simple everyday words, short sentences, and friendly analogies. Avoid jargon. If a technical term is unavoidable, explain it inline.",
  intermediate:
    "Audience: someone with basic familiarity. Use accurate technical terms but briefly clarify them. Strike a balance between depth and approachability.",
  advanced:
    "Audience: an experienced practitioner. Use precise technical vocabulary, mention trade-offs, edge cases, and protocols/standards by name. Skip basic background.",
};

export async function POST(req: Request) {
  try {
    const { topic, level } = (await req.json()) as {
      topic?: string;
      level?: Level;
    };

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const safeLevel: Level =
      level && level in LEVEL_GUIDANCE ? level : "intermediate";

    const prompt = `
You are an expert teacher.

Explain the topic: "${topic}"

${LEVEL_GUIDANCE[safeLevel]}

Return STRICT JSON in exactly this shape — no markdown, no code fences, no prose outside the JSON:

{
  "title": "",
  "summary": "",
  "components": [],
  "steps": [],
  "diagram_type": "flowchart",
  "diagram_code": ""
}

Content rules:
- "title": short, 3-8 words.
- "summary": 2-4 sentences, plain language.
- "components": array of short plain strings. No numbering, no bullets.
- "steps": array of plain sentences describing the process in order.
  Do NOT prefix any step with numbers, bullets, or dashes.

Diagram rules (very important):
- "diagram_type" must be exactly "flowchart".
- "diagram_code" must be valid Mermaid v11 flowchart syntax.
- Start with: flowchart TD
- Use short alphanumeric node IDs (A, B, C, D ...). Never use IDs with
  spaces, punctuation, or unicode.
- If a node label contains ANY of these characters: space, parenthesis,
  comma, colon, slash, quote, hyphen, ampersand, question mark,
  you MUST wrap the entire label in double quotes.
  Example: A["Perception Layer"] --> B["Knowledge Base (RAG)"]
- Never use backticks anywhere.
- Never include markdown code fences (no \`\`\`mermaid).
- Keep the graph to 4-10 nodes.

Output ONLY the JSON object. Nothing before it, nothing after it.
`;

    const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You generate structured explanations." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const details = await upstream.text();
      return NextResponse.json(
        {
          error: "Upstream API call failed",
          status: upstream.status,
          details,
        },
        { status: upstream.status || 500 }
      );
    }

    // Parse OpenAI-compatible SSE chunks and forward only the text deltas
    // as a plain text stream. Client handles incremental JSON parsing.
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = upstream.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            // Split on SSE event boundaries.
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const json = JSON.parse(payload);
                const delta: string | undefined =
                  json.choices?.[0]?.delta?.content ??
                  json.choices?.[0]?.message?.content;
                if (delta) controller.enqueue(encoder.encode(delta));
              } catch {
                // Ignore malformed chunks.
              }
            }
          }
        } catch (err) {
          controller.error(err);
          return;
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Something went wrong",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}