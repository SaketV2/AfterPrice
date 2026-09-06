import * as React from "react";
import { cn } from "@/lib/design/cn";

export type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "danger" | "dark";

const styles: Record<BadgeVariant, string> = {
  neutral: "bg-surface-subtle text-foreground-secondary",
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  dark: "bg-surface-dark text-white",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none", styles[variant], className)}
      {...props}
    />
  );
}
