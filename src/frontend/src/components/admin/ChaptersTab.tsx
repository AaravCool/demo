import { Badge } from "@/components/ui/badge";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
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

export function ChaptersTab({ actor }: Props) {
  const queryClient = useQueryClient();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [addName, setAddName] = useState("");
  const [addError, setAddError] = useState("");
  const [editId, setEditId] = useState<bigint | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<bigint | null>(null);

  const { data: subjects, isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjects();
    },
    enabled: !!actor,
  });

  const subjectIdBig = selectedSubjectId ? BigInt(selectedSubjectId) : null;

  const {
    data: chapters,
    isLoading: chaptersLoading,
    error: chaptersError,
  } = useQuery<Chapter[]>({
    queryKey: ["chapters", selectedSubjectId],
    queryFn: async () => {
      if (!actor || !subjectIdBig) return [];
      return actor.getChapters(subjectIdBig);
    },
    enabled: !!actor && !!subjectIdBig,
  });

  const addMutation = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!actor || !subjectIdBig) throw new Error("Select a subject first");
      const result = await actor.addChapter(subjectIdBig, name);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      setAddName("");
      setAddError("");
      queryClient.invalidateQueries({
        queryKey: ["chapters", selectedSubjectId],
      });
    },
    onError: (e: Error) => setAddError(`${e.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: bigint; name: string }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.updateChapter(id, name);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      setEditId(null);
      setEditError("");
      queryClient.invalidateQueries({
        queryKey: ["chapters", selectedSubjectId],
      });
    },
    onError: (e: Error) => setEditError(`${e.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.deleteChapter(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      setDeleteConfirm(null);
      queryClient.invalidateQueries({
        queryKey: ["chapters", selectedSubjectId],
      });
    },
    onError: (e: Error) => alert(`Delete failed: ${e.message}`),
  });

  const startEdit = (c: Chapter) => {
    setEditId(c.id);
    setEditName(c.name);
    setEditError("");
  };

  return (
    <div className="space-y-6">
      {/* Subject selector */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold text-foreground">Select Subject</h2>
        {subjectsLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <Select
            value={selectedSubjectId}
            onValueChange={setSelectedSubjectId}
          >
            <SelectTrigger data-ocid="admin.chapters.subject_select">
              <SelectValue placeholder="Choose a subject…" />
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
      </Card>

      {/* Add Chapter form */}
      {selectedSubjectId && (
        <Card className="p-5 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Add Chapter
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="chap-name">Chapter Name</Label>
            <Input
              id="chap-name"
              placeholder="e.g. Algebra Basics"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              data-ocid="admin.chapters.add_name.input"
            />
          </div>
          {addError && <ErrorMsg msg={addError} />}
          <Button
            onClick={() => addMutation.mutate({ name: addName.trim() })}
            disabled={!addName.trim() || addMutation.isPending}
            data-ocid="admin.chapters.add_button"
          >
            {addMutation.isPending ? "Adding…" : "Add Chapter"}
          </Button>
        </Card>
      )}

      {/* Chapter list */}
      {selectedSubjectId && (
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground">Chapters</h2>

          {chaptersLoading && (
            <div className="space-y-2" data-ocid="admin.chapters.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          )}

          {chaptersError && (
            <ErrorMsg
              msg={`Failed to load chapters: ${String(chaptersError)}`}
            />
          )}

          {chapters && chapters.length === 0 && !chaptersLoading && (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="admin.chapters.empty_state"
            >
              No chapters yet. Add one above.
            </p>
          )}

          {chapters?.map((chapter, idx) => (
            <Card
              key={String(chapter.id)}
              className="p-4"
              data-ocid={`admin.chapters.item.${idx + 1}`}
            >
              {editId === chapter.id ? (
                <div className="space-y-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Chapter name"
                    data-ocid={`admin.chapters.edit_name.input.${idx + 1}`}
                  />
                  {editError && <ErrorMsg msg={editError} />}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        updateMutation.mutate({
                          id: chapter.id,
                          name: editName.trim(),
                        })
                      }
                      disabled={!editName.trim() || updateMutation.isPending}
                      data-ocid={`admin.chapters.save_button.${idx + 1}`}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      {updateMutation.isPending ? "Saving…" : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditId(null)}
                      data-ocid={`admin.chapters.cancel_button.${idx + 1}`}
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground truncate min-w-0">
                    {chapter.name}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      ID: {String(chapter.id)}
                    </Badge>
                    {deleteConfirm === chapter.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(chapter.id)}
                          disabled={deleteMutation.isPending}
                          data-ocid={`admin.chapters.confirm_button.${idx + 1}`}
                        >
                          {deleteMutation.isPending ? "Deleting…" : "Confirm"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(null)}
                          data-ocid={`admin.chapters.cancel_button.${idx + 1}`}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(chapter)}
                          data-ocid={`admin.chapters.edit_button.${idx + 1}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteConfirm(chapter.id)}
                          data-ocid={`admin.chapters.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
