import { createFileRoute } from "@tanstack/react-router";
import { ActionWorkspace } from "@/components/action-workspace";
import { AppFrame } from "@/components/app-frame";

export const Route = createFileRoute("/like")({ component: LikePage });

function LikePage() {
  return (
    <AppFrame>
      <ActionWorkspace mode="like" />
    </AppFrame>
  );
}
