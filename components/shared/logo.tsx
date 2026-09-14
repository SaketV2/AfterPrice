import Link from "next/link";
import { cn } from "@/lib/design/cn";

type BrandMarkProps = {
  className?: string;
  title?: string;
  decorative?: boolean;
};

export function BrandMark({ className, title = "AfterPrice", decorative = false }: BrandMarkProps) {
  return (
    <svg aria-hidden={decorative} aria-label={decorative ? undefined : title} className={cn("h-9 w-9", className)} fill="none" focusable="false" role={decorative ? undefined : "img"} viewBox="0 0 40 40">
      <path d="M20 3.75a16.25 16.25 0 1 0 12.95 26.08" stroke="hsl(var(--cobalt))" strokeLinecap="round" strokeWidth="3.25" />
      <path d="M32.95 16.15v14.2H18.7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.25" />
      <path d="m12.6 19.7 5.1 5.15 8.65-10.2" stroke="hsl(var(--signal-lime-ink))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" />
      <circle cx="32.95" cy="16.15" fill="hsl(var(--signal-lime-ink))" r="2.3" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={cn("font-display text-lg font-extrabold tracking-[-0.045em]", className)}>AfterPrice</span>;
}

export function Logo({ href = "/", className, label = true }: { href?: string; className?: string; label?: boolean }) {
  return (
    <Link aria-label="AfterPrice home" className={cn("inline-flex min-h-11 items-center gap-2.5 text-foreground", className)} href={href}>
      <BrandMark className="h-8 w-8" decorative />
      {label ? <Wordmark /> : null}
    </Link>
  );
}
