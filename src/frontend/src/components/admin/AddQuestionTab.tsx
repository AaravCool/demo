import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { Chapter, Subject, backendInterface } from "../../backend";

interface Props {
  actor: backendInterface | null;
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
      {msg}
    </p>
  );
}

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"] as const;
const TYPE_OPTIONS = [
  { value: "MultipleChoice", label: "Multiple Choice" },
  { value: "TrueFalse", label: "True / False" },
  { value: "FillInBlank", label: "Fill in the Blank" },
] as const;

type QType = (typeof TYPE_OPTIONS)[number]["value"];

export function AddQuestionTab({ actor }: Props) {
  const queryClient = useQueryClient();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<QType>("MultipleChoice");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [solution, setSolution] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (!selectedChapterId) throw new Error("Select a chapter first");
      if (!questionText.trim()) throw new Error("Question text is required");
      if (!correctAnswer.trim()) throw new Error("Correct answer is required");

      const chapterId = BigInt(selectedChapterId);
      let finalOptions: string[] = [];

      if (questionType === "MultipleChoice") {
        finalOptions = options.map((o) => o.trim()).filter(Boolean);
        if (finalOptions.length < 2)
          throw new Error("Provide at least 2 options for Multiple Choice");
      } else if (questionType === "TrueFalse") {
        finalOptions = ["True", "False"];
      }

      const solutionValue: string | null = solution.trim() || null;

      const result = await actor.addQuestion(
        chapterId,
        questionText.trim(),
        questionType,
        finalOptions,
        correctAnswer.trim(),
        difficulty,
        solutionValue,
      );
      if ("err" in result) throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
      setDifficulty("Medium");
      setSolution("");
      setSubmitError("");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: (e: Error) => {
      setSubmitError(e.message);
      setSubmitSuccess(false);
    },
  });

  const handleSubjectChange = (val: string) => {
    setSelectedSubjectId(val);
    setSelectedChapterId("");
  };

  const updateOption = (idx: number, val: string) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));
  };

  return (
    <Card className="p-5 space-y-5">
      <h2 className="font-semibold text-foreground">Add a Question</h2>

      {/* Subject */}
      <div className="space-y-1.5">
        <Label>Subject</Label>
        {subjectsLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <Select value={selectedSubjectId} onValueChange={handleSubjectChange}>
            <SelectTrigger data-ocid="admin.add_question.subject_select">
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
            onValueChange={setSelectedChapterId}
            disabled={!selectedSubjectId}
          >
            <SelectTrigger data-ocid="admin.add_question.chapter_select">
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

      {/* Question text */}
      <div className="space-y-1.5">
        <Label htmlFor="q-text">Question Text</Label>
        <Textarea
          id="q-text"
          placeholder="Enter the question…"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={3}
          data-ocid="admin.add_question.text.textarea"
        />
      </div>

      {/* Type + Difficulty row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Question Type</Label>
          <Select
            value={questionType}
            onValueChange={(v) => {
              setQuestionType(v as QType);
              setCorrectAnswer("");
            }}
          >
            <SelectTrigger data-ocid="admin.add_question.type_select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger data-ocid="admin.add_question.difficulty_select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Options for Multiple Choice */}
      {questionType === "MultipleChoice" && (
        <div className="space-y-2">
          <Label>Answer Options</Label>
          <Input
            placeholder="Option 1"
            value={options[0]}
            onChange={(e) => updateOption(0, e.target.value)}
            data-ocid="admin.add_question.option.input.1"
          />
          <Input
            placeholder="Option 2"
            value={options[1]}
            onChange={(e) => updateOption(1, e.target.value)}
            data-ocid="admin.add_question.option.input.2"
          />
          <Input
            placeholder="Option 3"
            value={options[2]}
            onChange={(e) => updateOption(2, e.target.value)}
            data-ocid="admin.add_question.option.input.3"
          />
          <Input
            placeholder="Option 4"
            value={options[3]}
            onChange={(e) => updateOption(3, e.target.value)}
            data-ocid="admin.add_question.option.input.4"
          />
        </div>
      )}

      {/* True/False preview */}
      {questionType === "TrueFalse" && (
        <div className="space-y-1.5">
          <Label>Options (fixed)</Label>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-md bg-muted text-sm text-muted-foreground">
              True
            </span>
            <span className="px-3 py-1.5 rounded-md bg-muted text-sm text-muted-foreground">
              False
            </span>
          </div>
        </div>
      )}

      {/* Correct answer */}
      <div className="space-y-1.5">
        <Label htmlFor="q-correct">Correct Answer</Label>
        {questionType === "MultipleChoice" ? (
          <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
            <SelectTrigger data-ocid="admin.add_question.correct_answer_select">
              <SelectValue placeholder="Select correct option…" />
            </SelectTrigger>
            <SelectContent>
              {options.filter(Boolean).map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : questionType === "TrueFalse" ? (
          <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
            <SelectTrigger data-ocid="admin.add_question.correct_answer_select">
              <SelectValue placeholder="True or False?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="True">True</SelectItem>
              <SelectItem value="False">False</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="q-correct"
            placeholder="Type the correct answer"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            data-ocid="admin.add_question.correct_answer.input"
          />
        )}
      </div>

      {/* Solution / Explanation */}
      <div className="space-y-1.5">
        <Label htmlFor="q-solution">
          Solution / Explanation{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="q-solution"
          placeholder="Explain why this is the correct answer…"
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          rows={3}
          data-ocid="admin.add_question.solution.textarea"
        />
        <p className="text-xs text-muted-foreground">
          This explanation will be shown to students after they complete the
          quiz.
        </p>
      </div>

      {submitError && <ErrorMsg msg={submitError} />}

      {submitSuccess && (
        <p
          className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 flex items-center gap-2"
          data-ocid="admin.add_question.success_state"
        >
          <CheckCircle2 className="w-4 h-4" />
          Question added successfully!
        </p>
      )}

      <Button
        onClick={() => addMutation.mutate()}
        disabled={addMutation.isPending}
        data-ocid="admin.add_question.submit_button"
      >
        {addMutation.isPending ? "Saving…" : "Add Question"}
      </Button>
    </Card>
  );
}
