import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/design/cn";
import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  supporting?: React.ReactNode;
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function StatCard({ label, value, supporting, trend, trendLabel, icon, className }: StatCardProps) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  return (
    <Card className={cn("flex min-h-36 flex-col justify-between p-5 shadow-none", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-foreground-secondary">{label}</p>
        {icon ? <span className="text-accent">{icon}</span> : null}
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-3xl font-extrabold tracking-[-0.04em]">{value}</p>
          {supporting ? <p className="mt-1 text-xs text-foreground-muted">{supporting}</p> : null}
        </div>
        {trend && trendLabel ? (
          <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", trend === "down" ? "text-success" : trend === "up" ? "text-danger" : "text-foreground-muted")}>
            <TrendIcon aria-hidden className="h-3.5 w-3.5" />
            {trendLabel}
          </span>
        ) : null}
      </div>
    </Card>
  );
}
