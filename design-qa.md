# Design QA

Source visual truth:

- Public website reference: `C:\Users\notsa\AppData\Local\Temp\codex-clipboard-5e8e5716-1846-42ae-97dc-8fe11f485940.png` at 2048 x 1286. It is the supplied REF-11 marketing reference and intentionally contains the old SpendGuard name that this implementation replaces.
- Authenticated app references: `C:\Users\notsa\AppData\Local\Temp\codex-clipboard-42ac2619-e495-44af-8b6b-9db1fbea8f57.png` and `C:\Users\notsa\AppData\Local\Temp\codex-clipboard-009dc766-751c-4122-bcae-6f160b2fccd7.png`. These are authenticated reference states for Overview and Purchases.

Implementation evidence:

- [marketing-home-desktop.png](docs/qa/marketing-home-desktop.png), 2048 x 1286 capture at a 2048 x 1286 CSS viewport, default browser density, public home route, light theme.
- [marketing-home-narrow.png](docs/qa/marketing-home-narrow.png), 390 x 844 capture at a 390 x 844 CSS viewport, default browser density, public home route, light theme.
- [login-desktop.png](docs/qa/login-desktop.png), 1440 x 900 capture at a 1440 x 900 CSS viewport, default browser density, logged-out login state.

Comparison evidence:

- The desktop marketing capture preserves the supplied editorial structure while replacing the old brand with AfterPrice and replacing the generic chart with a post-purchase price monitor showing paid price, lower current price, potential saving and return-window timing.
- The narrow capture has no horizontal overflow: document width was 380px against a 390px viewport. The hero and monitor stack without clipping in the visible state.
- The login capture shows the public marketing shell, AfterPrice branding, real email/password fields and the protected-route context.
- The authenticated app references could not be compared against a fresh implementation capture. Direct navigation to `/app` correctly redirected to `/login?next=%2Fapp` because no test account was available in the local browser session. Creating an account would be an external account-side effect and was not performed.

Required fidelity surfaces:

- Fonts and typography: the implementation uses the repository's local display and body fonts, with the editorial headline hierarchy retained on the public page and compact form hierarchy on login.
- Spacing and layout rhythm: desktop hero columns and mobile stacking were inspected. The narrow layout has no horizontal overflow.
- Colours and visual tokens: the warm light marketing background, dark monitor surface, cobalt action colour and restrained signal-lime opportunity colour are present in the capture.
- Image quality and asset fidelity: the supplied references use interface graphics rather than content photography. The implementation uses real text, chart structure and the existing icon library, with no fake product imagery added.
- Copy and content: public examples are explicitly labelled illustrative, while auth copy describes private account records and real authentication.

Findings:

- [P2] Authenticated app visual states remain unverified. Location: `/app`, `/app/purchases`, `/app/subscriptions`, `/app/alerts`, `/app/settings` and `/app/add`. Evidence: the local session was logged out and protected navigation redirected to login. Impact: the visual comparison cannot confirm the final empty-state and theme rendering in a real authenticated session. Fix: sign in with a test account, capture the empty authenticated routes at desktop and narrow widths, then rerun this report.

Comparison history:

- Initial pass: public marketing and login states rendered without actionable layout findings; the authenticated app comparison was blocked by the missing test session.
- No P0 or P1 visual fixes were left outstanding in the accessible states. The stale generated QA screenshots containing seeded records were removed and are not used as evidence.

Primary interactions tested:

- Public home navigation and rendering.
- Protected `/app` redirect to login.
- Logged-out catalogue search API rejection with HTTP 401.
- Logged-out monitoring check API rejection with HTTP 401.
- Login route rendering and browser console warning/error check.

Console check:

- Login capture returned no browser error or warning entries.

final result: blocked
