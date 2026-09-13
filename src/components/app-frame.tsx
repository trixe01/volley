import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { VolleyMark, Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/reply" as const, label: "Reply" },
  { to: "/repost" as const, label: "Repost" },
  { to: "/like" as const, label: "Like" },
];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/95">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 text-fg">
            <VolleyMark className="size-5 text-accent" />
            <Wordmark size="sm" />
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-10 items-center rounded-md px-3 text-sm transition-colors duration-150",
                    active ? "text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
