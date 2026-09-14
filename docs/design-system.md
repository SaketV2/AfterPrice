# AfterPrice design system

This is the shared visual contract for marketing and product surfaces. Product facts come from the master brief. Demo amounts are illustrative and must be labelled as such where a visitor could mistake them for proof.

## Direction

The world is a quiet watchtower: a cool paper-like light field, deep ink, one indigo signal, and occasional dark-navy product surfaces. Typography and whitespace carry the premium/editorial character; UI controls remain familiar and operational. Product UI is one monitoring engine spanning PriceClaim, PlanGuard and RenewalAudit.

## Type

Use two families only:

- Display and marketing headings: `Manrope`, with `font-weight: 650–800`, tracking between `-0.04em` and `-0.02em`.
- Body and interface: `Inter`, with `font-weight: 400–700`.

Fallback stacks: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.

| Role | Size | Line height | Weight | Use |
| --- | ---: | ---: | ---: | --- |
| Hero display | `clamp(3.5rem, 7vw, 7rem)` | `0.94` | 750 | Public hero only; max 6rem in normal use |
| H1 | `3rem–4rem` | `1.02` | 750 | Page titles |
| H2 | `2.25rem–3rem` | `1.08` | 700 | Section titles |
| H3 | `1.625rem–2rem` | `1.15` | 700 | Panel and feature titles |
| Body large | `1.125rem` | `1.55` | 400–500 | Lead copy; keep to 65–75ch |
| Body | `1rem` | `1.5` | 400–500 | Default copy and table cells |
| Small | `0.875rem` | `1.4` | 500–600 | Labels, metadata |
| Caption | `0.75rem` | `1.35` | 600 | Timestamps, compact tags |

Product screens use the fixed values above rather than fluid headings. Marketing may use the hero clamp. Never use ultra-thin text or display faces in controls.

## Colour tokens

### Light

| Token | Hex | Role |
| --- | --- | --- |
| `--background` | `#F6F6F3` | Page ground |
| `--surface` | `#FFFFFF` | Cards and content planes |
| `--surface-subtle` | `#F0F2F5` | Quiet panels |
| `--surface-cool` | `#E8EDF4` | Cool comparison panels |
| `--surface-dark` | `#101A2A` | High-attention product surfaces |
| `--foreground` | `#0C0F14` | Primary text |
| `--foreground-secondary` | `#5D6673` | Body secondary text |
| `--foreground-muted` | `#818B99` | Captions and disabled copy |
| `--border` | `#E1E5EA` | Dividers and outlines |
| `--accent` | `#6875F5` | Primary action and selected state |
| `--accent-hover` | `#5967E8` | Hover and pressed accent |
| `--accent-soft` | `#E7EAFE` | Accent tint |
| `--powder` | `#DCEAF6` | Comparison/data tint |
| `--success` | `#237A57` | Positive status |
| `--success-soft` | `#E1F3EA` | Positive background |
| `--warning` | `#B76D16` | Warning status |
| `--warning-soft` | `#FFF0D6` | Warning background |
| `--danger` | `#B94242` | Destructive/urgent status |
| `--danger-soft` | `#FCE5E5` | Danger background |

### Dark

| Token | Hex | Role |
| --- | --- | --- |
| `--dark-background` | `#0C1016` | Dark page ground |
| `--dark-surface` | `#131922` | Dark card |
| `--dark-elevated` | `#1A2230` | Dark elevated panel |
| `--dark-border` | `#283241` | Dark outline |
| `--dark-foreground` | `#F5F7FA` | Dark primary text |
| `--dark-secondary` | `#AAB3C0` | Dark body secondary |
| `--dark-muted` | `#788492` | Dark muted text |
| `--dark-accent` | `#8792FF` | Dark action/selected state |
| `--dark-cool` | `#CFE3F5` | Dark comparison highlight |

Contrast target: normal text at least 4.5:1, large text at least 3:1. Do not put muted text on tinted backgrounds without checking contrast. Colour must be paired with a label, icon or shape for state.

## Spacing and layout

Base unit is `8px`. Allowed rhythm: `8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 128px`. Keep more space above headings than below them. Marketing content max width is `1280px`; app content max useful width is `1440px`.

Breakpoints:

- `sm`: `640px`, compact two-column adjustments.
- `md`: `768px`, tablet layout and navigation reduction.
- `lg`: `1024px`, app sidebar becomes persistent and marketing columns open.
- `xl`: `1280px`, full editorial composition.
- `2xl`: `1440px`, app content cap and spacious dashboard.

No view should create accidental horizontal scrolling. Dashboard tables collapse to stacked rows or scroll only when the data itself requires a table.

## Radius and elevation

- Major marketing composition: `28px` (`--radius-major`).
- Dashboard cards and panels: `20px` (`--radius-dashboard`).
- Small cards, controls and buttons: `16px` (`--radius-card`).
- Inputs: `12px` (`--radius-input`).
- Pills: `9999px`, only for compact status or filter chips.

Prefer a 1px border and a low-opacity, soft shadow. The shared shadow is `0 12px 36px rgba(12, 15, 20, 0.08)` and should be used sparingly. Never use hard offset shadows or heavy floating chrome.

## Controls and states

Primary buttons use dark ink or indigo fill, white text, `44px` minimum height, `12px 20px` horizontal padding and a 12px radius. Secondary buttons use a surface fill plus border. Tertiary buttons are text-only with a visible hover background. Danger is reserved for destructive operations. Every control has default, hover, focus-visible, active, disabled and loading treatment where applicable.

Focus-visible: `2px solid var(--accent)` with `2px` offset. Never remove the browser focus outline without replacing it.

Status badges use a tinted background, readable foreground, a text label and optional icon. Recommended labels: `Monitoring`, `Price drop`, `Plan changed`, `Renewal soon`, `Resolved`, `Needs review`.

## Data visualisation

Charts use one baseline and one present value first, then a single accent for the financially relevant change. Use powder blue for historical/secondary series and indigo for the active series. Keep gridlines subtle (`--border`), label axes in readable text and annotate the key event in words. Charts must remain understandable without colour, including in tooltips and adjacent text. Avoid decorative sparklines and progress rings when a label or table is clearer.

## Motion

Marketing may use a single authored reveal moment, subtle floating notification cards and 150–350ms transitions. Product UI uses 150–250ms state transitions and no orchestrated page-load choreography. Use opacity/translate/scale only where they explain reveal or state. All animation is wrapped in a `prefers-reduced-motion: reduce` fallback that disables non-essential motion.

## Component contract

Shared components live under `components/ui`, `components/shared` and `components/layout`. They must be semantic, keyboard usable and composable. Use real buttons and links, labels for form fields, `aria-live` for async feedback and `role="dialog"` or `<dialog>` for protected focus. Empty states should teach the next action. Loading uses skeletons rather than indefinite spinners. Modals should only interrupt when the task needs protected focus.

## Marketing composition

The page rhythm alternates full-width surfaces and contained editorial blocks. The first viewport demonstrates the monitor mechanism, not a generic gradient. Use large type, asymmetric but intentional compositions and one dark product UI surface. The supplied references support a controlled mix of bright editorial whitespace (Agenda, GAZU), analytical modules (DNastar, Fitshop), dark data workbenches (Talenzo, Spacesis, AV) and one cinematic image-led section (Travel). Use no more than one or two image-led sections, keep images low-saturation and purposeful, and never use generic stock-photo trust signals. Avoid a wall of same-sized cards.

## Application composition

The app shell uses a cool side rail at desktop, a compact top bar at tablet and a drawer at mobile. The overview leads with potential impact, active alerts and the next renewal. Lists prioritise item, change, consequence and action. PriceClaim, PlanGuard and RenewalAudit share rows, badges, charts and detail patterns so the product reads as one engine.
