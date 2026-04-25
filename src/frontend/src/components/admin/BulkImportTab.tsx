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
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Info } from "lucide-react";
import { useState } from "react";
import type { Chapter, Subject, backendInterface } from "../../backend";

interface Props {
  actor: backendInterface | null;
}

const FORMAT_EXAMPLE =
  "What is 2 + 2? | 3 | 4 | 5 | 6 | 4 | MultipleChoice | Medium\nIs water H2O? | True | False | | | True | TrueFalse | Easy | Water is made of hydrogen and oxygen.\nThe capital of France is ____. | | | | | Paris | FillInBlank | Hard";

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2 whitespace-pre-wrap">
      {msg}
    </p>
  );
}

/**
 * For each non-empty line, inject chapterId at position 8 (after difficulty).
 * User input fields:
 *   [0] question, [1-4] options, [5] correct, [6] type, [7] difficulty, [8?] solution
 * After injection:
 *   [0-7] same, [8] chapterId, [9?] solution (shifted from user's index 8)
 * Missing difficulty defaults to "Medium".
 */
function injectChapterId(rawText: string, chapterId: string): string {
  return rawText
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      const fields = trimmed.split("|").map((f) => f.trim());
      // Pad to at least 8 fields (0-7)
      while (fields.length < 8) fields.push("");
      // If difficulty (index 7) is empty, default to "Medium"
      if (!fields[7]) fields[7] = "Medium";
      // Preserve optional solution at index 8 (user-supplied), then inject chapterId at index 8
      // by splicing it in — solution shifts to index 9
      fields.splice(8, 0, chapterId);
      return fields.join(" | ");
    })
    .filter((line) => line !== "")
    .join("\n");
}

export function BulkImportTab({ actor }: Props) {
  const [rawText, setRawText] = useState("");
  const [importCount, setImportCount] = useState<number | null>(null);
  const [importError, setImportError] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");

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

  const handleSubjectChange = (val: string) => {
    setSelectedSubjectId(val);
    setSelectedChapterId("");
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!actor)
        throw new Error("Actor not ready — please wait for login to complete.");
      if (!selectedChapterId)
        throw new Error("Select a subject and chapter before importing.");
      const trimmed = rawText.trim();
      if (!trimmed) throw new Error("Paste some questions first.");
      const processed = injectChapterId(trimmed, selectedChapterId);
      const result = await actor.bulkImportQuestions(processed);
      if (result.__kind__ === "err") throw new Error(result.err);
      return Number(result.ok);
    },
    onSuccess: (count) => {
      setImportCount(count);
      setImportError("");
    },
    onError: (e: Error) => {
      setImportError(e.message);
      setImportCount(null);
    },
  });

  const canSubmit =
    !!rawText.trim() && !!selectedChapterId && !importMutation.isPending;

  return (
    <div className="space-y-5">
      {/* Format instructions */}
      <Card className="p-5 space-y-3 bg-muted/30">
        <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
          <Info className="w-4 h-4 text-primary" />
          Format Instructions
        </h3>
        <p className="text-xs text-muted-foreground">
          Select the <strong>subject</strong> and <strong>chapter</strong> using
          the dropdowns below — no need to include them in the pasted text.
          Paste one question per line using pipe characters{" "}
          <code className="bg-muted px-1 rounded">|</code>:
        </p>
        <code className="block text-xs bg-muted rounded-md px-3 py-2 text-foreground whitespace-pre-wrap font-mono leading-relaxed">
          question | option1 | option2 | option3 | option4 | correct_answer |
          question_type | difficulty | solution (optional)
        </code>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <span className="text-foreground font-medium">question_type</span>{" "}
            values:{" "}
            <code className="bg-muted px-1 rounded">MultipleChoice</code>,{" "}
            <code className="bg-muted px-1 rounded">TrueFalse</code>,{" "}
            <code className="bg-muted px-1 rounded">FillInBlank</code>
          </p>
          <p>
            <span className="text-foreground font-medium">difficulty</span>:{" "}
            <code className="bg-muted px-1 rounded">Easy</code>,{" "}
            <code className="bg-muted px-1 rounded">Medium</code>,{" "}
            <code className="bg-muted px-1 rounded">Hard</code> (defaults to
            Medium if omitted)
          </p>
          <p>
            <span className="text-foreground font-medium">solution</span>: an
            optional 9th field — shown to students after the quiz as an
            explanation for the correct answer.
          </p>
          <p>For TrueFalse/FillInBlank, options 1–4 can be left empty.</p>
        </div>
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
            Show example
          </summary>
          <pre className="mt-2 bg-muted rounded-md px-3 py-2 text-foreground font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {FORMAT_EXAMPLE}
          </pre>
        </details>
      </Card>

      {/* Subject + Chapter selectors */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold text-foreground">Select Destination</h2>

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
                <SelectTrigger data-ocid="admin.bulk_import.subject_select">
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
                <SelectTrigger data-ocid="admin.bulk_import.chapter_select">
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

        {!selectedChapterId && selectedSubjectId && (
          <p className="text-xs text-muted-foreground">
            Select a chapter to enable import.
          </p>
        )}
        {!selectedSubjectId && (
          <p className="text-xs text-muted-foreground">
            Select a subject first to see its chapters.
          </p>
        )}
      </Card>

      {/* Paste area */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold text-foreground">Paste Questions</h2>
        <div className="space-y-1.5">
          <Label htmlFor="bulk-input">Questions (one per line)</Label>
          <Textarea
            id="bulk-input"
            placeholder={FORMAT_EXAMPLE}
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              setImportError("");
              setImportCount(null);
            }}
            rows={12}
            className="font-mono text-xs"
            data-ocid="admin.bulk_import.textarea"
          />
        </div>

        {importError && <ErrorMsg msg={importError} />}

        {importCount !== null && (
          <p
            className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 flex items-center gap-2"
            data-ocid="admin.bulk_import.success_state"
          >
            <CheckCircle2 className="w-4 h-4" />
            Successfully imported <strong>{importCount}</strong>{" "}
            {importCount === 1 ? "question" : "questions"}.
          </p>
        )}

        <Button
          onClick={() => importMutation.mutate()}
          disabled={!canSubmit}
          data-ocid="admin.bulk_import.submit_button"
        >
          {importMutation.isPending ? "Importing…" : "Import Questions"}
        </Button>
      </Card>
    </div>
  );
}
