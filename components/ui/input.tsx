import * as React from "react";
import { cn } from "@/lib/design/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-input border bg-surface px-3.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none disabled:bg-surface-subtle disabled:opacity-60",
      error && "border-danger focus-visible:border-danger",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
