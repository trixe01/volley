import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowUpRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  extractTweetIds,
  likeIntentUrl,
  MAX_QUEUE,
  openIntent,
  replyIntentUrl,
  retweetIntentUrl,
  tweetPermalink,
  type QueueItem,
} from "@/lib/tweet";
import { cn } from "@/lib/utils";

export type ActionMode = "reply" | "repost" | "like";

const COPY: Record<
  ActionMode,
  {
    title: string;
    lede: string;
    placeholder: string;
    prepare: string;
    preparing: string;
    action: string;
    done: string;
  }
> = {
  reply: {
    title: "Reply",
    lede: "Paste X links or status IDs. Drafts stay short — usually ~10–16 words, up to 30 when the point needs it. You post them on X.",
    placeholder: "https://x.com/name/status/…\nhttps://x.com/name/status/…",
    prepare: "Prepare queue",
    preparing: "Drafting replies…",
    action: "Reply on X",
    done: "Queue clear. Every reply has been opened on X — or skipped.",
  },
  repost: {
    title: "Repost",
    lede: "Walk a list of posts and open each repost intent on X. Nothing is posted until you confirm there.",
    placeholder: "https://x.com/name/status/…\nhttps://x.com/name/status/…",
    prepare: "Start queue",
    preparing: "Building queue…",
    action: "Repost on X",
    done: "Queue clear. Every repost intent has been opened — or skipped.",
  },
  like: {
    title: "Like",
    lede: "Walk a list of posts and open each like intent on X. Nothing is liked until you confirm there.",
    placeholder: "https://x.com/name/status/…\nhttps://x.com/name/status/…",
    prepare: "Start queue",
    preparing: "Building queue…",
    action: "Like on X",
    done: "Queue clear. Every like intent has been opened — or skipped.",
  },
};

type Phase = "compose" | "queue" | "done";

function intentFor(mode: ActionMode, item: QueueItem, draft: string): string {
  if (mode === "reply") return replyIntentUrl(item.id, draft);
  if (mode === "repost") return retweetIntentUrl(item.id);
  return likeIntentUrl(item.id);
}

export function ActionWorkspace({ mode }: { mode: ActionMode }) {
  const copy = COPY[mode];
  const [input, setInput] = useState("");
  const [voice, setVoice] = useState("");
  const [phase, setPhase] = useState<Phase>("compose");
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [warning, setWarning] = useState<string | undefined>();

  const detected = useMemo(() => extractTweetIds(input), [input]);
  const current = items[index];

  function saveDraftOnto(next: QueueItem[], at: number): QueueItem[] {
    return next.map((item, i) => (i === at ? { ...item, reply: draft } : item));
  }

  function goTo(nextIndex: number) {
    const updated = saveDraftOnto(items, index);
    setItems(updated);
    setIndex(nextIndex);
    setDraft(updated[nextIndex]?.reply ?? "");
  }

  async function onPrepare(e: FormEvent) {
    e.preventDefault();
    const ids = extractTweetIds(input);
    if (ids.length === 0) {
      toast.error("No status IDs found. Paste x.com links or raw IDs.");
      return;
    }

    setBusy(true);
    setWarning(undefined);
    try {
      if (mode === "reply") {
        const res = await fetch("/api/prepare-queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, voice }),
        });
        const data = (await res.json()) as
          | { ok: true; items: QueueItem[]; warning?: string }
          | { ok: false; error: string };
        if (!data.ok) {
          toast.error(data.error);
          return;
        }
        setItems(data.items);
        setDraft(data.items[0]?.reply ?? "");
        setWarning(data.warning);
        setIndex(0);
        setPhase("queue");
      } else {
        const sliced = ids.slice(0, MAX_QUEUE);
        const next: QueueItem[] = sliced.map((id) => ({
          id,
          reply: "",
          tweetText: null,
        }));
        const extra = ids.length - sliced.length;
        setItems(next);
        setDraft("");
        setWarning(
          extra > 0 ? `Queued the first ${sliced.length} of ${ids.length} posts.` : undefined,
        );
        setIndex(0);
        setPhase("queue");
      }
    } catch {
      toast.error("Could not prepare the queue. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function onOpen() {
    if (!current) return;
    openIntent(intentFor(mode, current, draft));
    const next = index + 1;
    if (next >= items.length) {
      setItems(saveDraftOnto(items, index));
      setPhase("done");
      return;
    }
    goTo(next);
  }

  function onSkip() {
    const next = index + 1;
    if (next >= items.length) {
      setPhase("done");
      return;
    }
    goTo(next);
  }

  function reset() {
    setPhase("compose");
    setItems([]);
    setIndex(0);
    setDraft("");
    setWarning(undefined);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 max-w-xl">
        <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">Queue</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-balance">{copy.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-pretty text-fg-muted">{copy.lede}</p>
      </div>

      {phase === "compose" && (
        <form onSubmit={onPrepare} className="max-w-xl space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-medium tracking-wide text-fg-muted uppercase">
              Posts
            </span>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={copy.placeholder}
              rows={10}
              className="min-h-48 font-mono text-sm leading-relaxed"
              spellCheck={false}
            />
          </label>
          {mode === "reply" && (
            <label className="block">
              <span className="mb-2 block text-xs font-medium tracking-wide text-fg-muted uppercase">
                Voice
              </span>
              <Input
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                placeholder="Optional — dry, curious, brief…"
                maxLength={160}
              />
            </label>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-sm tabular-nums text-fg-muted">
              {detected.length === 0
                ? "No posts detected yet"
                : detected.length === 1
                  ? "1 post detected"
                  : `${detected.length} posts detected`}
              {detected.length > MAX_QUEUE ? ` · first ${MAX_QUEUE} will be queued` : ""}
            </p>
            <Button type="submit" disabled={busy || detected.length === 0}>
              {busy ? copy.preparing : copy.prepare}
            </Button>
          </div>
        </form>
      )}

      {phase === "queue" && current && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
          <section className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm tabular-nums text-fg-muted">
                {index + 1} of {items.length}
              </p>
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-10 items-center text-sm text-fg-muted transition-colors hover:text-fg"
              >
                Start over
              </button>
            </div>
            <div className="h-px bg-border">
              <div
                className="h-px bg-accent transition-[width] duration-200"
                style={{ width: `${((index + 1) / items.length) * 100}%` }}
              />
            </div>
            {warning && <p className="text-sm text-fg-muted">{warning}</p>}

            <article className="rounded-lg border border-border bg-bg-elevated p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium tracking-wide text-fg-muted uppercase">Status</p>
                  <p className="mt-1 font-mono text-sm break-all text-fg tabular-nums">{current.id}</p>
                </div>
                <a
                  href={tweetPermalink(current.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-1 text-sm text-accent hover:underline"
                >
                  Open original
                  <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
                </a>
              </div>
              {current.tweetText && (
                <p className="mt-4 text-sm leading-relaxed text-pretty text-fg-muted">
                  {current.tweetText}
                </p>
              )}
            </article>

            {mode === "reply" && (
              <label className="block">
                <span className="mb-2 block text-xs font-medium tracking-wide text-fg-muted uppercase">
                  Draft
                </span>
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={5}
                  className="min-h-32 leading-relaxed"
                  maxLength={280}
                />
                <span className="mt-1.5 block text-right text-xs tabular-nums text-fg-subtle">
                  {(draft.trim() ? draft.trim().split(/\s+/).length : 0)} words · {draft.length}/280
                </span>
              </label>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => goTo(Math.max(0, index - 1))}
                disabled={index === 0}
                aria-label="Previous"
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>
              <Button type="button" variant="ghost" onClick={onSkip}>
                Skip
              </Button>
              <Button type="button" onClick={onOpen} className="ml-auto">
                {copy.action}
                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </section>

          <aside className="hidden lg:block">
            <p className="mb-3 text-xs font-medium tracking-wide text-fg-muted uppercase">Queue</p>
            <ol className="space-y-1">
              {items.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    className={cn(
                      "flex h-10 w-full items-center gap-2 rounded-md border px-2.5 text-left font-mono text-xs tabular-nums transition-colors duration-150",
                      i === index
                        ? "border-accent bg-accent-soft text-fg"
                        : "border-transparent text-fg-muted hover:border-border hover:text-fg",
                    )}
                  >
                    <span className="w-5 text-fg-subtle">{i + 1}</span>
                    <span className="truncate">{item.id}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      )}

      {phase === "done" && (
        <div className="max-w-xl rounded-lg border border-border bg-bg-elevated p-6">
          <h2 className="text-xl font-medium tracking-tight">Done</h2>
          <p className="mt-2 text-sm leading-relaxed text-pretty text-fg-muted">{copy.done}</p>
          <Button type="button" onClick={reset} className="mt-6">
            New queue
          </Button>
        </div>
      )}
    </main>
  );
}
