"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import * as React from "react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/design/cn";

const defaultLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/resources", label: "Resources" },
];

export function MarketingHeader({ links = defaultLinks, className }: { links?: Array<{ href: string; label: string }>; className?: string }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={cn("relative z-40 w-full", className)}>
      <div className="mx-auto flex min-h-20 max-w-[1280px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
        <Logo />
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link className="text-sm font-semibold text-foreground-secondary transition-colors hover:text-foreground" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Link className="inline-flex h-11 items-center rounded-input px-4 text-sm font-semibold text-foreground-secondary transition-colors hover:bg-surface-subtle hover:text-foreground" href="/login">
            Log in
          </Link>
          <Link className="hidden h-11 items-center rounded-input border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-subtle xl:inline-flex" href="/signup">
            Get started
          </Link>
          <Link className="inline-flex h-11 items-center rounded-input bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover" href="/demo">
            Try demo
          </Link>
        </div>
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} className="inline-flex h-11 w-11 items-center justify-center rounded-input text-foreground hover:bg-surface-subtle" onClick={() => setOpen((current) => !current)} type="button">
            {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="absolute inset-x-0 top-full border-b bg-background px-5 py-5 shadow-soft lg:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {links.map((link) => (
              <Link className="rounded-input px-3 py-3 text-base font-semibold text-foreground-secondary hover:bg-surface-subtle hover:text-foreground" href={link.href} key={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-4">
              <Link className="inline-flex h-11 items-center justify-center rounded-input border text-sm font-semibold" href="/login" onClick={() => setOpen(false)}>Log in</Link>
              <Link className="inline-flex h-11 items-center justify-center rounded-input bg-accent text-sm font-semibold text-white" href="/demo" onClick={() => setOpen(false)}>Try demo</Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export { MarketingHeader as SiteHeader };
