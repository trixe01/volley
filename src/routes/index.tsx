import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Heart, MessageSquare, Repeat2 } from "lucide-react";
import { AppFrame } from "@/components/app-frame";
import { VolleyMark, Wordmark } from "@/components/wordmark";

export const Route = createFileRoute("/")({ component: Home });

const ACTIONS = [
  {
    to: "/reply" as const,
    icon: MessageSquare,
    title: "Reply",
    body: "Draft a queue of first-replies, then open each one on X.",
  },
  {
    to: "/repost" as const,
    icon: Repeat2,
    title: "Repost",
    body: "Walk a list of posts and confirm each repost in X’s intent page.",
  },
  {
    to: "/like" as const,
    icon: Heart,
    title: "Like",
    body: "Walk a list of posts and confirm each like in X’s intent page.",
  },
];

function Home() {
  return (
    <AppFrame>
      <main className="mx-auto flex w-full max-w-5xl flex-col px-4 py-16 sm:px-6 sm:py-24">
        <div className="rise-in max-w-2xl">
          <div className="flex items-center gap-3 text-accent">
            <VolleyMark className="size-7" />
            <span className="text-xs font-medium tracking-[0.22em] uppercase">Return serve</span>
          </div>
          <h1 className="mt-6 text-balance">
            <Wordmark size="hero" />
          </h1>
          <span className="mt-5 block h-px w-10 bg-accent" aria-hidden="true" />
          <p className="mt-6 max-w-md text-base leading-relaxed text-pretty text-fg-muted sm:text-lg">
            Paste the posts. Build a queue. Open each reply, repost, or like on X — one at a time,
            nothing sent until you confirm.
          </p>
        </div>

        <ul className="mt-14 grid gap-3 sm:grid-cols-3">
          {ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <li key={action.to} className={`rise-in rise-in-${i + 2}`}>
                <Link
                  to={action.to}
                  className="group flex h-full flex-col rounded-lg border border-border bg-bg-elevated p-5 transition-colors duration-150 hover:border-accent sm:p-6"
                >
                  <span className="flex size-10 items-center justify-center rounded-md border border-border text-accent">
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <h2 className="mt-5 text-lg font-medium tracking-tight">{action.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-pretty text-fg-muted">
                    {action.body}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm text-accent">
                    Open
                    <ArrowUpRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <ol className="rise-in rise-in-4 mt-16 grid gap-6 border-t border-border pt-10 text-sm sm:grid-cols-3">
          {[
            { n: "01", t: "Paste", d: "Drop x.com links or raw status IDs." },
            { n: "02", t: "Queue", d: "Replies are drafted. Reposts and likes just line up." },
            { n: "03", t: "Open", d: "Each step launches X’s own intent page. You send it." },
          ].map((step) => (
            <li key={step.n}>
              <p className="font-mono text-xs tabular-nums text-accent">{step.n}</p>
              <p className="mt-2 font-medium">{step.t}</p>
              <p className="mt-1 leading-relaxed text-pretty text-fg-muted">{step.d}</p>
            </li>
          ))}
        </ol>
      </main>
    </AppFrame>
  );
}
