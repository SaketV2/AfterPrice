import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider, type Theme } from "@/lib/theme";
import { createClient } from "@/lib/supabase/server";

const instrumentSans = localFont({
  src: "./fonts/InstrumentSans-Variable.ttf",
  variable: "--font-instrument-sans",
  display: "swap",
  weight: "400 700",
  fallback: ["Segoe UI", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "AfterPrice | Stop losing money after you buy",
    template: "%s | AfterPrice",
  },
  description:
    "Track a purchase or subscription once. Get alerted when the price drops, the plan changes or the next renewal becomes more expensive, with the evidence and deadline you need to act.",
  applicationName: "AfterPrice",
  openGraph: {
    title: "AfterPrice | Stop losing money after you buy",
    description:
      "Track a purchase or subscription once. Get alerted when the price drops, the plan changes or the next renewal becomes more expensive, with the evidence and deadline you need to act.",
    type: "website",
  },
};

const designContract = `<!--
  THESIS: AfterPrice makes change after purchase legible through baseline, change, evidence, deadline, action and resolution, refusing a generic finance dashboard.
  OWN-WORLD: Warm light neutrals, graphite product surfaces, cobalt controls, signal-lime opportunities and restrained instrument-like UI.
  STORY: A visitor sees what they originally paid, what moved, what evidence exists and the next realistic action.
  FIRST VIEWPORT: Public routes pair the factual promise with a monitor surface and demo action; app routes foreground impact, alerts, evidence and deadlines.
  FORM: Editorial monitoring instrument, committed from the supplied AfterPrice redesign brief; direction seed 87bf7606.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  let defaultTheme: Theme = "system";
  if (typeof claims?.claims?.sub === "string") {
    const { data: preferences } = await supabase.from("user_preferences").select("theme").eq("user_id", claims.claims.sub).maybeSingle();
    if (preferences?.theme === "light" || preferences?.theme === "dark" || preferences?.theme === "system") defaultTheme = preferences.theme;
  }
  return (
    <html lang="en-AU" className={instrumentSans.variable} suppressHydrationWarning>
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <div aria-hidden="true" hidden dangerouslySetInnerHTML={{ __html: designContract }} />
        <ThemeProvider defaultTheme={defaultTheme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
