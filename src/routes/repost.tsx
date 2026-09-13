import { createFileRoute } from "@tanstack/react-router";
import { ActionWorkspace } from "@/components/action-workspace";
import { AppFrame } from "@/components/app-frame";

export const Route = createFileRoute("/repost")({ component: RepostPage });

function RepostPage() {
  return (
    <AppFrame>
      <ActionWorkspace mode="repost" />
    </AppFrame>
  );
}
