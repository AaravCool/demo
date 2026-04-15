import type { backendInterface, Subject, Chapter, Question, QuizAttempt, StudentProfile, UserProfile } from "../backend";
import { Difficulty, QuestionType } from "../backend";

const subjects: Subject[] = [
  { id: BigInt(1), name: "Mathematics", description: "Algebra, Geometry, Calculus and more" },
  { id: BigInt(2), name: "Physics", description: "Mechanics, Thermodynamics, Electromagnetism" },
  { id: BigInt(3), name: "Biology", description: "Cell Biology, Genetics, Ecology" },
];

const chapters: Chapter[] = [
  { id: BigInt(1), subjectId: BigInt(1), name: "Algebra Basics", description: "Linear equations and polynomials" },
  { id: BigInt(2), subjectId: BigInt(1), name: "Geometry", description: "Shapes, angles and proofs" },
  { id: BigInt(3), subjectId: BigInt(2), name: "Kinematics", description: "Motion and velocity" },
  { id: BigInt(4), subjectId: BigInt(2), name: "Optics", description: "Light and reflection" },
  { id: BigInt(5), subjectId: BigInt(3), name: "Cell Biology", description: "Structure and function of cells" },
];

const questions: Question[] = [
  {
    id: BigInt(1),
    chapterId: BigInt(1),
    questionText: "What is the solution to 2x + 4 = 12?",
    questionType: QuestionType.MultipleChoice,
    difficulty: Difficulty.Easy,
    correctAnswer: "x = 4",
    options: ["x = 2", "x = 4", "x = 6", "x = 8"],
  },
  {
    id: BigInt(2),
    chapterId: BigInt(1),
    questionText: "Is (x + y)² = x² + 2xy + y² always true?",
    questionType: QuestionType.TrueFalse,
    difficulty: Difficulty.Easy,
    correctAnswer: "True",
    options: ["True", "False"],
  },
  {
    id: BigInt(3),
    chapterId: BigInt(1),
    questionText: "The degree of the polynomial 3x³ - 2x + 5 is ____.",
    questionType: QuestionType.FillInBlank,
    difficulty: Difficulty.Medium,
    correctAnswer: "3",
    options: [],
  },
];

const mockAttempts: QuizAttempt[] = [
  {
    attemptId: BigInt(1),
    sessionId: BigInt(1),
    userId: { toText: () => "user-1" } as never,
    subjectId: BigInt(1),
    chapterId: BigInt(1),
    score: 85,
    totalQuestions: BigInt(10),
    correctAnswers: BigInt(8),
    timeTaken: BigInt(420),
    completedAt: BigInt(Date.now() - 86400000) * BigInt(1000000),
    questionResults: [],
  },
  {
    attemptId: BigInt(2),
    sessionId: BigInt(2),
    userId: { toText: () => "user-1" } as never,
    subjectId: BigInt(2),
    chapterId: BigInt(3),
    score: 60,
    totalQuestions: BigInt(10),
    correctAnswers: BigInt(6),
    timeTaken: BigInt(540),
    completedAt: BigInt(Date.now() - 172800000) * BigInt(1000000),
    questionResults: [],
  },
  {
    attemptId: BigInt(3),
    sessionId: BigInt(3),
    userId: { toText: () => "user-1" } as never,
    subjectId: BigInt(1),
    chapterId: BigInt(2),
    score: 40,
    totalQuestions: BigInt(5),
    correctAnswers: BigInt(2),
    timeTaken: BigInt(300),
    completedAt: BigInt(Date.now() - 259200000) * BigInt(1000000),
    questionResults: [],
  },
];

const mockStudentProfile: StudentProfile = {
  userId: { toText: () => "user-1" } as never,
  totalAttempts: BigInt(3),
  averageScore: 61.7,
  bestScore: 85,
  lastActivity: BigInt(Date.now()) * BigInt(1000000),
};

const mockUserProfile: UserProfile = { name: "Alex Johnson" };

export const mockBackend: backendInterface = {
  getSubjects: async () => subjects,
  getChapters: async (_subjectId) => chapters.filter(c => c.subjectId === _subjectId),
  getQuestions: async (_chapterId, _count) => questions.slice(0, Number(_count) || 3),
  getMyAttempts: async () => mockAttempts,
  getAttemptDetail: async (attemptId) => mockAttempts.find(a => a.attemptId === attemptId) ?? null,
  getMyProfile: async () => mockStudentProfile,
  getCallerUserProfile: async () => mockUserProfile,
  getUserProfile: async (_user) => mockUserProfile,
  saveCallerUserProfile: async (_profile) => undefined,
  submitQuizAttempt: async (_sessionInput, _answers) => ({
    attemptId: BigInt(4),
    sessionId: BigInt(4),
    userId: { toText: () => "user-1" } as never,
    subjectId: BigInt(1),
    chapterId: _sessionInput.chapterId,
    score: 75,
    totalQuestions: _sessionInput.questionCount,
    correctAnswers: BigInt(Math.floor(Number(_sessionInput.questionCount) * 0.75)),
    timeTaken: _sessionInput.timeLimit,
    completedAt: BigInt(Date.now()) * BigInt(1000000),
    questionResults: _answers.map((a, idx) => ({
      questionId: a.questionId,
      userAnswer: a.userAnswer,
      isCorrect: idx % 4 !== 0,
      timeSpent: a.timeSpent,
    })),
  }),
  // Diagnostics
  getCallerPrincipal: async () => "2vxsx-fae",
  getAdminPrincipal: async () => "stg4z-mbqle-h7omu-re7wj-od36c-yptmv-y5zbm-gmwfv-3zcmc-gvegn-iae",
  // Admin — subjects
  addSubject: async (name, description) => ({ __kind__: "ok", ok: BigInt(99) }),
  updateSubject: async (_id, _name, _description) => ({ __kind__: "ok", ok: null }),
  deleteSubject: async (_id) => ({ __kind__: "ok", ok: null }),
  // Admin — chapters (addChapter takes subjectId + name only per backend.d.ts)
  addChapter: async (_subjectId, _name) => ({ __kind__: "ok", ok: BigInt(99) }),
  updateChapter: async (_id, _name) => ({ __kind__: "ok", ok: null }),
  deleteChapter: async (_id) => ({ __kind__: "ok", ok: null }),
  // Admin — questions
  addQuestion: async (_chapterId, _text, _questionType, _options, _correctAnswer, _difficulty) => ({
    __kind__: "ok",
    ok: BigInt(99),
  }),
  deleteQuestion: async (_id) => ({ __kind__: "ok", ok: null }),
  bulkImportQuestions: async (_data) => ({ __kind__: "ok", ok: BigInt(3) }),
};
