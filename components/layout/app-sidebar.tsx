"use client";

import Link from "next/link";
import { BellRing, House, Plus, Settings, ShoppingBag, Sparkles, WalletCards, X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/design/cn";

const navItems = [
  { href: "/app", label: "Overview", icon: House },
  { href: "/app/purchases", label: "Purchases", icon: ShoppingBag },
  { href: "/app/subscriptions", label: "Subscriptions", icon: WalletCards },
  { href: "/app/alerts", label: "Alerts", icon: BellRing },
];

type AppSidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

export function AppSidebar({ open = true, onClose }: AppSidebarProps) {
  return (
    <>
      {open && onClose ? <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={onClose} type="button" /> : null}
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r bg-surface px-4 py-5 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between px-2">
          <Logo />
          {onClose ? <button aria-label="Close navigation" className="inline-flex h-10 w-10 items-center justify-center rounded-input text-foreground-secondary hover:bg-surface-subtle lg:hidden" onClick={onClose} type="button"><X aria-hidden className="h-5 w-5" /></button> : null}
        </div>
        <div className="mt-10 flex flex-1 flex-col">
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground-muted">Monitor</p>
          <nav aria-label="App navigation" className="mt-3 flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link className="group flex min-h-11 items-center gap-3 rounded-input px-3 text-sm font-semibold text-foreground-secondary transition-colors hover:bg-surface-subtle hover:text-foreground" href={href} key={href} onClick={onClose}>
                <Icon aria-hidden className="h-[18px] w-[18px] text-foreground-muted transition-colors group-hover:text-accent" />
                {label}
              </Link>
            ))}
          </nav>
          <p className="mt-9 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground-muted">Actions</p>
          <nav aria-label="App actions" className="mt-3 flex flex-col gap-1">
            <Link className="group flex min-h-11 items-center gap-3 rounded-input px-3 text-sm font-semibold text-foreground-secondary transition-colors hover:bg-surface-subtle hover:text-foreground" href="/app/add" onClick={onClose}>
              <Plus aria-hidden className="h-[18px] w-[18px] text-foreground-muted transition-colors group-hover:text-accent" />
              Add item
            </Link>
            <Link className="group flex min-h-11 items-center gap-3 rounded-input px-3 text-sm font-semibold text-foreground-secondary transition-colors hover:bg-surface-subtle hover:text-foreground" href="/app/settings" onClick={onClose}>
              <Settings aria-hidden className="h-[18px] w-[18px] text-foreground-muted transition-colors group-hover:text-accent" />
              Settings
            </Link>
          </nav>
          <div className="mt-auto rounded-dashboard bg-surface-cool p-4">
            <div className="flex items-center gap-2 text-sm font-bold"><Sparkles aria-hidden className="h-4 w-4 text-accent" />Watch closely</div>
            <p className="mt-2 text-xs leading-5 text-foreground-secondary">Review every change before it costs you more.</p>
            <Link className="mt-3 inline-flex text-xs font-bold text-accent hover:underline" href="/app/add">Track an item <span aria-hidden className="ml-1">→</span></Link>
          </div>
        </div>
      </aside>
    </>
  );
}
