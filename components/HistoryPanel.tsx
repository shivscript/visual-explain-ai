"use client";

import type { HistoryEntry } from "@/lib/types";

type HistoryPanelProps = {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
};

const LEVEL_BADGE: Record<HistoryEntry["level"], string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-purple-100 text-purple-700",
};

export default function HistoryPanel({
  entries,
  onSelect,
  onRemove,
  onClear,
}: HistoryPanelProps) {
  if (entries.length === 0) {
    return (
      <aside className="rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-semibold">History</h2>
        <p className="text-sm text-gray-500">
          Your past explanations will appear here.
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">History</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-gray-500 transition hover:text-red-600"
        >
          Clear all
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="group flex items-start justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 transition hover:border-black"
          >
            <button
              type="button"
              onClick={() => onSelect(entry)}
              className="flex flex-1 flex-col items-start gap-1 text-left"
            >
              <span className="line-clamp-1 text-sm font-medium text-gray-900">
                {entry.result.title || entry.topic}
              </span>
              <span className="flex items-center gap-2 text-xs text-gray-500">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${LEVEL_BADGE[entry.level]}`}
                >
                  {entry.level}
                </span>
                <span>{formatTime(entry.createdAt)}</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => onRemove(entry.id)}
              aria-label="Remove from history"
              className="opacity-0 transition group-hover:opacity-100 hover:text-red-600"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function formatTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}
