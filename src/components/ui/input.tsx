import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-border bg-bg-elevated px-3 text-sm text-fg",
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
