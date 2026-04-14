import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Info } from "lucide-react";
import { useState } from "react";
import type { backendInterface } from "../../backend";

interface Props {
  actor: backendInterface | null;
}

const FORMAT_EXAMPLE =
  "What is 2 + 2? | 3 | 4 | 5 | 6 | 4 | MultipleChoice\nIs water H2O? | True | False | | | True | TrueFalse\nThe capital of France is ____. | | | | | Paris | FillInBlank";

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2 whitespace-pre-wrap">
      {msg}
    </p>
  );
}

export function BulkImportTab({ actor }: Props) {
  const [rawText, setRawText] = useState("");
  const [importCount, setImportCount] = useState<number | null>(null);
  const [importError, setImportError] = useState("");

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!actor)
        throw new Error("Actor not ready — please wait for login to complete.");
      const trimmed = rawText.trim();
      if (!trimmed) throw new Error("Paste some questions first.");
      const result = await actor.bulkImportQuestions(trimmed);
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

  return (
    <div className="space-y-5">
      {/* Format instructions */}
      <Card className="p-5 space-y-3 bg-muted/30">
        <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
          <Info className="w-4 h-4 text-primary" />
          Format Instructions
        </h3>
        <p className="text-xs text-muted-foreground">
          Paste one question per line. Use pipe characters{" "}
          <code className="bg-muted px-1 rounded">|</code> to separate fields:
        </p>
        <code className="block text-xs bg-muted rounded-md px-3 py-2 text-foreground whitespace-pre-wrap font-mono leading-relaxed">
          Question text | option1 | option2 | option3 | option4 | correct_answer
          | question_type
        </code>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <span className="text-foreground font-medium">question_type</span>{" "}
            values:{" "}
            <code className="bg-muted px-1 rounded">MultipleChoice</code>,{" "}
            <code className="bg-muted px-1 rounded">TrueFalse</code>,{" "}
            <code className="bg-muted px-1 rounded">FillInBlank</code>
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
          disabled={!rawText.trim() || importMutation.isPending}
          data-ocid="admin.bulk_import.submit_button"
        >
          {importMutation.isPending ? "Importing…" : "Import Questions"}
        </Button>
      </Card>
    </div>
  );
}
