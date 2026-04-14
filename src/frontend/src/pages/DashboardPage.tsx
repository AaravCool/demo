import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronRight,
  Clock,
  Copy,
  Star,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/useAuth";
import { useBackend } from "../hooks/useBackend";
import type { Chapter, StudentProfile, Subject } from "../types";

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  loading: boolean;
}

function StatCard({ icon: Icon, label, value, loading }: StatCardProps) {
  return (
    <Card className="shadow-card border-border">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-label">{label}</p>
            {loading ? (
              <Skeleton className="h-6 w-16 mt-1" />
            ) : (
              <p className="text-xl font-display font-semibold text-foreground leading-tight mt-0.5">
                {value}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Subject Card ─────────────────────────────────────────────────────────────

interface SubjectCardProps {
  subject: Subject;
  isSelected: boolean;
  onClick: () => void;
}

const SUBJECT_COLORS = [
  "bg-primary/10 text-primary",
  "bg-accent/15 text-accent-foreground",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

function SubjectCard({ subject, isSelected, onClick }: SubjectCardProps) {
  const colorClass = SUBJECT_COLORS[Number(subject.id) % SUBJECT_COLORS.length];
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      data-ocid={`subject-card-${subject.id}`}
      className={[
        "w-full text-left rounded-xl border transition-smooth cursor-pointer",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
          : "border-border bg-card hover:border-primary/40 hover:shadow-sm",
      ].join(" ")}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          {isSelected && (
            <Badge
              variant="secondary"
              className="text-xs bg-primary/10 text-primary border-0"
            >
              Selected
            </Badge>
          )}
        </div>
        <h3 className="font-display font-semibold text-foreground mt-3 leading-snug">
          {subject.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {subject.description}
        </p>
        <div className="flex items-center gap-1 mt-3 text-primary text-xs font-medium">
          <span>View chapters</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.button>
  );
}

// ─── Quiz Config Form ──────────────────────────────────────────────────────────

interface QuizConfigFormProps {
  chapters: Chapter[];
  chaptersLoading: boolean;
  onStart: (
    chapterId: bigint,
    questionCount: number,
    timeLimit: number,
  ) => void;
}

function QuizConfigForm({
  chapters,
  chaptersLoading,
  onStart,
}: QuizConfigFormProps) {
  const [chapterId, setChapterId] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<string>("10");
  const [timeLimit, setTimeLimit] = useState<string>("10");

  // Reset chapter when subject changes (detected via chapters prop identity)
  const prevChaptersRef = useRef(chapters);
  if (prevChaptersRef.current !== chapters) {
    prevChaptersRef.current = chapters;
    if (chapterId !== "") setChapterId("");
  }

  const canStart = chapterId !== "" && !chaptersLoading && chapters.length > 0;

  function handleStart() {
    if (!canStart) return;
    onStart(BigInt(chapterId), Number(questionCount), Number(timeLimit) * 60);
  }

  return (
    <Card className="shadow-card border-border bg-card">
      <CardHeader className="pb-3 pt-5 px-5">
        <h2 className="font-display font-semibold text-foreground text-lg">
          Configure Your Quiz
        </h2>
        <p className="text-sm text-muted-foreground">
          Pick a chapter, then set question count and time limit.
        </p>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        {/* Chapter */}
        <div className="space-y-1.5">
          <label className="text-label" htmlFor="chapter-select">
            Chapter
          </label>
          {chaptersLoading ? (
            <Skeleton className="h-10 w-full rounded-md" />
          ) : chapters.length === 0 ? (
            <div className="h-10 rounded-md border border-dashed border-border flex items-center px-3">
              <span className="text-sm text-muted-foreground">
                Select a subject first
              </span>
            </div>
          ) : (
            <Select value={chapterId} onValueChange={setChapterId}>
              <SelectTrigger
                id="chapter-select"
                className="w-full"
                data-ocid="chapter-select"
              >
                <SelectValue placeholder="Choose a chapter…" />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((ch) => (
                  <SelectItem key={String(ch.id)} value={String(ch.id)}>
                    {ch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Question Count + Time Limit side-by-side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-label" htmlFor="question-count">
              Questions
            </label>
            <Select value={questionCount} onValueChange={setQuestionCount}>
              <SelectTrigger
                id="question-count"
                data-ocid="question-count-select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} questions
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-label" htmlFor="time-limit">
              Time Limit
            </label>
            <Select value={timeLimit} onValueChange={setTimeLimit}>
              <SelectTrigger id="time-limit" data-ocid="time-limit-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20].map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {m} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chapter description */}
        {chapterId && chapters.find((c) => String(c.id) === chapterId) && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 leading-relaxed">
            {chapters.find((c) => String(c.id) === chapterId)?.description}
          </p>
        )}

        <Button
          className="w-full gap-2"
          disabled={!canStart}
          onClick={handleStart}
          data-ocid="start-quiz-btn"
        >
          <Clock className="w-4 h-4" />
          Start Quiz
        </Button>

        {!canStart && chapters.length > 0 && !chapterId && (
          <p className="text-xs text-muted-foreground text-center">
            Select a chapter to continue
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { actor, isFetching } = useBackend();
  const { principalId } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  // Load subjects + profile once actor is ready
  useEffect(() => {
    // While actor is being initialized, show loading skeletons
    if (isFetching) {
      setSubjectsLoading(true);
      setProfileLoading(true);
      return;
    }
    // Actor failed to initialize (canister not available)
    if (!actor) {
      setSubjectsLoading(false);
      setProfileLoading(false);
      return;
    }

    (async () => {
      setSubjectsLoading(true);
      setProfileLoading(true);
      try {
        const [subs, prof] = await Promise.all([
          actor.getSubjects(),
          actor.getMyProfile(),
        ]);
        setSubjects(subs);
        setProfile(prof);
      } catch {
        setSubjects([]);
      } finally {
        setSubjectsLoading(false);
        setProfileLoading(false);
      }
    })();
  }, [actor, isFetching]);

  // Load chapters when subject changes
  useEffect(() => {
    if (!actor || isFetching || !selectedSubject) {
      setChapters([]);
      return;
    }
    (async () => {
      setChaptersLoading(true);
      setChapters([]);
      try {
        const chs = await actor.getChapters(selectedSubject.id);
        setChapters(chs);
      } catch {
        setChapters([]);
      } finally {
        setChaptersLoading(false);
      }
    })();
  }, [actor, isFetching, selectedSubject]);

  function handleSubjectSelect(subject: Subject) {
    setSelectedSubject((prev) => (prev?.id === subject.id ? null : subject));
  }

  function handleStartQuiz(
    chapterId: bigint,
    questionCount: number,
    timeLimit: number,
  ) {
    navigate({
      to: "/quiz",
      state: {
        quizConfig: {
          chapterId,
          questionCount,
          timeLimit,
          subjectId: selectedSubject?.id ?? BigInt(0),
        },
      },
    });
  }

  const statsData = [
    {
      icon: BookOpen,
      label: "Total Quizzes",
      value: profile ? String(profile.totalAttempts) : "0",
    },
    {
      icon: Star,
      label: "Best Score",
      value: profile ? `${Math.round(profile.bestScore)}%` : "—",
    },
    {
      icon: TrendingUp,
      label: "Average Score",
      value: profile ? `${Math.round(profile.averageScore)}%` : "—",
    },
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Welcome + Stats */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
              Welcome back 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Choose a subject and start practising today.
            </p>

            {/* Principal ID card */}
            {principalId && (
              <div className="mt-3 inline-flex items-center gap-2 bg-muted/60 border border-border rounded-lg px-3 py-2 max-w-full">
                <span className="text-xs text-muted-foreground shrink-0">
                  Your ID:
                </span>
                <span
                  className="font-mono text-xs text-foreground truncate"
                  title={principalId}
                >
                  {principalId}
                </span>
                <button
                  type="button"
                  aria-label="Copy principal ID"
                  data-ocid="copy-principal-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(principalId);
                    toast.success("Principal ID copied!");
                  }}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5"
            data-ocid="stats-section"
          >
            {statsData.map((s) => (
              <StatCard
                key={s.label}
                icon={s.icon}
                label={s.label}
                value={s.value}
                loading={profileLoading}
              />
            ))}
          </motion.div>
        </section>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Subjects Grid — 3 cols */}
          <section className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-semibold text-foreground text-lg">
                Subjects
              </h2>
              {!subjectsLoading && subjects.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {subjects.length}
                </Badge>
              )}
            </div>

            {subjectsLoading ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[152px] rounded-xl" />
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <div
                className="rounded-xl border border-dashed border-border bg-muted/30 py-14 flex flex-col items-center gap-2"
                data-ocid="subjects-empty"
              >
                <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No subjects available yet.
                </p>
              </div>
            ) : (
              <div
                className="grid sm:grid-cols-2 gap-3"
                data-ocid="subjects-grid"
              >
                {subjects.map((subject, i) => (
                  <motion.div
                    key={String(subject.id)}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.07 }}
                  >
                    <SubjectCard
                      subject={subject}
                      isSelected={selectedSubject?.id === subject.id}
                      onClick={() => handleSubjectSelect(subject)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Quiz Config — 2 cols */}
          <section className="lg:col-span-2 lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-display font-semibold text-foreground text-lg">
                Start a Quiz
              </h2>
            </div>
            <QuizConfigForm
              chapters={chapters}
              chaptersLoading={chaptersLoading}
              onStart={handleStartQuiz}
            />

            {selectedSubject && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-xs text-center text-muted-foreground"
              >
                Subject:{" "}
                <span className="font-medium text-foreground">
                  {selectedSubject.name}
                </span>
              </motion.p>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}
