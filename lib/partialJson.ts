import { Allow, parse } from "partial-json";

/**
 * Best-effort partial JSON parser for streaming LLM output.
 * Strips optional ```json fences, then defers to `partial-json`
 * which tolerates unclosed strings/objects/arrays/numbers.
 */
export function tryParsePartial<T = unknown>(input: string): Partial<T> {
  if (!input) return {};

  const cleaned = input
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  const start = cleaned.indexOf("{");
  if (start === -1) return {};

  try {
    return parse(cleaned.slice(start), Allow.ALL) as Partial<T>;
  } catch {
    return {};
  }
}
