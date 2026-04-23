export type ExplainResult = {
  title: string;
  summary: string;
  components: string[];
  steps: string[];
  diagram_type: "flowchart" | "sequence";
  diagram_code: string;
};

export type Level = "beginner" | "intermediate" | "advanced";

export type HistoryEntry = {
  id: string;
  topic: string;
  level: Level;
  result: ExplainResult;
  createdAt: number;
};
