import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: {
    default: "SpendGuard | Stop losing money after you buy",
    template: "%s | SpendGuard",
  },
  description:
    "SpendGuard watches purchases, subscriptions and renewals so you can catch price drops, plan changes and costly renewals.",
  applicationName: "SpendGuard",
  openGraph: {
    title: "SpendGuard | Stop losing money after you buy",
    description:
      "A personal money watchdog for price drops, plan changes and upcoming renewals.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <body>
        {/*
          THESIS: SpendGuard makes the quiet cost change visible, refusing the generic SaaS hero that hides the mechanism.
          OWN-WORLD: Cool paper ground, ink typography, indigo signal, powder-blue comparison and dark watchtower panels.
          STORY: A visitor sees a monitored item, understands its financial consequence, and acts on the next clear step.
          FIRST VIEWPORT: Public routes place the large product promise beside an immediate monitor surface and a Try the demo action; app routes foreground impact and alerts.
          FORM: Quiet watchtower editorial ledger, committed from the written reference synthesis; concept-seed was blocked by the missing root PRODUCT.md interview in this worker context.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
        */}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
