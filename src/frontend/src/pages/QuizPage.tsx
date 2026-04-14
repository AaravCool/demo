import { useNavigate, useRouter } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Question } from "../backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { Skeleton } from "../components/ui/skeleton";
import { useBackend } from "../hooks/useBackend";
import type { ActiveAnswer, QuizConfig } from "../types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface RouterState {
  quizConfig?: QuizConfig;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTime(seconds: number): string {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.abs(seconds) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function questionTypeKey(
  q: Question,
): "MultipleChoice" | "TrueFalse" | "FillInBlank" {
  if (q.questionType === "TrueFalse") return "TrueFalse";
  if (q.questionType === "FillInBlank") return "FillInBlank";
  return "MultipleChoice";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function TimerDisplay({ seconds, total }: { seconds: number; total: number }) {
  const pct = Math.max(0, seconds / total);
  const critical = seconds < 30;
  const warning = seconds < 60;
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-label">Time Remaining</span>
      <motion.span
        key={Math.floor(seconds / 10)}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        className={[
          "font-display font-bold tabular-nums leading-none",
          "text-6xl md:text-7xl",
          critical
            ? "text-destructive"
            : warning
              ? "text-accent"
              : "text-foreground",
        ].join(" ")}
        data-ocid="quiz-timer"
        aria-live="polite"
        aria-label={`Time remaining: ${formatTime(seconds)}`}
      >
        {formatTime(seconds)}
      </motion.span>
      <div className="w-40 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={[
            "h-full rounded-full transition-colors duration-700",
            critical ? "bg-destructive" : warning ? "bg-accent" : "bg-primary",
          ].join(" ")}
          style={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.8, ease: "linear" }}
        />
      </div>
    </div>
  );
}

function MultipleChoiceOptions({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (opt: string) => void;
}) {
  const labels = ["A", "B", "C", "D"];
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
      data-ocid="mc-options"
    >
      {options.map((opt, i) => {
        const active = selected === opt;
        return (
          <motion.button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            className={[
              "flex items-start gap-3 p-4 rounded-xl border-2 text-left",
              "transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-primary bg-primary/10 text-foreground shadow-card"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5",
            ].join(" ")}
            aria-pressed={active}
            data-ocid={`mc-option-${i}`}
          >
            <span
              className={[
                "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {labels[i] ?? i + 1}
            </span>
            <span className="leading-snug">{opt}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function TrueFalseOptions({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (opt: string) => void;
}) {
  return (
    <div className="flex gap-4 w-full justify-center" data-ocid="tf-options">
      {["True", "False"].map((val) => {
        const active = selected === val;
        return (
          <motion.button
            key={val}
            type="button"
            onClick={() => onSelect(val)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className={[
              "flex-1 max-w-[180px] py-6 text-xl font-display font-semibold rounded-2xl border-2",
              "transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-card"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5",
            ].join(" ")}
            aria-pressed={active}
            data-ocid={`tf-${val.toLowerCase()}`}
          >
            {val === "True" ? "✓ True" : "✗ False"}
          </motion.button>
        );
      })}
    </div>
  );
}

function FillInBlankInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="w-full max-w-md mx-auto" data-ocid="fib-input">
      <Input
        placeholder="Your answer…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-center text-lg h-14 border-2 focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Your answer"
        autoFocus
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function QuizSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-1.5 bg-muted w-full" />
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-8">
        <Skeleton className="h-24 w-40 rounded-2xl" />
        <Skeleton className="h-12 w-3/4 rounded-xl" />
        <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main QuizPage
// ---------------------------------------------------------------------------
export default function QuizPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const { actor, isFetching } = useBackend();

  // Read quiz config from router state
  const state = (router.state.location.state ?? {}) as RouterState;
  const config = state.quizConfig as QuizConfig | undefined;

  // Core state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, ActiveAnswer>>(new Map());
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [autoAdvancing, setAutoAdvancing] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSeconds = config?.timeLimit ?? 0;

  // Redirect if no config
  useEffect(() => {
    if (!config) {
      navigate({ to: "/" });
    }
  }, [config, navigate]);

  // Fetch questions on mount
  useEffect(() => {
    if (!config || isFetching) return;
    if (!actor) return;
    let cancelled = false;
    (async () => {
      try {
        const qs = await actor.getQuestions(
          BigInt(config.chapterId),
          BigInt(config.questionCount),
        );
        if (!cancelled) {
          setQuestions(qs);
          setTimeLeft(config.timeLimit);
          setQuestionStartTime(Date.now());
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [actor, isFetching, config]);

  // ----- submit quiz -------------------------------------------------------
  const submitQuiz = useCallback(
    async (finalAnswers: Map<string, ActiveAnswer>) => {
      if (!actor || !config || !questions.length) return;
      if (timerRef.current) clearInterval(timerRef.current);
      setSubmitting(true);
      try {
        const sessionInput = {
          chapterId: BigInt(config.chapterId),
          questionCount: BigInt(questions.length),
          timeLimit: BigInt(config.timeLimit),
        };
        const answersArray = questions.map((q) => {
          const a = finalAnswers.get(String(q.id));
          return {
            questionId: q.id,
            userAnswer: a?.userAnswer ?? "",
            timeSpent: BigInt(a?.timeSpent ?? 0),
          };
        });
        const result = await actor.submitQuizAttempt(
          sessionInput,
          answersArray,
        );
        navigate({
          to: "/results/$attemptId",
          params: { attemptId: String(result.attemptId) },
        });
      } catch {
        setSubmitting(false);
      }
    },
    [actor, config, questions, navigate],
  );

  // ----- save answer for current question ----------------------------------
  const saveCurrentAnswer = useCallback(
    (answerText: string, overrideIndex?: number): Map<string, ActiveAnswer> => {
      const idx = overrideIndex ?? currentIndex;
      const q = questions[idx];
      if (!q) return answers;
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
      const updated = new Map(answers);
      updated.set(String(q.id), {
        questionId: q.id,
        userAnswer: answerText,
        timeSpent,
      });
      setAnswers(updated);
      return updated;
    },
    [answers, currentIndex, questions, questionStartTime],
  );

  // ----- advance to next question ------------------------------------------
  const advanceQuestion = useCallback(
    (savedAnswers: Map<string, ActiveAnswer>) => {
      if (currentIndex >= questions.length - 1) {
        submitQuiz(savedAnswers);
      } else {
        setCurrentIndex((i) => i + 1);
        setCurrentAnswer("");
        setQuestionStartTime(Date.now());
      }
    },
    [currentIndex, questions.length, submitQuiz],
  );

  // ----- handle Next button ------------------------------------------------
  const handleNext = useCallback(() => {
    const updated = saveCurrentAnswer(currentAnswer);
    advanceQuestion(updated);
  }, [currentAnswer, saveCurrentAnswer, advanceQuestion]);

  // ----- auto-advance after MC selection (500ms) ---------------------------
  const handleMCSelect = useCallback(
    (opt: string) => {
      if (autoAdvancing) return;
      setCurrentAnswer(opt);
      setAutoAdvancing(true);
      setTimeout(() => {
        const updated = saveCurrentAnswer(opt);
        advanceQuestion(updated);
        setAutoAdvancing(false);
      }, 500);
    },
    [autoAdvancing, saveCurrentAnswer, advanceQuestion],
  );

  // ----- countdown timer ---------------------------------------------------
  useEffect(() => {
    if (loading || !questions.length) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer expired — save current (empty if unanswered) and advance
          const answerText = currentAnswer;
          setCurrentAnswer("");
          const updated = saveCurrentAnswer(answerText);
          if (currentIndex >= questions.length - 1) {
            submitQuiz(updated);
          } else {
            setCurrentIndex((i) => i + 1);
            setQuestionStartTime(Date.now());
            return totalSeconds; // reset per-question? No — quiz timer. Keep at 0.
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    loading,
    questions.length,
    currentAnswer,
    currentIndex,
    saveCurrentAnswer,
    submitQuiz,
    totalSeconds,
  ]);

  // ----- Finish early handler ----------------------------------------------
  const handleFinishEarly = useCallback(() => {
    const updated = saveCurrentAnswer(currentAnswer);
    submitQuiz(updated);
  }, [currentAnswer, saveCurrentAnswer, submitQuiz]);

  // ----- Guards -----------------------------------------------------------
  if (!config) return null;
  if (loading || isFetching) return <QuizSkeleton />;
  if (submitting) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 1,
            ease: "linear",
          }}
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
        />
        <p className="text-muted-foreground text-sm">Submitting your quiz…</p>
      </div>
    );
  }
  if (!questions.length) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground text-center">
          No questions found for this chapter.
        </p>
        <Button onClick={() => navigate({ to: "/" })}>Back to Dashboard</Button>
      </div>
    );
  }

  const question = questions[currentIndex];
  const qType = questionTypeKey(question);
  const progress = (currentIndex / questions.length) * 100;
  const hasAnswer = currentAnswer.trim().length > 0;

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="quiz-page"
    >
      {/* ── Top progress bar ──────────────────────────────────── */}
      <div
        className="relative h-2 bg-muted w-full overflow-hidden"
        data-ocid="quiz-progress-bar"
      >
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* ── Header strip ─────────────────────────────────────── */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <span className="text-label" data-ocid="quiz-question-counter">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <Progress value={progress} className="hidden sm:block w-40 h-1.5" />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive text-xs"
              data-ocid="quiz-finish-early-btn"
            >
              Finish Early
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End quiz early?</AlertDialogTitle>
              <AlertDialogDescription>
                You have answered {answers.size} of {questions.length}{" "}
                questions. Unanswered questions will be marked as blank. Your
                score will be calculated based on questions answered so far.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="quiz-finish-cancel">
                Keep Going
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleFinishEarly}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-ocid="quiz-finish-confirm"
              >
                End Quiz
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-10">
        {/* Timer */}
        <TimerDisplay seconds={timeLeft} total={totalSeconds} />

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="w-full max-w-2xl flex flex-col items-center gap-8"
          >
            {/* Question text */}
            <div className="w-full bg-card rounded-2xl border border-border p-6 shadow-card">
              <p className="text-label mb-3">
                {qType === "MultipleChoice"
                  ? "Multiple Choice"
                  : qType === "TrueFalse"
                    ? "True / False"
                    : "Fill in the Blank"}
              </p>
              <p className="text-question" data-ocid="quiz-question-text">
                {question.questionText}
              </p>
            </div>

            {/* Answer area */}
            <div
              className="w-full flex flex-col items-center gap-4"
              data-ocid="quiz-answer-area"
            >
              {qType === "MultipleChoice" && (
                <MultipleChoiceOptions
                  options={question.options}
                  selected={currentAnswer}
                  onSelect={handleMCSelect}
                />
              )}
              {qType === "TrueFalse" && (
                <TrueFalseOptions
                  selected={currentAnswer}
                  onSelect={setCurrentAnswer}
                />
              )}
              {qType === "FillInBlank" && (
                <FillInBlankInput
                  value={currentAnswer}
                  onChange={setCurrentAnswer}
                />
              )}
            </div>

            {/* Next / submit button (not shown for MC — auto-advances) */}
            {qType !== "MultipleChoice" && (
              <Button
                size="lg"
                className="w-full max-w-xs h-14 text-base font-semibold rounded-xl"
                disabled={!hasAnswer || autoAdvancing}
                onClick={handleNext}
                data-ocid="quiz-next-btn"
              >
                {currentIndex >= questions.length - 1
                  ? "Submit Quiz"
                  : "Next Question →"}
              </Button>
            )}
            {qType === "MultipleChoice" && (
              <Button
                size="lg"
                variant="outline"
                className="w-full max-w-xs h-14 text-base font-semibold rounded-xl"
                disabled={!hasAnswer || autoAdvancing}
                onClick={handleNext}
                data-ocid="quiz-next-btn"
              >
                {currentIndex >= questions.length - 1
                  ? "Submit Quiz"
                  : "Next Question →"}
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Bottom strip ─────────────────────────────────────── */}
      <footer className="bg-muted/40 border-t border-border px-4 py-3 flex items-center justify-center">
        <p className="text-xs text-muted-foreground tabular-nums">
          {answers.size} of {questions.length} answered
        </p>
      </footer>
    </div>
  );
}
