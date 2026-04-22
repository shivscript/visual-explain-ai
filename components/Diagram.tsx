"use client";

import mermaid from "mermaid";
import { useEffect, useId, useRef, useState } from "react";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "strict",
});

type DiagramProps = {
  code: string;
};

export default function Diagram({ code }: DiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const reactId = useId();
  // Mermaid requires ids that start with a letter and have no special chars.
  const diagramId = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const { svg } = await mermaid.render(diagramId, code);
        if (cancelled) return;
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to render diagram");
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [code, diagramId]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p className="font-medium">Diagram failed to render</p>
        <p>{error}</p>
        <pre className="mt-2 overflow-auto rounded bg-white p-2 text-xs text-gray-700">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return <div ref={containerRef} className="overflow-auto" />;
}
