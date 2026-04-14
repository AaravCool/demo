import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  HelpCircle,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { Layout } from "../components/Layout";
import { useBackend } from "../hooks/useBackend";
import type { Question, QuizAttempt, Subject } from "../types";

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: bigint): string {
  const s = Number(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m === 0) return `${rem}s`;
  return `${m}m ${rem}s`;
}

interface QuestionRowProps {
  index: number;
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: bigint;
}

function QuestionRow({
  index,
  question,
  userAnswer,
  isCorrect,
  timeSpent,
}: QuestionRowProps) {
  return (
    <Card
      className={[
        "shadow-card border-l-4",
        isCorrect ? "border-l-[hsl(var(--chart-3))]" : "border-l-destructive",
      ].join(" ")}
      data-ocid="question-result-row"
    >
      <CardContent className="py-4 px-5 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground mt-0.5">
              {index + 1}
            </span>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {question.questionText}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-[hsl(var(--chart-3))] shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-destructive shrink-0" />
            )}
            <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
              <Clock className="w-3 h-3 inline mr-1 opacity-60" />
              {formatDuration(timeSpent)}
            </span>
          </div>
        </div>

        {/* Answer comparison */}
        <div className="grid sm:grid-cols-2 gap-2 pl-8">
          <div
            className={[
              "rounded-lg px-3 py-2 text-sm border",
              isCorrect
                ? "bg-secondary border-border"
                : "bg-destructive/5 border-destructive/20",
            ].join(" ")}
          >
            <p className="text-label mb-0.5">Your Answer</p>
            <p
              className={[
                "font-medium",
                isCorrect ? "text-[hsl(var(--chart-3))]" : "text-destructive",
              ].join(" ")}
            >
              {userAnswer || (
                <span className="italic opacity-60">No answer</span>
              )}
            </p>
          </div>
          {!isCorrect && (
            <div className="rounded-lg px-3 py-2 text-sm border bg-secondary border-border">
              <p className="text-label mb-0.5">Correct Answer</p>
              <p className="font-medium text-[hsl(var(--chart-3))]">
                {question.correctAnswer}
              </p>
            </div>
          )}
        </div>

        {/* Options for MCQ */}
        {question.options.length > 0 && (
          <div className="pl-8 flex flex-wrap gap-2">
            {question.options.map((opt) => (
              <span
                key={opt}
                className={[
                  "inline-flex items-center px-2.5 py-1 rounded-full text-xs border",
                  opt === question.correctAnswer
                    ? "bg-secondary border-border text-[hsl(var(--chart-3))]"
                    : opt === userAnswer && !isCorrect
                      ? "bg-destructive/10 border-destructive/30 text-destructive"
                      : "bg-muted/50 border-border text-muted-foreground",
                ].join(" ")}
              >
                {opt}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AttemptDetailPage() {
  const { attemptId } = useParams({ strict: false }) as { attemptId: string };
  const navigate = useNavigate();
  const { actor, isFetching } = useBackend();

  const { data: attempt, isLoading: attemptLoading } =
    useQuery<QuizAttempt | null>({
      queryKey: ["attemptDetail", attemptId],
      queryFn: async () => {
        if (!actor) return null;
        return actor.getAttemptDetail(BigInt(attemptId));
      },
      enabled: !!actor && !isFetching && !!attemptId,
    });

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjects();
    },
    enabled: !!actor && !isFetching,
  });

  const subjectId = attempt?.subjectId;
  const { data: chapters } = useQuery({
    queryKey: ["chapters", String(subjectId)],
    queryFn: async () => {
      if (!actor || !subjectId) return [];
      return actor.getChapters(subjectId);
    },
    enabled: !!actor && !isFetching && !!subjectId,
  });

  // Fetch question details for each questionResult
  const chapterId = attempt?.chapterId;
  const { data: questions } = useQuery<Question[]>({
    queryKey: ["questions", String(chapterId), String(attempt?.totalQuestions)],
    queryFn: async () => {
      if (!actor || !chapterId || !attempt) return [];
      return actor.getQuestions(chapterId, attempt.totalQuestions);
    },
    enabled: !!actor && !isFetching && !!chapterId && !!attempt,
  });

  const subjectName =
    subjects?.find((s) => String(s.id) === String(attempt?.subjectId))?.name ??
    "—";
  const chapterName =
    chapters?.find((c) => String(c.id) === String(attempt?.chapterId))?.name ??
    "—";

  const isLoading = attemptLoading || isFetching;
  const pct = attempt ? Math.round(attempt.score) : 0;

  function ScoreSummaryBadge() {
    if (pct >= 80) return <Badge variant="default">{pct}% — Excellent</Badge>;
    if (pct >= 60) return <Badge variant="secondary">{pct}% — Good</Badge>;
    return <Badge variant="destructive">{pct}% — Needs Work</Badge>;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back nav */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/history" })}
          className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
          data-ocid="back-to-history"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </Button>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        )}

        {!isLoading && !attempt && (
          <div className="text-center py-24">
            <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Attempt not found.</p>
          </div>
        )}

        {!isLoading && attempt && (
          <>
            {/* Header card */}
            <Card className="shadow-card" data-ocid="attempt-header">
              <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-label mb-1">Attempt Detail</p>
                    <CardTitle className="font-display text-xl text-foreground">
                      {subjectName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {chapterName}
                    </p>
                  </div>
                  <ScoreSummaryBadge />
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-label">Score</span>
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="text-lg font-display font-semibold text-foreground">
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-label">Correct</span>
                    <div className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-lg font-display font-semibold text-foreground">
                        {Number(attempt.correctAnswers)}/
                        {Number(attempt.totalQuestions)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-label">Time Taken</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-lg font-display font-semibold text-foreground">
                        {formatDuration(attempt.timeTaken)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-label">Completed</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(attempt.completedAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question breakdown */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Question Breakdown
              </h2>
              <div className="space-y-3" data-ocid="question-breakdown">
                {attempt.questionResults.map((result, idx) => {
                  const question = questions?.find(
                    (q) => String(q.id) === String(result.questionId),
                  );
                  if (!question) {
                    // Fallback row when question data not available
                    return (
                      <Card
                        key={String(result.questionId)}
                        className={[
                          "shadow-card border-l-4",
                          result.isCorrect
                            ? "border-l-[hsl(var(--chart-3))]"
                            : "border-l-destructive",
                        ].join(" ")}
                        data-ocid="question-result-row"
                      >
                        <CardContent className="py-3 px-5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                              {idx + 1}
                            </span>
                            <span className="text-sm text-muted-foreground italic">
                              Question #{String(result.questionId)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {result.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-[hsl(var(--chart-3))]" />
                            ) : (
                              <XCircle className="w-5 h-5 text-destructive" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              Your answer:{" "}
                              <strong>{result.userAnswer || "—"}</strong>
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                  return (
                    <QuestionRow
                      key={String(result.questionId)}
                      index={idx}
                      question={question}
                      userAnswer={result.userAnswer}
                      isCorrect={result.isCorrect}
                      timeSpent={result.timeSpent}
                    />
                  );
                })}
              </div>
            </div>

            {/* Footer CTA */}
            <div className="flex justify-center pt-4 pb-6">
              <Button
                onClick={() => navigate({ to: "/" })}
                data-ocid="practice-again-btn"
              >
                Practice Again
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
