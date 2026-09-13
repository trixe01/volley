# Volley

Queue replies, reposts, and likes — then open each one on X.

Paste x.com / twitter.com links, prepare a queue, and confirm every action on X’s own intent page. Reply drafts are generated server-side. Status IDs stay strings (snowflake-safe).

Reply length defaults to **10–30 words**, biased short.

## Stack

TanStack Start, React 19, Tailwind v4.

Reply generation uses `XAI_API_KEY` on the server only (`/api/prepare-queue`). Never put that key in the client or commit it.
