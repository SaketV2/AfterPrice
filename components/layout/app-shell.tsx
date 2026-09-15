"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/design/cn";

export function AppShell({ children, className }: { children: React.ReactNode; className?: string }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <AppSidebar onClose={() => setSidebarOpen(false)} open={sidebarOpen} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-5 backdrop-blur-sm lg:hidden">
          <button aria-label="Open navigation" className="inline-flex h-11 w-11 items-center justify-center rounded-input text-foreground-secondary hover:bg-surface-subtle" onClick={() => setSidebarOpen(true)} type="button"><Menu aria-hidden className="h-5 w-5" /></button>
          <Logo className="absolute left-1/2 -translate-x-1/2" />
          <ThemeToggle />
        </header>
        <main id="main-content" tabIndex={-1} className={cn("mx-auto min-h-[calc(100vh-4rem)] w-full max-w-[1440px] px-5 py-8 outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-8 lg:px-10 lg:py-10", className)}>{children}</main>
      </div>
    </div>
  );
}
