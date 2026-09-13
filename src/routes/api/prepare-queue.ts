import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/prepare-queue")({
  server: {
    handlers: {
      GET: async () =>
        Response.json({ error: "Method not allowed. POST a paste blob." }, { status: 405 }),
      POST: async ({ request }) => {
        const { prepareQueue } = await import("@/lib/prepare-queue.server");

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Expected JSON." }, { status: 400 });
        }

        const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
        const input = typeof record.input === "string" ? record.input : "";
        const voice = typeof record.voice === "string" ? record.voice.trim() : "";

        const result = await prepareQueue(input, voice);
        return Response.json(result, { status: result.ok ? 200 : 400 });
      },
    },
  },
});
