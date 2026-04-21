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

Return STRICT JSON format:

{
  "title": "",
  "summary": "",
  "components": [],
  "steps": [],
  "diagram_type": "flowchart | sequence",
  "diagram_code": ""
}

Rules:
- Keep explanation simple
- Steps must be clear
- Diagram must be Mermaid format
- No extra text outside JSON
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
      return NextResponse.json(JSON.parse(content));
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