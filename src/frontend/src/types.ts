import type { Principal } from "@icp-sdk/core/principal";

// Re-export backend types for convenience
export type {
  AttemptId,
  Chapter,
  ChapterId,
  Difficulty,
  Question,
  QuestionId,
  QuestionResult,
  QuestionType,
  QuizAttempt,
  SessionId,
  StartSessionInput,
  StudentProfile,
  Subject,
  SubjectId,
  SubmitAnswerInput,
  Timestamp,
  UserId,
} from "./backend";

// Frontend-only types
export interface QuizConfig {
  subjectId: bigint;
  chapterId: bigint;
  questionCount: number;
  timeLimit: number; // in seconds
}

export interface ActiveAnswer {
  questionId: bigint;
  userAnswer: string;
  timeSpent: number; // in seconds
}

export interface QuizSession {
  config: QuizConfig;
  questions: import("./backend").Question[];
  answers: Map<string, ActiveAnswer>;
  startedAt: number; // timestamp ms
  currentIndex: number;
}

export type AuthStatus = "initializing" | "unauthenticated" | "authenticated";

export interface TruncatedPrincipal {
  full: string;
  truncated: string;
}

export function truncatePrincipal(principal: Principal): TruncatedPrincipal {
  const full = principal.toText();
  const truncated =
    full.length > 12 ? `${full.slice(0, 5)}...${full.slice(-4)}` : full;
  return { full, truncated };
}
