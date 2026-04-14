import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  RotateCcw,
  Target,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { useBackend } from "../hooks/useBackend";
import type { Question, QuestionResult } from "../types";

// ── helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: bigint): string {
  const total = Number(seconds);
  if (total <= 0) return "0s";
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

function getScoreTier(pct: number): {
  label: string;
  ring: string;
  text: string;
  bg: string;
  badge: "default" | "secondary" | "destructive";
} {
  if (pct >= 80)
    return {
      label: "Excellent!",
      ring: "stroke-[oklch(0.55_0.18_150)]",
      text: "text-[oklch(0.45_0.18_150)]",
      bg: "bg-[oklch(0.96_0.04_150)]",
      badge: "default",
    };
  if (pct >= 60)
    return {
      label: "Good Job",
      ring: "stroke-[oklch(0.62_0.2_28)]",
      text: "text-[oklch(0.52_0.19_28)]",
      bg: "bg-[oklch(0.97_0.04_28)]",
      badge: "secondary",
    };
  return {
    label: "Keep Practicing",
    ring: "stroke-[oklch(0.55_0.22_25)]",
    text: "text-destructive",
    bg: "bg-destructive/10",
    badge: "destructive",
  };
}

// ── Score circle ─────────────────────────────────────────────────────────────

function ScoreCircle({
  pct,
  correct,
  total,
}: {
  pct: number;
  correct: number;
  total: number;
}) {
  const tier = getScoreTier(pct);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct / 100);

  return (
    <div
      className={`relative flex items-center justify-center ${tier.bg} rounded-full p-2`}
    >
      <svg width="144" height="144" viewBox="0 0 144 144" aria-hidden="true">
        <circle
          cx="72"
          cy="72"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-border opacity-40"
        />
        <circle
          cx="72"
          cy="72"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          className={tier.ring}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            transition: "stroke-dashoffset 1s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-4xl font-display font-bold tabular-nums leading-none ${tier.text}`}
        >
          {pct}%
        </span>
        <span className="text-xs text-muted-foreground mt-1 font-medium">
          {correct}/{total}
        </span>
      </div>
    </div>
  );
}

// ── Question row ─────────────────────────────────────────────────────────────

function QuestionRow({
  idx,
  result,
  question,
}: {
  idx: number;
  result: QuestionResult;
  question: Question | undefined;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-smooth ${
        result.isCorrect
          ? "border-[oklch(0.75_0.1_150)]"
          : "border-destructive/40"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
        aria-expanded={open}
        data-ocid={`question-row-${idx}`}
      >
        <span className="flex-shrink-0 mt-0.5">
          {result.isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-[oklch(0.55_0.18_150)]" />
          ) : (
            <XCircle className="w-5 h-5 text-destructive" />
          )}
        </span>
        <span className="flex-1 min-w-0">
          <span className="text-label mr-2">Q{idx + 1}</span>
          <span className="text-sm font-medium text-foreground line-clamp-2">
            {question?.questionText ?? "Question not available"}
          </span>
        </span>
        <span className="flex-shrink-0 text-muted-foreground ml-2 mt-0.5">
          {open ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 bg-muted/20 border-t border-border space-y-2 text-sm">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <div>
              <span className="text-label mr-1">Your answer:</span>
              <span
                className={
                  result.isCorrect
                    ? "text-[oklch(0.45_0.18_150)] font-medium"
                    : "text-destructive font-medium"
                }
              >
                {result.userAnswer || "—"}
              </span>
            </div>
            {!result.isCorrect && question && (
              <div>
                <span className="text-label mr-1">Correct:</span>
                <span className="text-[oklch(0.45_0.18_150)] font-medium">
                  {question.correctAnswer}
                </span>
              </div>
            )}
            <div>
              <span className="text-label mr-1">Time:</span>
              <span className="text-foreground">
                {formatTime(result.timeSpent)}
              </span>
            </div>
          </div>
          {question && question.options.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-label block">Options</span>
              <ul className="space-y-0.5">
                {question.options.map((opt) => (
                  <li
                    key={opt}
                    className={`px-2 py-1 rounded text-sm ${
                      opt === question.correctAnswer
                        ? "bg-[oklch(0.96_0.04_150)] text-[oklch(0.35_0.18_150)] font-medium"
                        : opt === result.userAnswer && !result.isCorrect
                          ? "bg-destructive/10 text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function ResultsSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="w-36 h-36 rounded-full" />
        <Skeleton className="h-6 w-40" />
        <div className="flex gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-20" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { attemptId } = useParams({ from: "/results/$attemptId" });
  const navigate = useNavigate();
  const { actor, isFetching } = useBackend();

  const attemptIdBigInt = BigInt(attemptId);

  const { data: attempt, isLoading: loadingAttempt } = useQuery({
    queryKey: ["attemptDetail", attemptId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAttemptDetail(attemptIdBigInt);
    },
    enabled: !!actor && !isFetching,
  });

  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjects();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: chapters } = useQuery({
    queryKey: ["chapters", attempt?.subjectId?.toString()],
    queryFn: async () => {
      if (!actor || !attempt) return [];
      return actor.getChapters(attempt.subjectId);
    },
    enabled: !!actor && !isFetching && !!attempt,
  });

  // Load questions for the chapter to show question text + options
  const { data: questions } = useQuery({
    queryKey: ["questions", attempt?.chapterId?.toString()],
    queryFn: async () => {
      if (!actor || !attempt) return [];
      return actor.getQuestions(attempt.chapterId, attempt.totalQuestions);
    },
    enabled: !!actor && !isFetching && !!attempt,
  });

  const isLoading = loadingAttempt || isFetching;

  if (isLoading) {
    return (
      <Layout>
        <ResultsSkeleton />
      </Layout>
    );
  }

  if (!attempt) {
    return (
      <Layout>
        <div
          className="max-w-3xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-4 text-center"
          data-ocid="results-not-found"
        >
          <Target className="w-12 h-12 text-muted-foreground" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Attempt not found
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            This quiz attempt does not exist or you don't have access to it.
          </p>
          <Button
            onClick={() => navigate({ to: "/" })}
            variant="default"
            data-ocid="results-go-dashboard"
          >
            Go to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const pct = Math.round(attempt.score);
  const tier = getScoreTier(pct);
  const subjectName =
    subjects?.find((s) => s.id === attempt.subjectId)?.name ??
    "Unknown Subject";
  const chapterName =
    chapters?.find((c) => c.id === attempt.chapterId)?.name ??
    "Unknown Chapter";

  const questionMap = new Map<string, Question>(
    (questions ?? []).map((q) => [q.id.toString(), q]),
  );

  return (
    <Layout>
      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-10"
        data-ocid="results-page"
      >
        {/* ── Hero score section ── */}
        <div
          className={`rounded-2xl p-8 ${tier.bg} border border-border text-center space-y-4`}
        >
          <div className="flex justify-center">
            <ScoreCircle
              pct={pct}
              correct={Number(attempt.correctAnswers)}
              total={Number(attempt.totalQuestions)}
            />
          </div>

          <div>
            <p className="text-label mb-1">Your Score</p>
            <h1 className={`font-display text-3xl font-bold ${tier.text}`}>
              {tier.label}
            </h1>
          </div>

          {/* Meta stats */}
          <div className="flex flex-wrap justify-center gap-6 pt-2">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-label">Subject</span>
              <span className="text-sm font-medium text-foreground">
                {subjectName}
              </span>
            </div>
            <div className="w-px bg-border hidden sm:block" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-label">Chapter</span>
              <span className="text-sm font-medium text-foreground">
                {chapterName}
              </span>
            </div>
            <div className="w-px bg-border hidden sm:block" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-label">Time Taken</span>
              <span className="text-sm font-medium text-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                {formatTime(attempt.timeTaken)}
              </span>
            </div>
            <div className="w-px bg-border hidden sm:block" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-label">Questions</span>
              <span className="text-sm font-medium text-foreground">
                {Number(attempt.totalQuestions)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button
              variant="default"
              className="gap-2"
              onClick={() => navigate({ to: "/" })}
              data-ocid="results-try-again"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate({ to: "/history" })}
              data-ocid="results-view-history"
            >
              <History className="w-4 h-4" />
              View All History
            </Button>
          </div>
        </div>

        {/* ── Question breakdown ── */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Question Breakdown
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-[oklch(0.55_0.18_150)]" />
                <span>{Number(attempt.correctAnswers)} correct</span>
                <XCircle className="w-4 h-4 text-destructive ml-2" />
                <span>
                  {Number(attempt.totalQuestions) -
                    Number(attempt.correctAnswers)}{" "}
                  wrong
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2" data-ocid="question-breakdown">
            {attempt.questionResults.map((result, idx) => (
              <QuestionRow
                key={result.questionId.toString()}
                idx={idx}
                result={result}
                question={questionMap.get(result.questionId.toString())}
              />
            ))}
          </CardContent>
        </Card>

        {/* ── Footer actions ── */}
        <div className="flex flex-wrap justify-center gap-3 pb-4">
          <Button
            variant="default"
            size="lg"
            className="gap-2"
            onClick={() => navigate({ to: "/" })}
            data-ocid="results-try-again-bottom"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => navigate({ to: "/history" })}
            data-ocid="results-view-history-bottom"
          >
            <History className="w-4 h-4" />
            View All History
          </Button>
        </div>
      </div>
    </Layout>
  );
}
