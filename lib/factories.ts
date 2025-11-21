/**
 * Factory functions for creating domain entities with proper initialization
 */

import type { Question, Practical } from "@/app/types";

/**
 * Generates a unique ID for entities
 * Uses crypto.randomUUID() when available, falls back to Math.random()
 */
export function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

/**
 * Creates a new Question with default values
 */
export function createQuestion(number: string): Question {
  return {
    id: generateId(),
    number,
    questionText: "",
    code: "",
  };
}

/**
 * Creates a new Practical with default values and one initial question
 */
export function createPractical(practicalNo: string): Practical {
  return {
    practicalNo,
    aim: "",
    questions: [createQuestion("1")],
    outputs: [],
    conclusion: "",
  };
}
