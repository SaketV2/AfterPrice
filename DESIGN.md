# AfterPrice design system

Ground truth for the shipped AfterPrice marketing website and authenticated Supabase-backed app.

## Product point of view

AfterPrice is a post-purchase record, not a budgeting dashboard or a fully automated claims service. Its organising sequence is **baseline → change → evidence → deadline → action → resolution**. Every record should make the original state, what moved, where the signal came from, how long it matters and what to review next legible together.

Public routes use a warm paper trail with quiet white receipt surfaces. The authenticated app uses the same light ledger language, with a graphite compatibility theme available through the existing theme provider. Product previews may use deep moss as a focused evidence surface; there is no large blue-black marketing canvas.

## Brand mark and typography

AfterPrice uses the shared two-stroke mark in `components/shared/logo.tsx` and `app/icon.svg`, suggesting an abstract A and a continuing price trail. Marketing, auth and product surfaces use the same geometry.

The shipped type stack is native and dependency-free:

```css
ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Use the system sans stack for headings, body copy, navigation, controls and dense records. Use a small monospace stack only for dates, sequence labels, statuses and other ledger metadata. Headings are bold and compact, but tracking should remain readable (normally no tighter than `-0.04em`). Prices and dates use tabular numerals.

## Colour roles

| Role | Token | Use |
| --- | --- | --- |
| Paper | `#F4F0E7` | Main marketing and app canvas |
| Paper raised | `#FFFDF8` | Receipt surfaces, cards and readable bands |
| Ink | `#181A16` | Primary text and high-contrast content |
| Muted ink | `#66685F` | Supporting copy and metadata |
| Sage | `#DDEADF` | Calm change context, empty states and CTA panels |
| Moss | `#294A3A` | Primary action, active controls and focused product surfaces |
| Saffron | `#D7A942` | Positive signal, sequence marker and attention cue |
| Coral | `#C96551` | Manual review pressure, warnings and potential downside |
| Line | `#D8D1C4` | Dividers, receipt rules and control borders |

These roles are defined in the marketing module and mapped into the global semantic HSL aliases for the authenticated app. Use contrast and text labels in addition to colour; potential money is never presented as confirmed recovery.

## Layout and component grammar

Marketing pages use a shared wordmark header, short monospace section marker, concrete copy, an illustrative record and one clear next action. Content is capped at about 1280px. The homepage demonstrates one Sony WH-1000XM6 example early: `$349` paid, `$299` observed, `$50` potential difference, Sony Store source and four days to review the retailer policy. It is explicitly sample data.

The public site uses authored geometry instead of unrelated stock or competitor imagery: receipt sheets, product glyphs, evidence rules, a change rail, a lifecycle timeline and compact ledger rows. Large sections alternate paper, raised white and sage; deep moss is reserved for a practical product counterpart and focused preview.

Flat records prefer rules and aligned values over repeated floating cards. A change row keeps its type, provider, identity, before/after value, evidence state and next action together. Buttons are compact, semibold and at least 40–48px high. Primary actions use moss; secondary actions use raised paper and a line. Status pills are reserved for filters and meaningful states, and icons are decorative unless they have an accessible label.

The authenticated product remains data-first. Its dashboard sorts actionable changes ahead of watching records, shows baseline beside current values, distinguishes evidence availability, and gives one useful next action. Supabase auth, schemas, RLS, routes and data behaviour are preserved. Empty states explain the record lifecycle without inserting sample records into a user account.

## Interaction and accessibility

- Preserve one `main#main-content` landmark per route and a hydration-independent skip link.
- Navigation, filters, lifecycle stages and accordions expose their selected, pressed, current or expanded state.
- Mobile marketing navigation opens as a modal drawer and returns focus to its trigger on Escape.
- Keep touch targets at least 40px high; wrap action groups and avoid horizontal overflow.
- Use `aria-live="polite"` for selected change detail and `aria-current="step"` for the active lifecycle stage.
- Respect `prefers-reduced-motion` by removing movement and smooth scrolling.

## Responsive contract

The marketing header collapses below `lg`. Hero, record, coverage, FAQ and CTA layouts collapse to one column on narrow screens. The final CTA places its action to the right and vertically centres it on desktop, then stacks it full-width on mobile. Dashboard navigation and comparison panels similarly collapse below `lg`, with evidence and baseline/current values remaining readable without horizontal page overflow.

## Content truth

Use concrete Australian English and `en-AU` date conventions. Say when a record or source is illustrative, manual or unavailable. AfterPrice does not connect to a bank, submit claims, guarantee refunds, cancel subscriptions or process payments in V1. A lower price is a prompt to review terms, not proof of a refund. Keep potential amounts labelled until the user records an outcome.

## Source files

Grounded in `PRODUCT.md`, `app/globals.css`, `app/layout.tsx`, `app/icon.svg`, the marketing route files, `components/marketing/marketing.module.css`, `components/marketing/product-preview.tsx`, `components/marketing/marketing-ui.tsx`, `components/marketing/marketing-shell.tsx`, the dashboard ledger components, `components/shared/empty-state.tsx`, `features/afterprice/queries.ts`, `server/catalogue`, `server/monitoring` and `lib/theme/theme-provider.tsx`.
