import { createFileRoute } from "@tanstack/react-router";
import { ActionWorkspace } from "@/components/action-workspace";
import { AppFrame } from "@/components/app-frame";

export const Route = createFileRoute("/reply")({ component: ReplyPage });

function ReplyPage() {
  return (
    <AppFrame>
      <ActionWorkspace mode="reply" />
    </AppFrame>
  );
}
