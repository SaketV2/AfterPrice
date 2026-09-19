import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: {
    default: "AfterPrice | Keep what changed after checkout",
    template: "%s | AfterPrice",
  },
  description:
    "Keep the original price, later changes, evidence and timing together after you buy or subscribe.",
  applicationName: "AfterPrice",
  openGraph: {
    title: "AfterPrice | Keep what changed after checkout",
    description:
      "Keep the original price, later changes, evidence and timing together after you buy or subscribe.",
    type: "website",
  },
};

const designContract = `<!--
  THESIS: AfterPrice makes change after purchase legible through baseline, change, evidence, deadline, action and resolution, refusing a generic finance dashboard.
  OWN-WORLD: Warm paper, receipt-white marketing surfaces, deep moss actions, and a neutral graphite app with cobalt interaction, amber warnings, green success, muted red destructive states, blue information, and ledger rules.
  STORY: A visitor sees what they originally paid, what moved, what evidence exists and the next realistic action.
  FIRST VIEWPORT: Public routes pair a plain post-checkout promise with a tangible price-change record; app routes foreground impact, evidence and deadlines.
  FORM: Paper trail after checkout, assigned direction 4 of the grounded list; direction seed b046054d.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <body>
        <div aria-hidden="true" hidden dangerouslySetInnerHTML={{ __html: designContract }} />
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ThemeProvider defaultTheme="system">{children}</ThemeProvider>
      </body>
    </html>
  );
}
