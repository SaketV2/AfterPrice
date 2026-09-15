# AfterPrice visual QA

Source visual truth: `C:\Users\notsa\AppData\Local\Temp\codex-clipboard-4b0f04f1-1a36-42b5-bbff-f2e1806bc805.png` (Reference 1, desktop marketing hero)

Implementation captures:

- Desktop: `C:\Users\notsa\AppData\Local\Temp\afterprice-qa-marketing-desktop.png`
- Mobile: `C:\Users\notsa\AppData\Local\Temp\afterprice-qa-marketing-mobile.png`

## Comparison setup

- Desktop CSS viewport: 1440 × 900; implementation PNG: 1430 × 894; device scale factor: 1.
- Mobile CSS viewport: 390 × 844; implementation PNG: 380 × 822; device scale factor: 1.
- Source pixels: 1448 × 1086. The source is a 4:3 desktop reference; comparison focused on the shared hero/header/content regions rather than browser chrome or exact canvas dimensions.
- State: initial `/` marketing page, no menu open; mobile drawer also checked in its open state.
- Focused regions: header/mark, editorial hero copy and CTA, layered purchase record, mobile single-column hero. These regions carry the primary fidelity requirements.

## Findings

No actionable P0/P1/P2 findings remain.

- Fonts and typography: Instrument Serif is used for editorial headings and the shared wordmark; Instrument Sans remains the body/control face. Hero hierarchy and wrapping remain readable at both target sizes.
- Spacing and layout rhythm: the desktop hero uses the requested asymmetric text/record composition; mobile collapses to one column with the record still readable and no horizontal overflow.
- Colours and visual tokens: warm paper, ink, white record surface, cobalt actions and signal-lime opportunity treatment are present. Lime is limited to the detected opportunity/deadline signal.
- Image quality and asset fidelity: no unsupported external product photo or screenshot asset is used. The brief permits the record to stand on typography/evidence surfaces when a legitimate public thumbnail is unavailable; the implementation uses restrained CSS paper/receipt layers and semantic Lucide icons.
- Copy/content: the hero preserves `Stop losing money after you buy`, marks public content as illustrative/sample data, and keeps potential money labelled as potential.

## Comparison history

1. Initial rendered hero used the dark Change Rail panel in the above-the-fold composition. This was a P1 mismatch with the requested white purchase/evidence record and was not accepted.
2. Replaced the hero-only surface with the white Sony WH-1000XM6 purchase record, layered paper/receipt evidence surfaces, lifecycle dots, source timestamp, deadline and cobalt review action. Final desktop and mobile captures show the corrected composition.

## Behaviour checks

- `main#main-content`: exactly one on the marketing homepage and branded 404.
- Skip link: keyboard `Enter` moved focus to the primary `MAIN#main-content`.
- Mobile navigation: `Open navigation` opened one dialog with the expected links and close control.
- Mobile overflow: `document.documentElement.scrollWidth > window.innerWidth` was false at 390 × 844.
- Console errors: none on fresh desktop/mobile captures.
- Auth protection: `/app` redirected to `/login?next=%2Fapp` without exposing protected content.

final result: passed
