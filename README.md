# VisualExplain AI

Explain any topic with a structured summary and an auto-generated visual
diagram. Type a topic, pick a difficulty level, and get a clean
explanation plus a Mermaid flowchart you can copy or share.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS,
and Mermaid. Powered by an OpenAI-compatible chat completions endpoint
(works with the OpenAI API or AWS Bedrock's OpenAI-compatible models).

## Features

- **Structured explanations** — title, summary, components, and
  step-by-step process for any topic.
- **Auto-generated diagrams** — server returns Mermaid syntax that the
  client renders to SVG.
- **Three difficulty levels** — Beginner, Intermediate, Advanced.
  Adjusts the prompt to change tone and depth.
- **Example prompts** — one-click starter topics.
- **History** — last 20 explanations are saved to `localStorage` and
  restorable with one click.
- **Copy buttons** — copy the explanation as plain text or the diagram
  as raw Mermaid code.
- **Loading skeletons + spinner** — polished loading experience.
- **Graceful Mermaid fallback** — invalid diagrams are shown as raw
  code with the parser error.

## Tech stack

| Layer | Tool |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript |
| Diagrams | Mermaid v11 |
| AI | OpenAI Chat Completions API (or any compatible endpoint) |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
# Required
OPENAI_API_KEY=sk-...your-key

# Optional — defaults shown
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

To use **AWS Bedrock** (OpenAI-compatible endpoint) instead:

```bash
OPENAI_API_KEY=bedrock-api-key-...
OPENAI_BASE_URL=https://bedrock-mantle.us-east-1.api.aws/v1
OPENAI_MODEL=openai.gpt-oss-120b
```

> Bedrock session tokens expire (typically after 12 hours). Refresh
> the key from the AWS console when requests start failing with 401/403.

### 3. Run the dev server

```bash
npm run dev
```

Open <http://localhost:3000>.

## Project structure

```
app/
  api/explain/route.ts   # POST endpoint — calls the LLM, returns JSON
  layout.tsx             # Root layout, metadata, fonts
  page.tsx               # Main UI (client component)
  icon.svg               # Favicon (Next.js auto-detected)
components/
  CopyButton.tsx         # Reusable clipboard button
  Diagram.tsx            # Renders Mermaid code to SVG
  HistoryPanel.tsx       # Sidebar showing past explanations
lib/
  types.ts               # Shared TypeScript types
  useHistory.ts          # Custom hook for localStorage history
public/                  # Static assets
```

## API

### `POST /api/explain`

**Request body:**

```json
{
  "topic": "How HTTP works",
  "level": "intermediate"
}
```

`level` is optional and must be `"beginner"`, `"intermediate"`, or
`"advanced"`. Defaults to `"intermediate"`.

**Response (200):**

```json
{
  "title": "How HTTP Works",
  "summary": "...",
  "components": ["Client", "Server", "Request", "Response"],
  "steps": ["Client opens a TCP connection ...", "..."],
  "diagram_type": "flowchart",
  "diagram_code": "flowchart TD\n  A[Client] --> B[Server] ..."
}
```

**Error responses** include a `status` and `details` field for easier
debugging.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |

## License

MIT — see [LICENSE](./LICENSE).
