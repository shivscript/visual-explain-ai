"use client";

import { useCallback, useEffect, useState } from "react";
import type { HistoryEntry } from "./types";

const STORAGE_KEY = "visual-explain-history";
const MAX_ENTRIES = 20;

function readStorage(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Quota exceeded or storage disabled — ignore.
  }
}

export function useHistory() {
  // Start empty so server and first client render match (no hydration mismatch).
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage after mount.
  useEffect(() => {
    setEntries(readStorage());
    setLoaded(true);
  }, []);

  const addEntry = useCallback((entry: Omit<HistoryEntry, "id" | "createdAt">) => {
    setEntries((prev) => {
      const next: HistoryEntry[] = [
        {
          ...entry,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        },
        ...prev,
      ].slice(0, MAX_ENTRIES);
      writeStorage(next);
      return next;
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      writeStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    writeStorage([]);
  }, []);

  return { entries, loaded, addEntry, removeEntry, clear };
}
