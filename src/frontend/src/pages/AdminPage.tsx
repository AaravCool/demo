import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  BookOpen,
  Database,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { Layout } from "../components/Layout";
import { AddQuestionTab } from "../components/admin/AddQuestionTab";
import { BulkImportTab } from "../components/admin/BulkImportTab";
import { ChaptersTab } from "../components/admin/ChaptersTab";
import { SubjectsTab } from "../components/admin/SubjectsTab";
import { useAuth } from "../hooks/useAuth";
import { useBackend } from "../hooks/useBackend";

export const ADMIN_PRINCIPAL_ID =
  "stg4z-mbqle-h7omu-re7wj-od36c-yptmv-y5zbm-gmwfv-3zcmc-gvegn-iae";

export default function AdminPage() {
  const { principalId, isAuthenticated } = useAuth();
  const { actor } = useBackend();

  const isAdmin = principalId === ADMIN_PRINCIPAL_ID;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Diagnostic banner */}
        <div className="mb-6 p-4 rounded-lg border border-border bg-card text-sm space-y-1.5">
          <p className="font-semibold text-foreground flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Admin Diagnostics
          </p>
          <div className="text-muted-foreground space-y-1 font-mono text-xs">
            <p>
              <span className="text-foreground font-medium">Your ID:</span>{" "}
              {principalId ?? "(not logged in)"}
            </p>
            <p>
              <span className="text-foreground font-medium">Admin ID:</span>{" "}
              {ADMIN_PRINCIPAL_ID}
            </p>
            <p>
              <span className="text-foreground font-medium">Match:</span>{" "}
              <span className={isAdmin ? "text-green-600" : "text-destructive"}>
                {isAdmin ? "✓ Authenticated as Admin" : "✗ No match"}
              </span>
            </p>
            <p>
              <span className="text-foreground font-medium">Actor ready:</span>{" "}
              <span className={actor ? "text-green-600" : "text-yellow-600"}>
                {actor ? "✓ Yes" : "⏳ Initializing…"}
              </span>
            </p>
          </div>
        </div>

        {/* Access denied */}
        {!isAuthenticated && (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4"
            data-ocid="admin.error_state"
          >
            <ShieldAlert className="w-14 h-14 text-muted-foreground" />
            <p className="text-xl font-semibold text-foreground">
              Not Logged In
            </p>
            <p className="text-muted-foreground text-sm text-center max-w-sm">
              Please log in with Internet Identity to access the admin panel.
            </p>
          </div>
        )}

        {isAuthenticated && !isAdmin && (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4"
            data-ocid="admin.error_state"
          >
            <AlertCircle className="w-14 h-14 text-destructive/60" />
            <p className="text-xl font-semibold text-foreground">
              Access Denied
            </p>
            <p className="text-muted-foreground text-sm text-center max-w-sm">
              Your principal ID does not match the admin account. Check the
              diagnostics above to verify your identity.
            </p>
          </div>
        )}

        {/* Actor still initializing after login */}
        {isAuthenticated && isAdmin && !actor && (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4"
            data-ocid="admin.loading_state"
          >
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">
              Connecting to backend with your identity…
            </p>
          </div>
        )}

        {/* Admin panel */}
        {isAuthenticated && isAdmin && !!actor && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Admin Panel
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage subjects, chapters, and questions.
              </p>
            </div>

            <Tabs defaultValue="subjects" data-ocid="admin.tab">
              <TabsList className="mb-6">
                <TabsTrigger value="subjects" data-ocid="admin.subjects.tab">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Subjects
                </TabsTrigger>
                <TabsTrigger value="chapters" data-ocid="admin.chapters.tab">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Chapters
                </TabsTrigger>
                <TabsTrigger
                  value="add-question"
                  data-ocid="admin.add_question.tab"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Add Question
                </TabsTrigger>
                <TabsTrigger
                  value="bulk-import"
                  data-ocid="admin.bulk_import.tab"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Bulk Import
                </TabsTrigger>
              </TabsList>

              <TabsContent value="subjects">
                <SubjectsTab actor={actor} />
              </TabsContent>
              <TabsContent value="chapters">
                <ChaptersTab actor={actor} />
              </TabsContent>
              <TabsContent value="add-question">
                <AddQuestionTab actor={actor} />
              </TabsContent>
              <TabsContent value="bulk-import">
                <BulkImportTab actor={actor} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
}
