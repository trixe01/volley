import { extractTweetIds, MAX_QUEUE, type QueueItem, type TweetId } from "./tweet";

export type PrepareQueueResult =
  | { ok: true; items: QueueItem[]; warning?: string }
  | { ok: false; error: string };

type FxTweet = {
  tweet?: {
    text?: string;
    author?: { screen_name?: string };
  };
};

async function fetchTweetText(id: TweetId): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(`https://api.fxtwitter.com/status/${id}`, {
      signal: ctrl.signal,
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as FxTweet;
    const text = data.tweet?.text?.trim();
    if (!text) return null;
    const handle = data.tweet?.author?.screen_name;
    return handle ? `@${handle}: ${text}` : text;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function parseReplyList(raw: string, count: number): string[] {
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fence?.[1] ?? raw).trim();
  const jsonMatch = body.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) return Array.from({ length: count }, () => "");
  try {
    const parsed: unknown = JSON.parse(jsonMatch[0]);
    let list: unknown[] = [];
    if (Array.isArray(parsed)) list = parsed;
    else if (parsed && typeof parsed === "object" && "replies" in parsed) {
      const replies = (parsed as { replies: unknown }).replies;
      if (Array.isArray(replies)) list = replies;
    }
    return Array.from({ length: count }, (_, i) => {
      const entry = list[i];
      if (typeof entry === "string") return entry.trim();
      if (entry && typeof entry === "object" && "reply" in entry) {
        const reply = (entry as { reply: unknown }).reply;
        return typeof reply === "string" ? reply.trim() : "";
      }
      return "";
    });
  } catch {
    return Array.from({ length: count }, () => "");
  }
}

async function generateReplies(
  tweets: { id: TweetId; text: string | null }[],
  voice: string,
): Promise<{ replies: string[]; warning?: string }> {
  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      replies: tweets.map(() => ""),
      warning: "AI drafts are unavailable here. Write each reply yourself, then open it on X.",
    };
  }

  const voiceLine = voice
    ? `Voice / style: ${voice}`
    : "Voice / style: concise, natural, a little sharp. No hashtags, no emoji, no marketing cadence.";

  const catalog = tweets
    .map((t, i) => {
      const snippet = t.text ? t.text.slice(0, 600) : "(tweet text unavailable)";
      return `${i + 1}. ${snippet}`;
    })
    .join("\n\n");

  const prompt = `You write first-replies for X (Twitter). ${voiceLine}

Rules:
- One reply per tweet, same order.
- Length: 10–30 words. Bias to the short end (~10–16). Go longer only when the point needs the extra context.
- Sound like a real person. No "as an AI", no hashtags, no emoji unless the voice asks.
- If tweet text is unavailable, write a short generic nod or question that still works as a first reply. Do not invent facts.

Tweets:
${catalog}

Return ONLY JSON: {"replies":["..."]} with exactly ${tweets.length} strings.`;

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.7,
      max_tokens: Math.min(1600, 80 * tweets.length + 200),
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    return {
      replies: tweets.map(() => ""),
      warning: "Could not draft replies. The queue is still ready — write them in, then open on X.",
    };
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = body.choices?.[0]?.message?.content ?? "";
  const replies = parseReplyList(content, tweets.length);
  const missing = replies.every((r) => !r);
  return {
    replies,
    warning: missing
      ? "Drafts came back empty. Write each reply yourself, then open it on X."
      : undefined,
  };
}

export async function prepareQueue(input: string, voice: string): Promise<PrepareQueueResult> {
  const ids = extractTweetIds(input).slice(0, MAX_QUEUE);
  if (ids.length === 0) {
    return { ok: false, error: "No status IDs found. Paste x.com / twitter.com links or raw IDs." };
  }

  const texts = await Promise.all(ids.map((id) => fetchTweetText(id)));
  const tweets = ids.map((id, i) => ({ id, text: texts[i] ?? null }));

  let replies: string[] = tweets.map(() => "");
  let warning: string | undefined;
  try {
    const generated = await generateReplies(tweets, voice);
    replies = generated.replies;
    warning = generated.warning;
  } catch {
    warning = "Could not draft replies. The queue is still ready — write them in, then open on X.";
  }

  const items: QueueItem[] = tweets.map((t, i) => ({
    id: t.id,
    tweetText: t.text,
    reply: replies[i] ?? "",
  }));

  const extra = extractTweetIds(input).length - ids.length;
  const overflow =
    extra > 0 ? `Queued the first ${ids.length} of ${ids.length + extra} posts.` : undefined;
  const combined = [overflow, warning].filter(Boolean).join(" ");

  return { ok: true, items, warning: combined || undefined };
}
