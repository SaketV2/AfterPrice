import * as React from "react";
import { cn } from "@/lib/design/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, error, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-11 w-full appearance-none rounded-input border bg-surface px-3.5 text-sm text-foreground shadow-sm transition-colors focus-visible:border-accent focus-visible:outline-none disabled:bg-surface-subtle disabled:opacity-60",
      error && "border-danger focus-visible:border-danger",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
