import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/design/cn";

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: { icon?: LucideIcon; title: string; description: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-64 flex-col items-center justify-center rounded-dashboard border border-dashed bg-surface px-6 py-12 text-center", className)}>
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-foreground-secondary">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
