import { cn } from "@/lib/design/cn";

export function Metric({ label, value, helper, tone = "default", className }: { label: string; value: React.ReactNode; helper?: React.ReactNode; tone?: "default" | "positive" | "negative" | "warning"; className?: string }) {
  const tones = {
    default: "text-foreground",
    positive: "text-success",
    negative: "text-danger",
    warning: "text-warning",
  };
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground-muted">{label}</p>
      <p className={cn("mt-1 font-display text-2xl font-extrabold tracking-[-0.04em]", tones[tone])}>{value}</p>
      {helper ? <p className="mt-1 text-xs text-foreground-secondary">{helper}</p> : null}
    </div>
  );
}
