import * as React from "react";
import { cn } from "@/lib/design/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background shadow-sm hover:bg-foreground/90 dark:bg-accent dark:text-surface dark:hover:bg-accent-hover",
  secondary:
    "bg-accent text-white shadow-sm hover:bg-accent-hover dark:text-surface",
  outline:
    "border border-border bg-surface text-foreground hover:bg-surface-subtle",
  ghost:
    "bg-transparent text-foreground-secondary hover:bg-surface-subtle hover:text-foreground",
  danger: "bg-danger text-white shadow-sm hover:bg-danger/90",
  link: "bg-transparent px-0 text-accent underline-offset-4 hover:underline",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 rounded-input px-3 text-sm",
  md: "h-11 rounded-input px-5 text-sm",
  lg: "h-12 rounded-input px-6 text-base",
  icon: "h-11 w-11 rounded-input p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors duration-200 ease-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-45",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
