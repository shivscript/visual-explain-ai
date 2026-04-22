import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert teacher.

Explain the topic: "${topic}"

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

    const response = await fetch(`${baseUrl}/chat/completions`, {
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
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      return NextResponse.json(
        { error: "Upstream API call failed", status: response.status, details },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No content in response", raw: data },
        { status: 500 }
      );
    }

    try {
      const cleaned = content
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "");
      return NextResponse.json(JSON.parse(cleaned));
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON", raw: content },
        { status: 500 }
      );
    }
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