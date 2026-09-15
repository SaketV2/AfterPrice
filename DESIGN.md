# AfterPrice design system

Ground truth for the shipped AfterPrice website and authenticated Supabase-backed app. This document describes the visual and content rules present in the code.

## Purpose and mode

AfterPrice is a post-purchase monitoring instrument. Its organising sequence is **baseline -> change -> evidence -> deadline -> action -> resolution**. The interface should make the original state, what moved, where the signal came from, how long it matters and what to do next legible in one record.

The app supports authenticated purchase and subscription entry, real private persistence, shared catalogue search and supported or clearly unavailable monitoring sources. It must not present itself as a budgeting tool, bank dashboard, coupon site, price-comparison site or fully automated claims service.

The visual mode is warm paper and white editorial surfaces for public routes, with concentrated graphite surfaces for product previews, evidence and capability boundaries. The shipped product ledger is a light ledger. The global theme provider exposes light, dark and system values and `app/globals.css` defines dark aliases, but `ProductShell` injects a light-oriented inline token map; treat dark mode as a declared compatibility layer rather than a separate fully specified product theme.

## Brand mark and type roles

AfterPrice uses one shared two-stroke mark in `components/shared/logo.tsx` and `app/icon.svg`: two rounded diagonal strokes suggesting an abstract A and a continuing price trail. Marketing, auth and product surfaces use that same geometry. Instrument Serif is loaded through `next/font/google` as the editorial display face; the existing local Instrument Sans remains the body, navigation, controls and dense-record face.

## Colour roles and tokens

The product shell's runtime tokens in `components/dashboard/product-ui.tsx` are the most specific product palette:

| Role | Light token | Use |
| --- | --- | --- |
| Canvas | `#f6f6f3` | Warm paper background |
| Surface | `#ffffff` | Panels, cards, controls |
| Subtle surface | `#eff2f4` | Quiet fills, inactive navigation, evidence tiles |
| Cool surface | `#e5edf0` | Supporting callouts |
| Ink / dark surface | `#101820` | Primary text, active navigation, dark panels |
| Secondary / muted text | `#55616c` / `#77838d` | Supporting copy and metadata |
| Border | `#dce2e6` | Dividers and control outlines |
| Accent | `#3258d4` | Primary action, links, focus and active controls; hover `#2448bd`; soft `#e6ecff` |
| Signal | `#b8d95b` | Positive attention and logo signal; soft `#eef6d5` |
| Success | `#20744f` / `#e3f3e9` | Price drops, resolved and confirmed outcomes |
| Warning | `#9b5d12` / `#fff0d4` | Price increases, plan changes and due-soon context |
| Danger | `#b34343` / `#fbe5e5` | Active change pressure and destructive/error feedback |

The public marketing implementation uses explicit values around the same language: ink `#0c0f14`, dark canvas `#0c1016` or `#101a2a`, dark panel `#131922`, raised dark surface `#1a2230`, dark borders `#283241` and `#3b485b`, cobalt signals `#5967e8`, `#6875f5` and `#8792ff`, and lime signal `#a9f053`. Marketing status fills are pale green `#e1f3ea`, amber `#fff0d6` and red `#fce5e5`.

Global semantic HSL variables in `app/globals.css` provide light and dark aliases, including `--background`, `--surface`, `--foreground`, `--border`, `--cobalt`, `--signal-lime`, `--success`, `--warning`, `--danger` and their soft variants. Existing components also use backwards-compatible aliases such as `--accent`. Do not assume the hard-coded marketing colours and product inline tokens are interchangeable.

## Typography

- Marketing H1/H2 treatments, the AfterPrice wordmark and selected large product headings use `Instrument Serif`, falling back to Georgia/serif.
- Body copy, navigation, controls, forms and dense product records use the existing local `Instrument Sans` variable font.
- Headings are tight and editorial, generally with negative tracking from roughly `-0.02em` to `-0.065em`, and line-height around `0.94` to `1.05`.
- Body text is plain and readable: 16px with 1.5 line-height globally, with marketing descriptions commonly 16 to 20px and 28 to 32px line-height; product supporting text is commonly 14 to 16px and 24px line-height.
- Eyebrows, navigation section labels and metadata use 10 to 11px bold uppercase text with wide tracking, usually `0.12em` to `0.18em`.
- Prices, dates, counts and other changing values use tabular numerals. Rail and timeline indices use a monospace stack.

## Spacing, radius and shadow language

Spacing is generous on marketing sections and compact inside records. The recurring layout rhythm is 20px mobile horizontal padding, 32px at small widths and 40px or 48px on large product layouts. Marketing content is usually capped at 1280px; the product area is capped at 1440px after a 256px desktop sidebar. Panels commonly use 20px or 24px padding, with 12px to 20px internal gaps.

The shared radius vocabulary is major `24px`, dashboard `18px`, card `14px`, input `10px` and pill `999px`. Shipped classes add the same grammar through `rounded-xl` and `rounded-2xl`: 12px controls and nav items, 16px product panels, and 20px to 28px marketing hero and inspection surfaces. Pills are reserved for statuses, filters and compact labels.

Elevation is restrained. Use thin borders and surface contrast first, then soft shadows such as `0 10px 28px` for cards, `0 16px 38px` for raised surfaces and a cobalt focus ring. Marketing dark previews use a stronger `0 18px 42px` shadow; active rail nodes use a smaller black lift. Avoid decorative gradients and excessive floating-card treatment.

## Component grammar

Marketing pages use a sticky shared wordmark header, uppercase eyebrow, oversized serif heading, concise supporting copy and a clear action pair. Content uses warm paper, white divider bands and dark evidence or capability surfaces. Flat records, tables and timelines rely on borders and dividers rather than repeated card grids. The homepage and `/how-it-works` use the AfterPrice Trail to tell the lifecycle from baseline through resolution.

Product pages use a 256px desktop sidebar, sticky context header, page intro, bordered white panels and a decision-ledger row. A standard record keeps:

1. title, provider/source and type/state badges;
2. baseline beside current value;
3. change label and plain-language consequence;
4. evidence, deadline and money tiles;
5. one next action, with open-record and resolution controls.

Buttons are compact, semibold and at least 40 to 48px high. Primary actions use dark ink in marketing and cobalt in the product shell. Secondary actions are white or outlined. Icons are Lucide line icons, normally 14 to 19px, and decorative icons are hidden from assistive technology. Status badges are rounded pills with a dot or icon plus a text label, never colour alone.

## Change Rail and lifecycle motion

The marketing Change Rail is a dark `#101a2a` panel with a lime section label, a demo-sequence pill and a dark map. Its SVG track is a thick graphite shadow with a dashed lime path. Four keyboard-operable nodes represent Purchase, Change detected, Deadline and Action. The selected node gets a lime border, raised position and darker raised fill; the readout below exposes the selected state and explanation.

The rail map is at least 390px tall on desktop and 420px on mobile. There is no continuous decorative drift. Node, feed-record and header transitions are about 180ms; one-time progression and reveal motion uses roughly 450–550ms.

The lifecycle section pairs a scrolling seven-stage list with a dark sticky state panel. A scroll-position observer changes the active stage as each list item enters the reading window; the panel is `aria-live="polite"`, shows the current value and marks the active list item with `aria-current="step"` and an `In view` label. The timeline uses a 1px rule and numbered circular markers. On mobile the state panel is no longer sticky and the Change Rail SVG is replaced by a readable stacked sequence.

All of these effects are subordinate to comprehension. `prefers-reduced-motion: reduce` removes movement and smooth scrolling rather than merely slowing it.

## Product ledger states

The presentation layer derives one decision-ledger row per tracked item and sorts rows by state, then priority, then updated time. The state groups are:

| State | Meaning | Tone |
| --- | --- | --- |
| Action required | An actionable stored change is pinned first for review | Danger |
| Changes | An active price, plan or renewal difference needs review | Danger |
| Due soon | A claim or renewal deadline is within 14 days | Warning |
| Watching | The baseline is active and no action is due | Accent |
| Resolved | The item or all of its alerts are resolved or dismissed | Success |

Change types are price drop, price increase, plan change, renewal warning and watching/no change. A row distinguishes potential money from confirmed money, labels evidence as captured or unavailable, and uses one supported next action such as `Review current source`, `Review updated plan`, `Review before renewal`, `View item` or `View history`. A lower current price is an opportunity to review, not proof of a refund.

Empty states use a small reusable lifecycle illustration made from semantic CSS/SVG primitives: baseline → later observation → difference, followed by the real CTA. No sample records are inserted into authenticated accounts.

## Responsive rules

- Tailwind breakpoints are the practical layout contract: `sm` 640px, `md` 768px, `lg` 1024px and `xl` 1280px.
- Marketing navigation is desktop-only from `lg`; below it, the 44px menu opens a modal-style drawer. Hero and content grids collapse to one column, and action groups wrap.
- The product sidebar is visible from `lg` at 256px wide. Below `lg`, navigation becomes a 288px drawer with a scrim; the header keeps a menu control, context title and compact actions.
- Product content uses 20px, 32px and 48px horizontal gutters as width increases. Multi-column panels collapse at smaller widths, and actions stack when needed.
- Ledger baseline/current comparisons become a vertical flow on narrow screens. Wide comparison tables may scroll horizontally inside their bounded panel.
- Avoid horizontal page overflow. The marketing rail, timeline and product records must remain usable with touch targets and wrapped content on mobile.

## Accessibility and content rules

- Preserve semantic headings, landmarks, labelled navigation, table captions and scoped table headers. Interactive rail nodes and filters expose pressed state; tabs expose selected state; accordions expose expanded state and controls.
- Every rendered route exposes exactly one static `main#main-content` target with `tabIndex={-1}`; the skip link never depends on hydration or DOM mutation. Maintain the global visible cobalt focus treatment: a 3px outline with 3px offset and focus ring. Interactive controls generally have a minimum height of 40px, with primary controls commonly 44 to 48px.
- Use `aria-live="polite"` for changing selected detail, `aria-current="step"` for the active lifecycle stage and clear labels for icon-only controls. Mobile marketing navigation returns focus to its trigger on Escape; product navigation closes on Escape.
- Write in concrete, specific language. Use AfterPrice consistently and prefer the sequence baseline, change, evidence, deadline, action, resolution.
- Label public illustrative content as sample or demo data. Say when a check is manual or unavailable. Do not imply retailer access, bank connection, automatic claims, guaranteed refunds, live monitoring or confirmed recovery when the implementation does not provide it.
- Keep potential amounts labelled as potential until a real outcome is recorded. Use Australian English, AUD formatting and `en-AU` date conventions. Give the user one realistic next action: review, claim, keep, change or dismiss.

## Source files

Grounded in `PRODUCT.md`, `app/globals.css`, `app/layout.tsx`, `app/icon.svg`, `app/not-found.tsx`, `app/robots.ts`, `app/sitemap.ts`, `app/(marketing)/page.tsx`, `components/shared/logo.tsx`, `components/marketing/marketing.module.css`, `components/marketing/product-preview.tsx`, `components/marketing/marketing-ui.tsx`, `components/marketing/marketing-shell.tsx`, `components/dashboard/ledger.tsx`, `components/dashboard/product-ui.tsx`, `components/dashboard/tracked-item-detail.tsx`, `components/shared/empty-state.tsx`, `features/afterprice/queries.ts`, `server/catalogue`, `server/monitoring` and `lib/theme/theme-provider.tsx`.
