import * as React from "react";
import { cn } from "@/lib/design/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-28 w-full resize-y rounded-input border bg-surface px-3.5 py-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none disabled:bg-surface-subtle disabled:opacity-60",
      error && "border-danger focus-visible:border-danger",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
