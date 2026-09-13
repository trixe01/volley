import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-[color,background-color,border-color,opacity,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:opacity-90",
        outline: "border border-border bg-transparent text-fg hover:border-border-strong hover:bg-bg-muted",
        ghost: "text-fg-muted hover:bg-bg-muted hover:text-fg",
        danger: "border border-border text-danger hover:bg-bg-muted",
      },
      size: {
        md: "h-11 min-h-11 px-4",
        sm: "h-9 min-h-9 px-3 text-sm",
        lg: "h-12 min-h-12 px-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
