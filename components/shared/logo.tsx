import Link from "next/link";
import { cn } from "@/lib/design/cn";

type BrandMarkProps = {
  className?: string;
  title?: string;
  decorative?: boolean;
};

export function BrandMark({ className, title = "AfterPrice", decorative = false }: BrandMarkProps) {
  return (
    <svg aria-hidden={decorative} aria-label={decorative ? undefined : title} className={cn("h-9 w-9", className)} fill="none" focusable="false" role={decorative ? undefined : "img"} viewBox="0 0 36 36">
      <path d="M7 29 20 7" stroke="currentColor" strokeLinecap="round" strokeWidth="8" />
      <path d="m19 29 10-16" stroke="currentColor" strokeLinecap="round" strokeWidth="8" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={cn("font-editorial text-[1.45rem] leading-none tracking-[-0.045em]", className)}>AfterPrice</span>;
}

export function Logo({ href = "/", className, label = true }: { href?: string; className?: string; label?: boolean }) {
  return (
    <Link aria-label="AfterPrice home" className={cn("inline-flex min-h-11 items-center gap-2.5 text-foreground", className)} href={href}>
      <BrandMark className="h-8 w-8" decorative />
      {label ? <Wordmark /> : null}
    </Link>
  );
}
