"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/design/cn";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onOpenChange]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default bg-foreground/45 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
        type="button"
      />
      {children}
    </div>,
    document.body,
  );
}

export const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      aria-modal="true"
      className={cn("relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-dashboard border bg-surface p-6 text-foreground shadow-soft", className)}
      role="dialog"
      {...props}
    >
      {children}
    </div>
  ),
);
DialogContent.displayName = "DialogContent";

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-5 flex flex-col gap-1.5", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-xl font-bold", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6 text-foreground-secondary", className)} {...props} />;
}

export function DialogClose({ onClick, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label="Close dialog"
      className={cn("absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-input text-foreground-secondary hover:bg-surface-subtle hover:text-foreground", className)}
      onClick={onClick}
      type="button"
      {...props}
    >
      <X aria-hidden className="h-4 w-4" />
    </button>
  );
}
