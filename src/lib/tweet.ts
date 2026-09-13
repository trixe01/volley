/** Max posts we'll queue in one run — keeps generation spend bounded. */
export const MAX_QUEUE = 12;

/**
 * X snowflake IDs exceed `Number.MAX_SAFE_INTEGER`. Every ID in this app is a
 * decimal *string* — never `Number()`, `parseInt`, or JSON numbers.
 */
export type TweetId = string;

export type QueueItem = {
  id: TweetId;
  reply: string;
  tweetText: string | null;
};

/**
 * Pull status IDs out of a paste blob. Matches x.com / twitter.com status
 * URLs (including `/i/web/status/` and `/i/status/`) and bare numeric IDs
 * sitting on their own line. Order is first-seen; duplicates are dropped.
 */
export function extractTweetIds(input: string): TweetId[] {
  const ids: TweetId[] = [];
  const seen = new Set<string>();

  const add = (id: string | undefined) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    ids.push(id);
  };

  const urlRe =
    /(?:https?:\/\/)?(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/(?:i\/(?:web\/)?status|[A-Za-z0-9_]+\/status)\/(\d+)/gi;
  let match: RegExpExecArray | null;
  while ((match = urlRe.exec(input)) !== null) {
    add(match[1]);
  }

  for (const line of input.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (/^\d{10,}$/.test(trimmed)) add(trimmed);
  }

  return ids;
}

export function tweetPermalink(id: TweetId): string {
  return `https://x.com/i/web/status/${id}`;
}

/** Official web-intent reply URL. `text` is omitted when empty so X opens a blank composer. */
export function replyIntentUrl(id: TweetId, text: string): string {
  const params = new URLSearchParams();
  params.set("in_reply_to", id);
  const trimmed = text.trim();
  if (trimmed) params.set("text", trimmed);
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function retweetIntentUrl(id: TweetId): string {
  const params = new URLSearchParams();
  params.set("tweet_id", id);
  return `https://twitter.com/intent/retweet?${params.toString()}`;
}

export function likeIntentUrl(id: TweetId): string {
  const params = new URLSearchParams();
  params.set("tweet_id", id);
  return `https://twitter.com/intent/like?${params.toString()}`;
}

export function openIntent(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
