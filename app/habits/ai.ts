import data from "./ai.json";

export type AiInfo = {
  summary: string;
  harm: { title: string; text: string }[];
  benefits: { when: string; text: string }[];
  facts: string[];
  triggers: string[];
  alternatives: string[];
  steps: string[];
  motivation: string;
  tip: string;
};

const prepared = data as Record<string, AiInfo>;

export const hasAi = (id: string) => id in prepared;

export const getAi = (id: string) =>
  hasAi(id)
    ? Promise.resolve(prepared[id])
    : Promise.reject(new Error("No prepared breakdown"));
