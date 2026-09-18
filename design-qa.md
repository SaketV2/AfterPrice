# AfterPrice design QA

Source visual truth:

- Marketing hero: `C:\Users\notsa\AppData\Local\Temp\codex-clipboard-5f3ef3ec-024a-49e0-95c3-a6e442dd8d21.png` (1792 × 1016 reference viewport).
- Authenticated settings: `C:\Users\notsa\AppData\Local\Temp\codex-clipboard-44d63738-a0da-43ec-881d-ec6b9b75b90e.png` (2048 × 1016 reference viewport).
- Product object/detail and pricing references: the remaining supplied clipboard images in `C:\Users\notsa\AppData\Local\Temp`.

Implementation evidence:

- Marketing home desktop full-page capture: `qa/afterprice-home-desktop.png` (1799 × 3047 pixels, captured at the default desktop browser viewport).
- Mobile checks used a temporary 390 × 844 viewport, then reset it.
- Protected app visual capture was not available because the local browser had no authenticated Supabase session. `/app` was verified to redirect to `/login?next=%2Fapp`.

## Review

The public implementation preserves the supplied product-specific language: warm paper, receipt-white surfaces, deep moss actions, the Sony WH-1000XM6 example, and the baseline → change → evidence → timing → action sequence. The redesigned homepage is shorter than the prior long landing page, and the dedicated routes provide the detailed explanation, coverage, data/privacy and pricing content.

The desktop comparison showed consistent container alignment, a readable hero/product-object pairing and no visible clipping. The 390px mobile check showed a stacked hero, usable touch targets, a modal navigation drawer and no horizontal overflow (`scrollWidth` did not exceed the viewport). Pricing cards stack and the yearly toggle updates the Pro amount from A$6/month to A$59/year.

The app implementation was reviewed against the supplied settings reference in source and code: the authenticated palette is now neutral graphite with cobalt interaction, amber warnings, green success, muted red destructive states and blue informational states. Direct screenshot comparison of the authenticated route is pending a local authenticated session.

## Functional evidence

- Public route checks passed for `/`, `/how-it-works`, `/coverage`, `/data-privacy`, `/pricing`, `/privacy`, `/demo`, `/faq`, `/login` and `/signup`; each rendered a main landmark and heading.
- Invalid checkout input returns HTTP 400; unauthenticated portal access returns HTTP 401; valid checkout without Stripe configuration returns a clear HTTP 503 configuration message.
- Live Stripe Checkout, webhook delivery, Supabase migration/RLS and authenticated entitlement/portal flows require deployment credentials and were not exercised locally.

## Findings

- No public layout overflow or clipping was found in the audited desktop/mobile states.
- No browser console errors were observed for the audited public routes. Development-only Fast Refresh messages were present.
- Live authenticated app visual and billing verification remain environment-blocked, not implementation-verified.

Final result: blocked
