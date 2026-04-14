import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Subject, backendInterface } from "../../backend";

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

export function SubjectsTab({ actor }: Props) {
  const queryClient = useQueryClient();
  const [addName, setAddName] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addError, setAddError] = useState("");
  const [editId, setEditId] = useState<bigint | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editError, setEditError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<bigint | null>(null);

  const {
    data: subjects,
    isLoading,
    error,
  } = useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjects();
    },
    enabled: !!actor,
  });

  const addMutation = useMutation({
    mutationFn: async ({ name, desc }: { name: string; desc: string }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.addSubject(name, desc);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      setAddName("");
      setAddDesc("");
      setAddError("");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (e: Error) => setAddError(`${e.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      name,
      desc,
    }: {
      id: bigint;
      name: string;
      desc: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.updateSubject(id, name, desc);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      setEditId(null);
      setEditError("");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (e: Error) => setEditError(`${e.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.deleteSubject(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      setDeleteConfirm(null);
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (e: Error) => alert(`Delete failed: ${e.message}`),
  });

  const startEdit = (s: Subject) => {
    setEditId(s.id);
    setEditName(s.name);
    setEditDesc(s.description);
    setEditError("");
  };

  return (
    <div className="space-y-6">
      {/* Add Subject form */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          Add Subject
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="sub-name">Name</Label>
            <Input
              id="sub-name"
              placeholder="e.g. Mathematics"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              data-ocid="admin.subjects.add_name.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sub-desc">Description</Label>
            <Input
              id="sub-desc"
              placeholder="e.g. Algebra, Geometry, Calculus"
              value={addDesc}
              onChange={(e) => setAddDesc(e.target.value)}
              data-ocid="admin.subjects.add_desc.input"
            />
          </div>
        </div>
        {addError && <ErrorMsg msg={addError} />}
        <Button
          onClick={() =>
            addMutation.mutate({ name: addName.trim(), desc: addDesc.trim() })
          }
          disabled={!addName.trim() || addMutation.isPending}
          data-ocid="admin.subjects.add_button"
        >
          {addMutation.isPending ? "Adding…" : "Add Subject"}
        </Button>
      </Card>

      {/* Subject list */}
      <div className="space-y-3">
        <h2 className="font-semibold text-foreground">Existing Subjects</h2>

        {isLoading && (
          <div className="space-y-2" data-ocid="admin.subjects.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <ErrorMsg msg={`Failed to load subjects: ${String(error)}`} />
        )}

        {subjects && subjects.length === 0 && (
          <p
            className="text-muted-foreground text-sm"
            data-ocid="admin.subjects.empty_state"
          >
            No subjects yet. Add one above.
          </p>
        )}

        {subjects?.map((subject, idx) => (
          <Card
            key={String(subject.id)}
            className="p-4"
            data-ocid={`admin.subjects.item.${idx + 1}`}
          >
            {editId === subject.id ? (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Subject name"
                    data-ocid={`admin.subjects.edit_name.input.${idx + 1}`}
                  />
                  <Input
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Description"
                    data-ocid={`admin.subjects.edit_desc.input.${idx + 1}`}
                  />
                </div>
                {editError && <ErrorMsg msg={editError} />}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      updateMutation.mutate({
                        id: subject.id,
                        name: editName.trim(),
                        desc: editDesc.trim(),
                      })
                    }
                    disabled={!editName.trim() || updateMutation.isPending}
                    data-ocid={`admin.subjects.save_button.${idx + 1}`}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    {updateMutation.isPending ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditId(null)}
                    data-ocid={`admin.subjects.cancel_button.${idx + 1}`}
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {subject.name}
                  </p>
                  {subject.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {subject.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    ID: {String(subject.id)}
                  </Badge>
                  {deleteConfirm === subject.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(subject.id)}
                        disabled={deleteMutation.isPending}
                        data-ocid={`admin.subjects.confirm_button.${idx + 1}`}
                      >
                        {deleteMutation.isPending ? "Deleting…" : "Confirm"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirm(null)}
                        data-ocid={`admin.subjects.cancel_button.${idx + 1}`}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(subject)}
                        data-ocid={`admin.subjects.edit_button.${idx + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteConfirm(subject.id)}
                        data-ocid={`admin.subjects.delete_button.${idx + 1}`}
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
    </div>
  );
}
