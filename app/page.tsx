"use client";

import CopyButton from "@/components/CopyButton";
import Diagram from "@/components/Diagram";
import { useState } from "react";

type ExplainResult = {
  title: string;
  summary: string;
  components: string[];
  steps: string[];
  diagram_type: "flowchart" | "sequence";
  diagram_code: string;
};

const EXAMPLES = [
  "What is AI?",
  "How HTTP works",
  "What is a load balancer?",
  "Explain agentic AI",
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplainResult | null>(null);

  async function runExplain(nextTopic: string) {
    if (!nextTopic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: nextTopic }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }

      setResult(data as ExplainResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    runExplain(topic);
  }

  function handleExampleClick(example: string) {
    setTopic(example);
    runExplain(example);
  }

  const explanationText = result
    ? [
        result.title,
        "",
        result.summary,
        "",
        "Components:",
        ...result.components.map((c) => `- ${c}`),
        "",
        "Steps:",
        ...result.steps.map(
          (s, i) => `${i + 1}. ${s.replace(/^\s*\d+[.)]\s*/, "")}`
        ),
      ].join("\n")
    : "";

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            VisualExplain AI
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Explain anything with text and diagrams
          </h1>
          <p className="max-w-2xl text-lg text-gray-600">
            Enter a topic and get a structured explanation with a visual diagram.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label htmlFor="topic" className="text-sm font-medium text-gray-700">
              Topic
            </label>
            <textarea
              id="topic"
              name="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Explain how HTTP works"
              className="min-h-32 rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none ring-0 placeholder:text-gray-400 focus:border-black"
            />

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Try:
              </span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  disabled={loading}
                  onClick={() => handleExampleClick(ex)}
                  className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 transition hover:border-black hover:bg-gray-50 disabled:opacity-50"
                >
                  {ex}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading && <Spinner />}
              {loading ? "Explaining..." : "Explain"}
            </button>
          </form>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Explanation</h2>
              {result && <CopyButton text={explanationText} />}
            </div>

            {loading && <ExplanationSkeleton />}

            {!loading && !result && (
              <p className="text-gray-600">
                Your AI-generated explanation will appear here.
              </p>
            )}

            {!loading && result && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{result.title}</h3>
                <p className="text-gray-700">{result.summary}</p>

                {result.components?.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Components
                    </h4>
                    <ul className="list-disc pl-5 text-gray-700">
                      {result.components.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.steps?.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Steps
                    </h4>
                    <ol className="list-decimal pl-5 text-gray-700">
                      {result.steps.map((s, i) => (
                        <li key={i}>{s.replace(/^\s*\d+[.)]\s*/, "")}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Diagram</h2>
              {result && (
                <CopyButton text={result.diagram_code} label="Copy code" />
              )}
            </div>

            {loading && <DiagramSkeleton />}

            {!loading && !result && (
              <p className="text-gray-600">
                Your generated visual diagram will appear here.
              </p>
            )}

            {!loading && result && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Type: {result.diagram_type}
                </p>
                <Diagram code={result.diagram_code} />
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function ExplanationSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-5 w-1/2 rounded bg-gray-200" />
      <div className="space-y-2">
        <div className="h-3 rounded bg-gray-200" />
        <div className="h-3 w-11/12 rounded bg-gray-200" />
        <div className="h-3 w-4/5 rounded bg-gray-200" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-1/3 rounded bg-gray-200" />
        <div className="h-3 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-2/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}

function DiagramSkeleton() {
  return (
    <div className="flex h-64 animate-pulse items-center justify-center rounded-lg bg-gray-100">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-500" />
    </div>
  );
}
