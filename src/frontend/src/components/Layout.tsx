import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Clock,
  History,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const ADMIN_PRINCIPAL_ID =
  "stg4z-mbqle-h7omu-re7wj-od36c-yptmv-y5zbm-gmwfv-3zcmc-gvegn-iae";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, principalId, principalTruncated, logout } =
    useAuth();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const isAdmin = principalId === ADMIN_PRINCIPAL_ID;

  const navLinks = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/history", label: "History", icon: History },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg text-foreground tracking-tight">
              StudyQuest
            </span>
          </Link>

          {/* Nav + Auth */}
          <div className="flex items-center gap-1">
            {isAuthenticated && (
              <>
                <nav className="hidden sm:flex items-center gap-1 mr-2">
                  {navLinks.map(({ to, label, icon: Icon }) => {
                    const isActive = pathname === to;
                    return (
                      <Link
                        key={to}
                        to={to}
                        className={[
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-smooth",
                          isActive
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                        ].join(" ")}
                        data-ocid={`nav-${label.toLowerCase()}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </Link>
                    );
                  })}

                  {/* Admin link — only for the admin principal */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={[
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-smooth",
                        pathname === "/admin"
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                      ].join(" ")}
                      data-ocid="nav-admin"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Admin
                    </Link>
                  )}
                </nav>

                <div className="flex items-center gap-2">
                  <span
                    className="hidden sm:block text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md"
                    title={principalId ?? ""}
                  >
                    {principalTruncated}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="gap-1.5 text-muted-foreground hover:text-destructive"
                    aria-label="Log out"
                    data-ocid="nav-logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {isAuthenticated && (
          <div className="sm:hidden flex border-t border-border bg-card">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={[
                    "flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                  data-ocid={`mobile-nav-${label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className={[
                  "flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
                  pathname === "/admin"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
                data-ocid="mobile-nav-admin"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 bg-background">{children}</main>

      {/* Footer */}
      <footer className="bg-muted/40 border-t border-border py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Practice makes perfect.</span>
          </div>
          <p className="text-xs text-muted-foreground">
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
        </div>
      </footer>
    </div>
  );
}
