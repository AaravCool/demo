import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Award,
  BarChart2,
  BookOpen,
  ChevronRight,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Layout } from "../components/Layout";
import { useBackend } from "../hooks/useBackend";
import type { QuizAttempt, Subject } from "../types";

type SortKey =
  | "subject"
  | "chapter"
  | "score"
  | "questions"
  | "timeTaken"
  | "completedAt";
type SortDir = "asc" | "desc";

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(seconds: bigint): string {
  const s = Number(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m === 0) return `${rem}s`;
  return `${m}m ${rem}s`;
}

function scoreBadgeVariant(
  score: number,
): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  return "destructive";
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="pt-5 pb-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-label">{label}</p>
          <p className="text-2xl font-display font-semibold text-foreground mt-0.5">
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  const { actor, isFetching } = useBackend();
  const navigate = useNavigate();

  const [sortKey, setSortKey] = useState<SortKey>("completedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { data: attempts, isLoading: attemptsLoading } = useQuery<
    QuizAttempt[]
  >({
    queryKey: ["myAttempts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyAttempts();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjects();
    },
    enabled: !!actor && !isFetching,
  });

  const subjectMap = useMemo(() => {
    const map = new Map<bigint, string>();
    for (const s of subjects ?? []) map.set(s.id, s.name);
    return map;
  }, [subjects]);

  // Chapter names: fetch all unique chapters
  const uniqueSubjectIds = useMemo(() => {
    const ids = new Set<bigint>();
    for (const a of attempts ?? []) ids.add(a.subjectId);
    return [...ids];
  }, [attempts]);

  const { data: allChapters } = useQuery({
    queryKey: ["allChapters", uniqueSubjectIds.map(String).join(",")],
    queryFn: async () => {
      if (!actor || uniqueSubjectIds.length === 0)
        return new Map<bigint, string>();
      const results = await Promise.all(
        uniqueSubjectIds.map((id) => actor.getChapters(id)),
      );
      const map = new Map<bigint, string>();
      for (const chapters of results) {
        for (const ch of chapters) map.set(ch.id, ch.name);
      }
      return map;
    },
    enabled: !!actor && !isFetching && uniqueSubjectIds.length > 0,
  });

  const chapterMap = allChapters ?? new Map<bigint, string>();

  const stats = useMemo(() => {
    const list = attempts ?? [];
    if (list.length === 0) return null;
    const total = list.length;
    const best = Math.max(...list.map((a) => a.score));
    const avg = list.reduce((sum, a) => sum + a.score, 0) / list.length;
    return { total, best: Math.round(best), avg: Math.round(avg) };
  }, [attempts]);

  const trendData = useMemo(() => {
    const list = [...(attempts ?? [])].sort(
      (a, b) => Number(a.completedAt) - Number(b.completedAt),
    );
    return list.map((a, i) => ({
      attempt: i + 1,
      score: Math.round(a.score),
      label: formatDate(a.completedAt),
    }));
  }, [attempts]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "completedAt" ? "desc" : "asc");
    }
  }

  const sorted = useMemo(() => {
    const list = [...(attempts ?? [])];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "subject") {
        cmp = (subjectMap.get(a.subjectId) ?? "").localeCompare(
          subjectMap.get(b.subjectId) ?? "",
        );
      } else if (sortKey === "chapter") {
        cmp = (chapterMap.get(a.chapterId) ?? "").localeCompare(
          chapterMap.get(b.chapterId) ?? "",
        );
      } else if (sortKey === "score") {
        cmp = a.score - b.score;
      } else if (sortKey === "questions") {
        cmp = Number(a.totalQuestions) - Number(b.totalQuestions);
      } else if (sortKey === "timeTaken") {
        cmp = Number(a.timeTaken) - Number(b.timeTaken);
      } else {
        cmp = Number(a.completedAt) - Number(b.completedAt);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [attempts, sortKey, sortDir, subjectMap, chapterMap]);

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-primary" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary" />
    );
  }

  const isLoading = attemptsLoading || isFetching;
  const isEmpty = !isLoading && (attempts?.length ?? 0) === 0;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">
            Quiz History
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review your past attempts and track your progress.
          </p>
        </div>

        {/* Summary stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : stats ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            data-ocid="stats-summary"
          >
            <StatCard
              icon={ClipboardList}
              label="Total Quizzes"
              value={stats.total}
            />
            <StatCard
              icon={Award}
              label="Best Score"
              value={`${stats.best}%`}
              sub="Personal best"
            />
            <StatCard
              icon={BarChart2}
              label="Average Score"
              value={`${stats.avg}%`}
              sub="All attempts"
            />
          </div>
        ) : null}

        {/* Trend chart */}
        {!isLoading && trendData.length >= 2 && (
          <Card className="shadow-card" data-ocid="trend-chart">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <TrendingUp className="w-4 h-4 text-primary" />
                Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart
                  data={trendData}
                  margin={{ top: 4, right: 16, left: -16, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="attempt"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    label={{
                      value: "Attempt #",
                      position: "insideBottom",
                      offset: -2,
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Score"]}
                    labelFormatter={(label: number) => `Attempt ${label}`}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-primary, oklch(0.45 0.18 250))"
                    strokeWidth={2}
                    dot={{
                      r: 3,
                      fill: "var(--color-primary, oklch(0.45 0.18 250))",
                    }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div
            className="flex flex-col items-center justify-center py-24 gap-4"
            data-ocid="empty-history"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center max-w-xs">
              <h2 className="text-lg font-display font-semibold text-foreground">
                No quizzes yet
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Complete your first quiz to start tracking your performance!
              </p>
            </div>
            <Button
              onClick={() => navigate({ to: "/" })}
              data-ocid="empty-start-btn"
            >
              Start Practicing
            </Button>
          </div>
        )}

        {/* Table */}
        {!isEmpty && !isLoading && (
          <Card
            className="shadow-card overflow-hidden"
            data-ocid="history-table-card"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    {(
                      [
                        { key: "subject" as SortKey, label: "Subject" },
                        { key: "chapter" as SortKey, label: "Chapter" },
                        { key: "score" as SortKey, label: "Score" },
                        { key: "questions" as SortKey, label: "Questions" },
                        { key: "timeTaken" as SortKey, label: "Time Taken" },
                        { key: "completedAt" as SortKey, label: "Date" },
                      ] as { key: SortKey; label: string }[]
                    ).map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-4 py-3 text-left whitespace-nowrap"
                      >
                        <button
                          type="button"
                          className="flex items-center gap-1.5 font-semibold text-muted-foreground text-xs tracking-wide uppercase cursor-pointer select-none hover:text-foreground transition-colors"
                          onClick={() => toggleSort(key)}
                          data-ocid={`col-sort-${key}`}
                        >
                          {label}
                          <SortIcon col={key} />
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-3 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((attempt, idx) => {
                    const attemptIdStr = String(attempt.attemptId);
                    const goToDetail = () =>
                      navigate({
                        to: "/history/$attemptId",
                        params: { attemptId: attemptIdStr },
                      });
                    const handleKey = (e: React.KeyboardEvent) => {
                      if (e.key === "Enter") goToDetail();
                    };
                    const subjectName =
                      subjectMap.get(attempt.subjectId) ?? "—";
                    const chapterName =
                      chapterMap.get(attempt.chapterId) ?? "—";
                    const pct = Math.round(attempt.score);
                    return (
                      <tr
                        key={attemptIdStr}
                        className={[
                          "border-b border-border last:border-0 group hover:bg-muted/30 transition-colors",
                          idx % 2 === 0 ? "bg-background" : "bg-muted/10",
                        ].join(" ")}
                        data-ocid="history-row"
                      >
                        <td
                          className="px-4 py-3 font-medium text-foreground max-w-[140px] truncate cursor-pointer hover:text-primary transition-colors"
                          onClick={goToDetail}
                          onKeyDown={handleKey}
                        >
                          {subjectName}
                        </td>
                        <td
                          className="px-4 py-3 text-muted-foreground max-w-[140px] truncate cursor-pointer"
                          onClick={goToDetail}
                          onKeyDown={handleKey}
                        >
                          {chapterName}
                        </td>
                        <td
                          className="px-4 py-3 cursor-pointer"
                          onClick={goToDetail}
                          onKeyDown={handleKey}
                        >
                          <Badge
                            variant={scoreBadgeVariant(pct)}
                            className="tabular-nums"
                          >
                            {pct}%
                          </Badge>
                        </td>
                        <td
                          className="px-4 py-3 text-muted-foreground tabular-nums cursor-pointer"
                          onClick={goToDetail}
                          onKeyDown={handleKey}
                        >
                          {Number(attempt.correctAnswers)}/
                          {Number(attempt.totalQuestions)}
                        </td>
                        <td
                          className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap cursor-pointer"
                          onClick={goToDetail}
                          onKeyDown={handleKey}
                        >
                          {formatDuration(attempt.timeTaken)}
                        </td>
                        <td
                          className="px-4 py-3 text-muted-foreground whitespace-nowrap cursor-pointer"
                          onClick={goToDetail}
                          onKeyDown={handleKey}
                        >
                          {formatDate(attempt.completedAt)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <button
                            type="button"
                            aria-label="View attempt detail"
                            onClick={goToDetail}
                            className="p-1 rounded hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-smooth" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Loading skeleton table */}
        {isLoading && (
          <Card className="shadow-card overflow-hidden">
            <div className="p-4 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
