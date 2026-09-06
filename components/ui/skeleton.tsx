import { cn } from "@/lib/design/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("animate-pulse rounded-card bg-surface-subtle", className)} {...props} />;
}
