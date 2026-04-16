import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BookOpen, Trash2 } from "lucide-react";
import { useState } from "react";
import type {
  Chapter,
  Question,
  Subject,
  backendInterface,
} from "../../backend";

interface Props {
  actor: backendInterface | null;
}

const TYPE_LABELS: Record<string, string> = {
  MultipleChoice: "Multiple Choice",
  TrueFalse: "True / False",
  FillInBlank: "Fill in the Blank",
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colorClass =
    difficulty === "Easy"
      ? "bg-green-100 text-green-800 border-green-200"
      : difficulty === "Hard"
        ? "bg-red-100 text-red-800 border-red-200"
        : "bg-yellow-100 text-yellow-800 border-yellow-200";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
    >
      {difficulty}
    </span>
  );
}

function QuestionRow({
  question,
  index,
  onDelete,
  isDeleting,
}: {
  question: Question;
  index: number;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/20 transition-colors"
      data-ocid={`admin.manage_questions.item.${index}`}
    >
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-sm text-foreground font-medium line-clamp-2 leading-snug">
          {question.questionText}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">
            {TYPE_LABELS[question.questionType] ?? question.questionType}
          </Badge>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {confirmDelete ? (
          <>
            <span className="text-xs text-muted-foreground">Are you sure?</span>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(question.id)}
              disabled={isDeleting}
              data-ocid={`admin.manage_questions.confirm_button.${index}`}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={isDeleting}
              data-ocid={`admin.manage_questions.cancel_button.${index}`}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => setConfirmDelete(true)}
            data-ocid={`admin.manage_questions.delete_button.${index}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function ManageQuestionsTab({ actor }: Props) {
  const queryClient = useQueryClient();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [deleteError, setDeleteError] = useState<string>("");
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const { data: subjects, isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjects();
    },
    enabled: !!actor,
  });

  const subjectIdBig = selectedSubjectId ? BigInt(selectedSubjectId) : null;

  const { data: chapters, isLoading: chaptersLoading } = useQuery<Chapter[]>({
    queryKey: ["chapters", selectedSubjectId],
    queryFn: async () => {
      if (!actor || !subjectIdBig) return [];
      return actor.getChapters(subjectIdBig);
    },
    enabled: !!actor && !!subjectIdBig,
  });

  const chapterIdBig = selectedChapterId ? BigInt(selectedChapterId) : null;

  const {
    data: questions,
    isLoading: questionsLoading,
    isFetching: questionsFetching,
  } = useQuery<Question[]>({
    queryKey: ["questions", selectedChapterId],
    queryFn: async () => {
      if (!actor || !chapterIdBig) return [];
      return actor.getQuestions(chapterIdBig, BigInt(1000));
    },
    enabled: !!actor && !!chapterIdBig,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.deleteQuestion(id);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onMutate: (id) => {
      setDeletingId(id);
      setDeleteError("");
    },
    onSuccess: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({
        queryKey: ["questions", selectedChapterId],
      });
    },
    onError: (e: Error) => {
      setDeletingId(null);
      setDeleteError(e.message);
    },
  });

  const handleSubjectChange = (val: string) => {
    setSelectedSubjectId(val);
    setSelectedChapterId("");
    setDeleteError("");
  };

  const handleChapterChange = (val: string) => {
    setSelectedChapterId(val);
    setDeleteError("");
  };

  const showQuestions = !!selectedChapterId && !questionsLoading;
  const questionCount = questions?.length ?? 0;

  return (
    <div className="space-y-5">
      {/* Selectors */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold text-foreground">
          Select Subject & Chapter
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Subject */}
          <div className="space-y-1.5">
            <Label>Subject</Label>
            {subjectsLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select
                value={selectedSubjectId}
                onValueChange={handleSubjectChange}
              >
                <SelectTrigger data-ocid="admin.manage_questions.subject_select">
                  <SelectValue placeholder="Select subject…" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map((s) => (
                    <SelectItem key={String(s.id)} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Chapter */}
          <div className="space-y-1.5">
            <Label>Chapter</Label>
            {chaptersLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select
                value={selectedChapterId}
                onValueChange={handleChapterChange}
                disabled={!selectedSubjectId}
              >
                <SelectTrigger data-ocid="admin.manage_questions.chapter_select">
                  <SelectValue placeholder="Select chapter…" />
                </SelectTrigger>
                <SelectContent>
                  {chapters?.map((c) => (
                    <SelectItem key={String(c.id)} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {!selectedSubjectId && (
          <p className="text-xs text-muted-foreground">
            Select a subject to see its chapters.
          </p>
        )}
        {selectedSubjectId && !selectedChapterId && (
          <p className="text-xs text-muted-foreground">
            Select a chapter to view its questions.
          </p>
        )}
      </Card>

      {/* Question list */}
      {selectedChapterId && (
        <Card className="p-5 space-y-4">
          {/* Header row with count */}
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Questions
            </h2>
            {showQuestions && (
              <span
                className="text-sm text-muted-foreground tabular-nums"
                data-ocid="admin.manage_questions.count"
              >
                {questionCount} {questionCount === 1 ? "question" : "questions"}{" "}
                in this chapter
              </span>
            )}
          </div>

          {/* Delete error */}
          {deleteError && (
            <p
              className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2 flex items-center gap-2"
              data-ocid="admin.manage_questions.error_state"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {deleteError}
            </p>
          )}

          {/* Loading */}
          {(questionsLoading || questionsFetching) && !questions && (
            <div
              className="space-y-3"
              data-ocid="admin.manage_questions.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {showQuestions && questionCount === 0 && (
            <div
              className="flex flex-col items-center justify-center py-12 gap-3 text-center"
              data-ocid="admin.manage_questions.empty_state"
            >
              <BookOpen className="w-10 h-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No questions found in this chapter
              </p>
              <p className="text-xs text-muted-foreground/70">
                Add questions using the "Add Question" or "Bulk Import" tabs.
              </p>
            </div>
          )}

          {/* Question rows */}
          {showQuestions && questionCount > 0 && (
            <div className="space-y-2">
              {questions!.map((q, i) => (
                <QuestionRow
                  key={String(q.id)}
                  question={q}
                  index={i + 1}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  isDeleting={deletingId === q.id && deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
