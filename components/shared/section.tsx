import * as React from "react";
import { cn } from "@/lib/design/cn";

export function Container({ className, size = "marketing", ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: "marketing" | "app" | "narrow" }) {
  const sizes = {
    marketing: "max-w-[1280px]",
    app: "max-w-[1440px]",
    narrow: "max-w-3xl",
  };
  return <div className={cn("mx-auto w-full px-5 sm:px-8 lg:px-10", sizes[size], className)} {...props} />;
}

export function Section({ className, tone = "plain", ...props }: React.HTMLAttributes<HTMLElement> & { tone?: "plain" | "subtle" | "dark" | "cool" }) {
  const tones = {
    plain: "bg-background",
    subtle: "bg-surface-subtle",
    dark: "bg-surface-dark text-white",
    cool: "bg-surface-cool",
  };
  return <section className={cn("py-20 sm:py-24 lg:py-32", tones[tone], className)} {...props} />;
}

export function SectionHeading({ className, title, description, align = "left" }: { className?: string; title: React.ReactNode; description?: React.ReactNode; align?: "left" | "center" }) {
  return (
    <div className={cn("flex max-w-2xl flex-col gap-4", align === "center" && "mx-auto items-center text-center", className)}>
      <h2 className="text-3xl font-extrabold leading-[1.06] sm:text-4xl lg:text-5xl">{title}</h2>
      {description ? <p className="prose-measure text-base leading-7 text-foreground-secondary sm:text-lg">{description}</p> : null}
    </div>
  );
}
