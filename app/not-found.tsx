import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export const metadata = {
  title: "Page not found",
  description: "The AfterPrice page you were looking for does not exist.",
};

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1280px] flex-col">
        <Logo />
        <div className="flex flex-1 items-center py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--success))]">AfterPrice / 404</p>
            <h1 className="mt-5 text-6xl leading-[0.98] tracking-[-0.035em] sm:text-8xl">Page not found</h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[hsl(var(--foreground-secondary))]">That page is not part of the record. Return to AfterPrice or see the illustrative product demo.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[hsl(var(--surface-dark))] px-5 py-3 text-sm font-semibold text-[hsl(var(--foreground-on-dark))] transition-colors hover:bg-[hsl(var(--surface-dark-raised))]">Back to AfterPrice <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
              <Link href="/demo" className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-[hsl(var(--success))] hover:text-[hsl(var(--success))]">View product demo</Link>
            </div>
          </div>
        </div>
        <p className="border-t border-border pt-5 text-sm text-[hsl(var(--foreground-muted))]">Baseline → change → evidence → action.</p>
      </div>
    </main>
  );
}
