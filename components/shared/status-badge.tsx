import { AlertCircle, ArrowDownRight, ArrowUpRight, BellRing, Check, Clock3, Sparkles, type LucideIcon } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

export type SpendGuardStatus = "monitoring" | "price-drop" | "price-increase" | "plan-change" | "renewal" | "resolved" | "needs-review";

const statusMeta: Record<SpendGuardStatus, { label: string; variant: BadgeVariant; icon: LucideIcon }> = {
  monitoring: { label: "Monitoring", variant: "neutral", icon: Clock3 },
  "price-drop": { label: "Price drop", variant: "success", icon: ArrowDownRight },
  "price-increase": { label: "Price increase", variant: "danger", icon: ArrowUpRight },
  "plan-change": { label: "Plan changed", variant: "warning", icon: Sparkles },
  renewal: { label: "Renewal soon", variant: "accent", icon: BellRing },
  resolved: { label: "Resolved", variant: "success", icon: Check },
  "needs-review": { label: "Needs review", variant: "warning", icon: AlertCircle },
};

export function StatusBadge({ status, className }: { status: SpendGuardStatus; className?: string }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;
  return (
    <Badge className={className} variant={meta.variant}>
      <Icon aria-hidden className="h-3.5 w-3.5" />
      {meta.label}
    </Badge>
  );
}
