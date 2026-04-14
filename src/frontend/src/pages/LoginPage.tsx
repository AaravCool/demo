import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Sparkles } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login, isInitializing, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null; // Router will redirect
  }

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="login-page"
    >
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg text-foreground tracking-tight">
              StudyQuest
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-8">
          {/* Hero text */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1.5 rounded-full border border-border mb-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              Smart Quiz Practice
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground leading-tight">
              Master every
              <br />
              subject, chapter
              <br />
              by chapter.
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
              Choose your subject, set a timer, and track your progress over
              time with detailed performance history.
            </p>
          </div>

          {/* Login card */}
          <Card className="shadow-card border-border" data-ocid="login-card">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-1.5">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Sign in to continue
                </h2>
                <p className="text-sm text-muted-foreground">
                  Use Internet Identity — secure, passwordless login.
                </p>
              </div>

              <Button
                className="w-full gap-2 font-semibold"
                size="lg"
                onClick={login}
                disabled={isInitializing}
                data-ocid="login-btn"
              >
                {isInitializing ? (
                  "Connecting..."
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    Sign in with Internet Identity
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                No password required. Your data is tied to your identity.
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Timed Quizzes", sub: "Custom timers" },
              { label: "3 Formats", sub: "MC, T/F, Fill-in" },
              { label: "Progress", sub: "Track history" },
            ].map(({ label, sub }) => (
              <div
                key={label}
                className="bg-card border border-border rounded-lg p-3 space-y-0.5"
              >
                <p className="text-xs font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/40 border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="underline hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
