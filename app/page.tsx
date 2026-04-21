"use client";

import { useState } from "react";

type ExplainResult = {
  title: string;
  summary: string;
  components: string[];
  steps: string[];
  diagram_type: "flowchart" | "sequence";
  diagram_code: string;
};

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplainResult | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
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
            <button
              type="submit"
              disabled={loading}
              className="w-fit rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
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
            <h2 className="mb-3 text-xl font-semibold">Explanation</h2>
            {!result && (
              <p className="text-gray-600">
                Your AI-generated explanation will appear here.
              </p>
            )}
            {result && (
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
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-semibold">Diagram</h2>
            {!result && (
              <p className="text-gray-600">
                Your generated visual diagram will appear here.
              </p>
            )}
            {result && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Type: {result.diagram_type}
                </p>
                <pre className="overflow-auto rounded-lg bg-gray-100 p-4 text-sm">
                  <code>{result.diagram_code}</code>
                </pre>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}