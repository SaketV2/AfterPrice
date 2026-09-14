# AfterPrice design direction

## Source and constraint

Eight reference images are now available as the eight `codex-clipboard-*.png` files in `C:\Users\notsa\AppData\Local\Temp`. They were inspected directly on 6 September 2026. This direction synthesises those references with AfterPrice's product truth; it does not clone any one of them.

Observed evidence by reference:

1. Agenda uses a white field, very large black sans type and a centred promise surrounded by floating UI, photo and editorial cards.
2. DNastar's assessment dashboard uses a pale blue outer frame, white rounded analytical panels, explicit tabs/toggles and semantic colour bars/donuts.
3. Fitshop uses a white dashboard, pill navigation, soft lavender metric panels, purple chart accents and dense but legible data modules.
4. Talenzo uses a near-black app surface, cool pale-blue hero panel, modular dark cards, generous light type and strong data visualisation.
5. Spacesis uses a cinematic charcoal canvas, thin grid lines, huge white type and an immersive centre image with side-column narrative.
6. GAZU uses a restrained monochrome editorial commerce layout, oversized wordmark, photography, black bands and simple line icons.
7. The travel reference uses a dark blue image-led long-form rhythm, large titles, numbered progression and card clusters that lead into a cinematic finish.
8. The AV portfolio uses a dark workbench, condensed display title, capsule CTA, bordered metric strip, dense capability modules and cool highlight surfaces.

## Product mechanism

AfterPrice is a personal money watchdog. It records a purchase or subscription baseline, monitors the change, calculates the financial impact and gives the user a clear next action. The shared visual language must make this monitoring loop feel like one calm system, not three separate products.

## Committed world: the quiet watchtower

The interface uses a cool paper-like light ground, deep ink text and a restrained indigo signal colour. A compact dark-navy product surface is used for high-attention moments and hero UI, with powder-blue data marks providing a visual thread between a baseline and the present. The physical scene is a person reviewing costs at a desk in daylight: calm, legible and deliberate, with one alert that earns attention. This keeps the system trustworthy without looking like banking software or a generic AI dashboard.

The form is an editorial monitoring ledger: large, tightly set headlines; generous breathing room; low-chrome surfaces; modular data rows; and a clear reading path from amount to consequence to action. It borrows the airy composition and oversized type of Agenda / GAZU, the measured analytical hierarchy of DNastar / Fitshop, the premium dark panel discipline of Talenzo / Spacesis / AV, and the image-led pacing of Travel. It avoids cloning any single reference or default SaaS card grid.

## First viewport contract

The public hero should make the mechanism visible immediately: a large “Stop losing money after you buy.” headline sits beside a dark AfterPrice monitor surface showing one price-drop event, one renewal event and their next actions. The primary action is “Try the demo”; supporting navigation is quiet. On the app shell, the overview task is visible at once: potential impact, active alerts and the next renewal, with status encoded by text, icon and colour together.

## Visual material

- Light ground: warm-neutral `#F6F6F3`, white content planes and cool `#E8EDF4` secondary planes.
- Ink: `#0C0F14` for primary text and `#5D6673` for readable secondary text.
- Signal: indigo `#6875F5`, used for action and selected state, with pale `#E7EAFE` support.
- Data: powder blue `#DCEAF6` for comparison and a single dark-navy `#101A2A` surface for contrast.
- Status: green, amber and red are semantic accents, never the only status carrier.
- Optional marketing imagery: one or two quiet, low-saturation editorial crops may carry the cinematic role seen in Agenda, Spacesis, GAZU and Travel. The application itself should remain product-UI-led.

## Composition rules from the evidence

- Keep the first viewport asymmetric and proof-led: one large AfterPrice statement plus a coherent monitoring surface, not a generic centred SaaS hero.
- Use thin dividers, grouped modules and a single strong chart or comparison visual for analytical confidence. Avoid competing chart colours.
- Reserve full dark sections for a meaningful product showcase or final CTA. Use pale blue/indigo surfaces for data emphasis, never random decoration.
- Let editorial scale alternate with operational density: a large headline earns a compact evidence panel; a dense table earns surrounding quiet.
- Rounded containers are part of the shared language, but radius should follow hierarchy rather than make every element a pill.

## Responsive and accessibility stance

The design is content-first at 375px: no horizontal overflow, no tiny dashboard tables and no decorative cards that hide the action. The app sidebar collapses to a drawer below 1024px. Focus rings use a 2px indigo outline with a 2px offset. Body text targets WCAG AA contrast, touch targets are at least 44px where practical, and motion follows `prefers-reduced-motion`.

## Honest limits

Photography or generated imagery is optional, not structural. Product UI is the proof. If marketing uses an image, it must be a deliberate low-saturation editorial crop and never synthetic social proof. All example amounts are clearly demo data, and the foundation does not imply automatic refunds, bank integrations or production authentication.
