import { cn } from "@/lib/utils";

export function VolleyMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-6", className)}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.5 18.5c3.2-7 13.8-7 17 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 12.5c4.4 2.2 9.6 2.2 14 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "hero";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-display italic font-medium tracking-tight text-fg",
        size === "sm" && "text-xl leading-none",
        size === "md" && "text-2xl leading-none",
        size === "hero" && "text-6xl leading-none sm:text-8xl",
        className,
      )}
    >
      Volley
    </span>
  );
}
