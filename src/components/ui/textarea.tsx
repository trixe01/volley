import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-border bg-bg-elevated px-3 py-3 text-sm text-fg",
        "placeholder:text-fg-subtle",
        "transition-[border-color] duration-150",
        "focus-visible:border-accent focus-visible:outline-none",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
