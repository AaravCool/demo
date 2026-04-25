import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface StartSessionInput {
    timeLimit: bigint;
    chapterId: ChapterId;
    questionCount: bigint;
}
export type AttemptId = bigint;
export type QuestionId = bigint;
export type SessionId = bigint;
export interface Chapter {
    id: ChapterId;
    name: string;
    description: string;
    subjectId: SubjectId;
}
export type ChapterId = bigint;
export interface QuestionResult {
    timeSpent: bigint;
    userAnswer: string;
    isCorrect: boolean;
    questionId: QuestionId;
}
export type UserId = Principal;
export interface StudentProfile {
    userId: UserId;
    lastActivity: Timestamp;
    bestScore: number;
    totalAttempts: bigint;
    averageScore: number;
}
export interface SubmitAnswerInput {
    timeSpent: bigint;
    userAnswer: string;
    questionId: QuestionId;
}
export interface QuizAttempt {
    completedAt: Timestamp;
    attemptId: AttemptId;
    userId: UserId;
    questionResults: Array<QuestionResult>;
    chapterId: ChapterId;
    score: number;
    totalQuestions: bigint;
    subjectId: SubjectId;
    correctAnswers: bigint;
    sessionId: SessionId;
    timeTaken: bigint;
}
export interface Question {
    id: QuestionId;
    difficulty: Difficulty;
    correctAnswer: string;
    chapterId: ChapterId;
    questionText: string;
    questionType: QuestionType;
    solution?: string;
    options: Array<string>;
}
export type SubjectId = bigint;
export interface UserProfile {
    name: string;
}
export interface Subject {
    id: SubjectId;
    name: string;
    description: string;
}
export enum Difficulty {
    Easy = "Easy",
    Hard = "Hard",
    Medium = "Medium"
}
export enum QuestionType {
    MultipleChoice = "MultipleChoice",
    FillInBlank = "FillInBlank",
    TrueFalse = "TrueFalse"
}
export interface backendInterface {
    addChapter(subjectId: SubjectId, name: string): Promise<{
        __kind__: "ok";
        ok: ChapterId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addQuestion(chapterId: ChapterId, text: string, questionType: string, options: Array<string>, correctAnswer: string, difficulty: string, solution: string | null): Promise<{
        __kind__: "ok";
        ok: QuestionId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addSubject(name: string, description: string): Promise<{
        __kind__: "ok";
        ok: SubjectId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    bulkImportQuestions(data: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteChapter(id: ChapterId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteQuestion(id: QuestionId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteSubject(id: SubjectId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAdminPrincipal(): Promise<string>;
    getAttemptDetail(attemptId: AttemptId): Promise<QuizAttempt | null>;
    getCallerPrincipal(): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getChapters(subjectId: SubjectId): Promise<Array<Chapter>>;
    getMyAttempts(): Promise<Array<QuizAttempt>>;
    getMyProfile(): Promise<StudentProfile>;
    getQuestions(chapterId: ChapterId, count: bigint): Promise<Array<Question>>;
    getSubjects(): Promise<Array<Subject>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitQuizAttempt(sessionInput: StartSessionInput, answers: Array<SubmitAnswerInput>): Promise<QuizAttempt>;
    updateChapter(id: ChapterId, name: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateSubject(id: SubjectId, name: string, description: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
