# Comprehensive AfterPrice Application Audit

Audit date: 2026-09-18  
Primary production target: https://afterprice.vercel.app/  
Repository: AfterPrice, branch main  
Audit mode: read-only; no application, database, payment, deployment, or dependency changes were made.

## 1. Executive Summary

AfterPrice is a well-structured Next.js/Supabase application with a polished public experience, sound server-side boundaries, strong URL safety controls, hosted Stripe payment handling, and passing local quality gates. The production deployment currently matches the audited repository revision. The main production readiness issue is not visual quality: the deployed billing and monitoring workflows are disabled by missing runtime configuration, and the source tree does not contain the core application schema/RLS migrations needed to reproduce the current database safely.

Total findings: 20.

- P0: 0
- P1: 5
- P2: 11
- P3: 4

The most serious frontend problem is the visible Pro checkout failure: the pricing CTA returns “Billing is not configured. Set NEXT_PUBLIC_SITE_URL.” The most serious code problem is that paid entitlements are calculated but not used as a guard around Pro functionality. The most serious security problem is the authenticated check-now endpoint, which accepts an arbitrary catalogue product and performs service-role persistence and outbound provider work without ownership, entitlement, or rate-limit checks. The most serious performance problem is the monitoring path’s serial external work and the baseline detail query that loads all related history before selecting one record.

There are production blockers. Billing checkout, claim, and portal endpoints return 503 because the deployment does not have the required site configuration. The monitoring cron endpoint returns 503 because CRON_SECRET is not configured, and no tracked scheduler definition was found. Even after those configuration issues are corrected, subscription-plan observations are not currently written by the monitoring loop.

Areas already implemented well include:

- SSR Supabase session handling and server-side protected product routing.
- Strict internal redirect validation.
- Server-only service-role and Stripe secret usage.
- Stripe raw-body signature verification and idempotency records.
- Cryptographically random, hashed billing claim tokens.
- Strict eBay URL/redirect/DNS safety checks.
- Zod validation on externally reachable mutation inputs.
- Clean public rendering at all four tested viewports, with no console errors or horizontal overflow.

## 2. Architecture Summary

AfterPrice uses Next.js 16.3.4 App Router, React 19.2.8, TypeScript in strict mode, Tailwind-based styling, and server components/server actions. The public marketing routes and protected product routes are separated by route groups. A global proxy refreshes the Supabase session; the product layout performs the protected server-side user check and redirects unauthenticated users to login.

The data layer is Supabase Postgres accessed through the Supabase SSR client for user-scoped reads and writes and a server-only service-role client for trusted billing, catalogue, and monitoring operations. Production contains core application tables such as profiles, purchases, subscriptions, alerts, observations, catalogue products, and preference tables. All inspected public tables currently have RLS enabled.

Stripe is used through hosted Checkout and Customer Portal flows, with a signed webhook endpoint and a billing claim flow for guest checkout handoff. eBay is the active external price source for the monitoring implementation. Retailer ingestion is explicitly unavailable rather than silently pretending to work.

Important boundaries:

- Browser -> Next.js pages and same-origin API routes.
- Supabase SSR cookies -> authenticated server reads/actions.
- Server-only service-role client -> trusted writes and billing/monitoring operations.
- Stripe hosted pages/webhook -> billing state.
- eBay API -> source observations, bounded by URL and timeout controls.

## 3. Deployment And Repository Consistency

The audited production URL was https://afterprice.vercel.app/.

The latest ready production deployment is associated with repository revision e4ada91324501d330a9007540c1fcc93a31b72b0 on main. The local repository HEAD is the same revision. Deployment/repository match: YES.

The deployment is a Vercel Next.js project using Node 24.x. The local audit runtime was Node 22.14.0, and the repository has no .nvmrc or package engines declaration. This did not prevent the local build, but it is a reproducibility gap.

The match means source findings apply to the current production code revision. It does not mean the production environment is correctly configured: the live API responses demonstrate that runtime environment values and operational scheduling are incomplete.

## 4. Audit Coverage

The table below covers every discovered user-facing page route. “Targeted” in the interaction column means the route participated in the relevant navigation, form, state, or visual sweep; it does not claim that every control on every page was manually activated.

| Route | In repository | Production | Browser tested | Responsive | Interaction/state | Auth coverage |
|---|---|---|---|---|---|---|
| / | Yes | 200/rendered | Yes | 1440x900, 1280x800, 768x1024, 390x844 | Nav, skip link, visual states | Public |
| /how-it-works | Yes | 200/rendered | Yes | Four viewports | Navigation/visual | Public |
| /coverage | Yes | 200/rendered | Yes | Four viewports | Navigation/visual | Public |
| /data-privacy | Yes | 200/rendered | Yes | Four viewports | Navigation/visual | Public |
| /demo | Yes | 200/rendered | Yes | Four viewports | Navigation/visual | Public |
| /faq | Yes | 200/rendered | Yes | Four viewports | FAQ expansion, aria-expanded | Public |
| /pricing | Yes | 200/rendered | Yes | Four viewports | Monthly/yearly toggle, Pro CTA | Public; billing failure reproduced |
| /privacy | Yes | 200/rendered | Yes | Four viewports | Navigation/visual | Public |
| /terms | Yes | 200/rendered | Yes | Four viewports | Navigation/visual | Public |
| /resources | Yes | 200/rendered | Yes | Four viewports | Resource navigation | Public |
| /resources/post-purchase-price-adjustments | Yes | 200/rendered | Yes | Four viewports | Resource navigation | Public |
| /resources/software-subscriptions-get-expensive | Yes | 200/rendered | Yes | Four viewports | Resource navigation | Public |
| /resources/audit-recurring-payments | Yes | 200/rendered | Yes | Four viewports | Resource navigation | Public |
| /resources/before-an-annual-renewal | Yes | 200/rendered | Yes | Four viewports | Resource navigation | Public |
| /login | Yes | 200/rendered | Yes | Four viewports | Empty form/focus state | Unauthenticated only |
| /signup | Yes | 200/rendered | Yes | Four viewports | Empty form/focus state | Unauthenticated only |
| /forgot-password | Yes | 200/rendered | Yes | Four viewports | Empty form/focus state | Unauthenticated only |
| /reset-password | Yes | Redirects to forgot-password without session | Yes | Unauthenticated path only | Redirect behavior | Authenticated reset session unavailable |
| /app | Yes | Redirects to login with next path | Yes | Not reached | Unauthenticated redirect | Unauthenticated only |
| /app/add | Yes | Redirects to login with next path | Yes | Not reached | Unauthenticated redirect | Unauthenticated only |
| /app/alerts | Yes | Redirects to login with next path | Yes | Not reached | Unauthenticated redirect | Unauthenticated only |
| /app/baselines | Yes | Redirects to login with next path | Yes | Not reached | Unauthenticated redirect | Unauthenticated only |
| /app/baselines/new | Yes | Redirects to login with next path | Yes | Not reached | Unauthenticated redirect | Unauthenticated only |
| /app/baselines/[id] | Yes | Redirected using a zero UUID probe | Yes | Not reached | Unauthenticated redirect | Unauthenticated only |
| /app/items/[id] | Yes | Redirected using a zero UUID probe | Yes | Not reached | Unauthenticated redirect | Unauthenticated only |
| /app/purchases | Yes | Redirects to login with next path | Yes | Not reached | Unauthenticated redirect | Unauthenticated only |
| /app/settings | Yes | Redirects to login with next path | Yes | Not reached | Unauthenticated redirect | Unauthenticated only |
| /app/subscriptions | Yes | Redirects to login with next path | Yes | Not reached | Unauthenticated redirect | Unauthenticated only |

The route inventory also included the auth callback and these server endpoints, all inspected statically and safely probed where a non-mutating or unauthenticated request was possible: /auth/callback, /api/billing/checkout, /api/billing/claim, /api/billing/portal, /api/catalogue/search, /api/catalogue/manual, /api/monitoring/check-now, /api/cron/monitoring, and /api/stripe/webhook.

Browser coverage completed:

- 18 concrete public page URLs opened.
- 10 protected page paths safely opened and marked as unauthenticated redirects.
- 68 public route/viewport checks across 1440x900, 1280x800, 768x1024, and 390x844.
- Major navigation, mobile menu, FAQ, pricing toggle, timeline selection, skip link, and empty-form states exercised.
- No browser console errors or warnings observed.
- 20/20 sampled rendered assets loaded successfully.
- No document-level horizontal overflow observed.

Blocked coverage: no authenticated Supabase session or test account was available, so authenticated product screens, successful checkout, authenticated monitoring, account settings, real purchases/subscriptions, and password-reset completion could not be run. No account was created and no private user data was accessed.

## 5. Critical / P0 Findings

None.

## 6. High / P1 Findings

### P1-001 — Production billing is disabled by missing site configuration

Severity: P1 / high user impact. Confidence: high. Production-observed and code-verified.

The pricing Pro CTA posts to /api/billing/checkout. The deployed endpoint returns HTTP 503 with “Billing is not configured. Set NEXT_PUBLIC_SITE_URL.” The same configuration guard blocks billing claim and portal calls. The production pricing page surfaces the same failure when the CTA is exercised without entering a real payment flow.

Evidence: components/marketing/pricing-toggle.tsx:12-33; app/api/billing/checkout/route.ts:20-27; safe production probes of checkout, claim, and portal.

Impact: a customer cannot start, claim, or manage a paid plan in the current deployment. No charge was made.

Remediation: set the required production site URL and Stripe configuration through the deployment secret manager, then run a non-charge checkout-session smoke test and a staging webhook/claim test.

Effort: small configuration change plus verification.

### P1-002 — Production monitoring is disabled and has no tracked scheduler

Severity: P1 / high user impact. Confidence: high. Production-observed and code/repository-verified.

GET /api/cron/monitoring returns HTTP 503 with “Monitoring scheduler is not configured. Set CRON_SECRET before enabling the cron route.” The route requires a bearer secret, but .env.example does not document CRON_SECRET, and no vercel.json, tracked scheduler definition, or CI schedule was found. The scheduler also processes up to 50 products serially, so merely adding a secret without an operational schedule and runtime budget review is incomplete.

Evidence: app/api/cron/monitoring/route.ts:13-23 and 29-59; server/monitoring/scheduler.ts:66-74; .env.example; repository configuration inventory.

Impact: advertised price monitoring does not run in the audited production deployment.

Remediation: configure CRON_SECRET and the eBay variables in the deployment environment, add a tracked scheduler configuration or documented external scheduler, and instrument bounded jobs with progress/failure visibility.

Effort: medium.

### P1-003 — Paid entitlement is calculated but not enforced around Pro functionality

Severity: P1 / authorization and business-logic risk. Confidence: high from source review; authenticated production execution was unavailable.

The product copy describes Pro as providing the full monitoring loop. Entitlement code exists in server/billing/entitlements.ts:18-50, but the repository search found it used to prevent duplicate checkout rather than to protect monitoring, baseline, alert, or check-now functionality. The protected application and monitoring route primarily require authentication. A signed-in free user can therefore reach the same product actions unless an untracked external policy happens to provide the missing gate.

Impact: users can receive paid functionality without an active entitlement, creating a revenue/control bypass and inconsistent product behavior.

Remediation: create one server-side entitlement guard, apply it to every Pro action/API/route, return a consistent 403 or upgrade response, and test free, trialing, active, canceled, and expired states.

Effort: medium.

### P1-004 — Core application schema and RLS migrations are absent from the current repository

Severity: P1 / deployment and data-integrity risk. Security severity: low while current production policies remain in place. Confidence: high.

The current tree contains only the Stripe billing migration at supabase/migrations/20260915000000_stripe_billing_foundation.sql. Production Supabase reports six earlier core migrations, including application schema and hardening migrations, but those files are not present in the repository. Historical core RLS existed in an earlier revision and was removed from the current tree.

Production metadata currently shows RLS enabled on all inspected public tables and appropriate owner/read policies, so this is not reported as an active production data exposure. It is a source-of-truth and disaster-recovery problem: a clean clone cannot recreate the current application database and policy posture from version-controlled migrations.

Remediation: restore or regenerate the complete core schema, indexes, functions, grants, and RLS migrations into the repository; add a clean-database bootstrap check and cross-user authorization integration tests.

Effort: medium to large.

### P1-005 — Subscription monitoring is not implemented end to end

Severity: P1 / product correctness. Confidence: high.

The monitoring loop writes product price observations, while features/afterprice/queries.ts:107-113 reads subscription_plan_observations. No corresponding writer was found for subscription plan observations, so renewal/plan monitoring claims cannot be fulfilled even if the cron secret and scheduler are configured.

Remediation: define the supported subscription source and observation semantics, implement the writer and alert transitions, add fixture-based tests, and expose an explicit unsupported state until the implementation exists.

Effort: medium.

## 7. Medium / P2 Findings

### P2-001 — check-now accepts arbitrary catalogue products and performs service-role writes

Severity: P2 / security medium. Confidence: high.

app/api/monitoring/check-now/route.ts:16-44 checks authentication and UUID shape, then finds an arbitrary catalogue product and invokes service-role monitoring/persistence. It does not establish that the product belongs to a purchase owned by the caller, does not enforce the paid entitlement, and does not apply a per-user quota.

Impact: any signed-in user can trigger outbound provider work and create global observations or user alerts for products they do not own. This can pollute shared data and consume provider/database capacity.

Remediation: require an owned purchase/subscription and active entitlement, scope writes to the caller’s ownership, add account/IP limits, and reject already-running checks.

### P2-002 — Expensive billing and monitoring operations have no application rate limit or quota

Severity: P2 / security medium. Confidence: high.

The checkout path can create pending Stripe checkout state and hosted sessions, while check-now can issue outbound eBay work. No application-level rate limiter, idempotency key requirement, per-account quota, or abandoned-checkout cleanup policy was found.

Evidence: app/api/billing/checkout/route.ts:20-58; server/billing/checkout.ts:44-106; app/api/monitoring/check-now/route.ts:16-44; server/monitoring/scheduler.ts:24-73.

Remediation: add IP and account limits at the edge/API boundary, require idempotency for checkout, cap monitoring checks per account, and clean up expired pending billing rows.

### P2-003 — Baseline detail pages load all related history before selecting one record

Severity: P2 / performance. Confidence: high from source review.

features/afterprice/queries.ts:94-114 loads all purchases, subscriptions, and observations for the user/product set. getBaseline(id) at lines 177-179 then filters the already-loaded result in memory. Detail-page cost and payload therefore grow with the user’s history rather than with the selected baseline.

Remediation: query the selected baseline directly, join only the needed related records, select explicit columns, and paginate long observation history.

### P2-004 — Observation persistence has a race and ignores the final source-update result

Severity: P2 / data integrity. Confidence: medium.

server/monitoring/observation.ts:36-69 reads for an existing observation and then inserts when absent. Concurrent checks can create duplicates unless the database constraint/upsert path guarantees uniqueness. The final source update result is not handled, so bookkeeping can silently remain stale even when the observation write succeeds.

Remediation: use a database uniqueness constraint plus atomic upsert, inspect every write result, and add a concurrent-check test.

### P2-005 — Operational configuration and runtime reproducibility are incomplete

Severity: P2 / maintainability and deployment reliability. Confidence: high.

.env.example documents Supabase and Stripe values but omits CRON_SECRET and the eBay credentials/settings used by the monitoring code. It also defaults NEXT_PUBLIC_SITE_URL to localhost while the production deployment requires a real site URL. The repository has no Node version pin, tracked scheduler/deployment manifest, or CI workflow.

This finding is the repository/configuration gap; the resulting live billing and monitoring outages are tracked separately as P1-001 and P1-002.

Remediation: document all required variables without values, pin the supported Node version, track the scheduler/deployment contract, and add a production configuration smoke check.

### P2-006 — Public routes perform duplicate request-bound auth/preference work

Severity: P2 / performance and rendering architecture. Confidence: high.

app/layout.tsx:31-38 performs an auth lookup and preference read on every route. The marketing layout also performs an auth lookup at app/(marketing)/layout.tsx:12-15. This makes public marketing routes request-bound and repeats work that is not needed for their primary content.

Remediation: keep only the minimum global shell in the root layout, isolate protected/auth-dependent preference loading to the product area, and preserve the existing theme behavior through a narrower boundary.

### P2-007 — Manual catalogue endpoint reports creation without persisting the shared catalogue product

Severity: P2 / functional correctness. Confidence: high.

server/catalogue/manual.ts:34-37 intentionally returns a normalized product without saving it to the shared catalogue, while app/api/catalogue/manual/route.ts:36-39 returns HTTP 201. The API contract therefore tells a caller that a resource was created when it was not persisted. The current UI does not appear to depend on this endpoint, which limits current impact but increases integration risk.

Remediation: either persist the intended user-owned record and return its identity, or change the endpoint to an explicit validation/preview response and remove the creation status.

### P2-008 — Some client-visible API errors expose raw provider/database messages

Severity: P2 / security low. Confidence: high.

Several routes return error.message directly, including catalogue search, manual catalogue, and monitoring check-now. Browser smoke testing did not observe an actual leak or stack trace, but provider/database errors can disclose implementation details during failure.

Remediation: return stable public error codes/messages and log diagnostic details server-side with request correlation IDs.

### P2-009 — Billing code bypasses generated database types

Severity: P2 / maintainability and drift risk. Confidence: high.

lib/billing/supabase.ts:6-25 uses a dynamic Record-based database shape because lib/supabase/database.types.ts does not include the billing tables/functions. A migration or schema change can therefore compile while silently drifting from runtime expectations.

Remediation: regenerate the Supabase types from the version-controlled schema and use typed billing repositories/RPC signatures.

### P2-010 — README is corrupt and identifies the product as SpendGuard

Severity: P2 / maintainability. Confidence: high.

README.md begins with corrupted/NUL-containing content and describes a different product name. This materially harms onboarding, incident response, and deployment handoff for a clean checkout.

Remediation: replace it with an accurate AfterPrice README covering local setup, required variables, migrations, test commands, deployment, and safe production checks.

### P2-011 — Supabase leaked-password protection is disabled

Severity: P2 / security medium. Confidence: high from the connected Supabase security advisor.

The production Supabase security advisor reports auth_leaked_password_protection as a warning. Compromised passwords can therefore be accepted unless another provider-level control prevents them.

Remediation: enable Supabase leaked-password protection and verify the setting in staging and production. This is a provider setting, not a code change.

## 8. Low / P3 Findings

### P3-001 — Production security response headers are incomplete

Severity: P3 / security low. Confidence: high from a safe production GET.

next.config.ts:3-6 disables the powered-by header but defines no application security headers. The production root response showed HSTS, but no CSP, X-Content-Type-Options, frame protection, Referrer-Policy, or Permissions-Policy.

Remediation: add a compatible header policy, starting with nosniff, frame-ancestors/frame protection, a restrictive Referrer-Policy, and Permissions-Policy; introduce CSP with report-only validation if the current assets require tuning.

### P3-002 — Signup errors can support account enumeration

Severity: P3 / security low. Confidence: high from source review.

app/auth/actions.ts:32-42 returns the Supabase signup error message and components/marketing/auth-form.tsx:32-35 displays it. Password reset correctly uses a generic response, but signup responses may distinguish an existing address from a new one.

Remediation: return the same public failure message for all signup outcomes and retain provider details only in server logs.

### P3-003 — Sitemap omits two public pages and hardcodes the production origin

Severity: P3 / SEO and maintainability. Confidence: high.

app/sitemap.ts:4-8 includes the home, marketing, resource, privacy, and terms routes but omits /coverage and /data-privacy, both reachable production pages. The sitemap and robots metadata hardcode the Vercel hostname rather than deriving it from the site configuration.

Remediation: include all intended indexable public pages and derive the canonical origin from the configured public site URL with a production-safe fallback.

### P3-004 — Monitoring writes and external work are triggered by GET

Severity: P3 / security low / HTTP method hygiene. Confidence: high.

app/api/cron/monitoring/route.ts exports GET while performing monitoring writes and outbound provider requests. The bearer secret materially limits access, but a state-changing operation should use an explicit job method or a provider-specific signed invocation contract.

Remediation: move the state-changing job to POST or a dedicated internal job handler and preserve the secret/signature check.

## 9. Frontend And Visual Findings

### Layout and alignment

No P0-P3 visual defect was confirmed. The public pages stacked cleanly at desktop, tablet, and mobile sizes. No sampled page had document-level horizontal overflow, clipping, or visible overlap.

### Typography and components

The public typography hierarchy, warm visual system, cards, buttons, navigation, pricing cards, FAQ rows, and resource pages were coherent in the sampled production build. No broken image/resource was observed.

### Responsive behavior

The four viewport checks found stable mobile menu behavior and correct stacking of the hero, cards, pricing content, and resource layout. The mobile navigation uses a native modal dialog and did not leave the document scroll-locked after close.

### Navigation, forms, and state handling

Primary navigation reached pricing and other public pages. The mobile menu opened and closed. FAQ expansion updated aria-expanded. Pricing changed from A$6/month to A$59/year and updated its selected state. Empty auth forms focused the first required field. The skip link focused main#main-content.

The one user-visible functional frontend finding is P1-001: the Pro CTA is present and styled correctly but cannot complete because the production billing configuration is missing.

### Runtime errors and broken resources

No browser console error or warning was observed in the public route sweep. Safe production API probes returned explicit, bounded status/error responses. The browser tool’s low-level request inspector was unavailable, so direct fetch probes were used for the relevant API and metadata endpoints.

## 10. Accessibility Findings

No P0-P3 accessibility finding was confirmed in the sampled public flows. Verified behaviors included a working skip link, FAQ aria-expanded state, timeline aria-current state, mobile navigation dialog labeling/close control, keyboard-focus behavior for empty forms, and no visual overflow at mobile size.

The mobile nav trigger remains in the DOM while its dialog is open, but the implementation uses native dialog.showModal(), which makes the rest of the document inert. The sampled tab order remained within the dialog. This is documented under “Issues NOT Worth Fixing,” not reported as a defect.

Limitations: this was not a full screen-reader audit, colorimeter/contrast audit, or exhaustive keyboard traversal of every authenticated control.

## 11. Functional And Logic Findings

The public product pages and their tested interactions work in production. The important functional gaps are P1-001 billing configuration, P1-002 disabled monitoring, P1-003 missing paid entitlement enforcement, P1-005 absent subscription observation writing, and P2-007 misleading manual catalogue creation semantics.

The auth forms correctly validate structured input and use generic password-reset responses. Unauthenticated protected routes redirect safely to login and preserve an internal next path. Successful authenticated CRUD, real billing handoff, monitoring alerts, and reset completion were not executed because no test session was available.

## 12. Code Quality And Maintainability Findings

The codebase has good separation between app routes, feature queries/actions, server integrations, and shared Supabase helpers. Typecheck and lint are clean. The main maintainability risks are the missing core migrations (P1-004), incomplete operational contract (P2-005), corrupted README (P2-010), generated billing type drift (P2-009), duplicated request-bound layout work (P2-006), raw public error contracts (P2-008), and the misleading unused/manual endpoint contract (P2-007).

No unrelated refactor is recommended. These can be corrected in their owning boundaries.

## 13. Performance And Efficiency Findings

### Measured production behavior

Public routes rendered without browser console errors, visible blocking, broken resources, or horizontal overflow in the tested viewports. No authenticated timing claims are made because the protected application was not reachable without a session.

### Source-level optimization opportunities

- P2-003: direct baseline detail query instead of loading all related history.
- P2-006: remove duplicate auth/preference work from public layouts.
- P1-002: the monitoring scheduler processes up to 50 products serially, with eBay requests bounded to a five-second timeout; it needs a real schedule, pagination/progress, and bounded concurrency before scale.
- P2-004: atomic observation upserts avoid duplicate work and retries.

Supabase also reported unused-index informational notices. These were not promoted to findings because this is a new/low-volume system and removing indexes without workload evidence could regress the next monitoring workload.

## 14. Architecture And Data-Flow Findings

The intended data flow is coherent: authenticated user intent enters a server action or protected route; Supabase RLS protects user-owned data; service-role code handles trusted shared catalogue, monitoring, and billing transitions; Stripe controls hosted payment collection; webhook state is reconciled server-side.

The architectural risks are boundary enforcement and reproducibility rather than a need for a rewrite:

- Entitlement computation is not a shared authorization boundary (P1-003).
- Service-role monitoring is reachable through a weak ownership boundary (P2-001).
- Production core RLS exists remotely but its migration source is absent from the repository (P1-004).
- Subscription monitoring is represented in reads but not in the writer path (P1-005).
- Public rendering is more request-bound than necessary (P2-006).

## 15. Build, Type, Lint And Test Results

The following checks were run against the audited repository revision:

| Check | Result |
|---|---|
| npm run build | PASS — Next.js 16.3.4/Turbopack compiled, type validation and page generation completed |
| npm run typecheck | PASS |
| npm run lint | PASS |
| npm test -- --reporter=verbose | PASS — 5 files, 29 tests |
| npm audit --omit=dev --audit-level=moderate | PASS — 0 reported vulnerabilities |
| npm ls --depth=0 | PASS — dependency tree resolved; local optional build modules were extraneous but untracked |
| npm outdated --json | INFO — exits 1 because multiple packages have newer releases; no audit vulnerability was found |

The outdated-package result is a maintenance signal, not a reason for a wholesale upgrade. Next, React, TypeScript, Zod, Tailwind, and other packages have newer releases, but no upgrade was made during this read-only audit.

## 16. Security Audit

### 16.1 Security Posture

🟡 ACCEPTABLE

No hardcoded secret, current production data exposure, open redirect, XSS sink, SQL injection path, unsafe file-upload surface, or unsigned Stripe webhook was found. Production RLS is enabled and the inspected policies use trusted auth.uid() ownership checks. The posture needs work because monitoring authorization/rate limiting is incomplete, paid entitlement enforcement is absent, leaked-password protection is disabled, response headers are incomplete, and core RLS policy source is not version-controlled.

### 16.2 Critical And High Security Findings

No security-severity CRITICAL or HIGH finding was confirmed. The highest security-severity issues are MEDIUM:

- P1-003: paid capability is not consistently authorization-gated.
- P2-001: authenticated arbitrary-product monitoring with service-role writes.
- P2-002: missing abuse controls on expensive payment/monitoring endpoints.
- P2-011: leaked-password protection disabled.

These are not downgraded because of the clean visual/browser result; they are separate server/configuration concerns.

### 16.3 Mandatory Checklist

#### Environment variables and secret management

- 1.1 ✅ PASS — No hardcoded credential values or secret-bearing tracked environment files were found in source or Git history. Local .env files are untracked and ignored; no secret values are reproduced here.
- 1.2 ✅ PASS — .gitignore covers .env*, including .env and .env.local, while allowing .env.example; history scans found no committed environment secret file.
- 1.3 ✅ PASS — Server-only Supabase service-role, Stripe secret, webhook, and eBay credentials are read without public environment prefixes. Supabase URL/publishable key are intentionally public.
- 1.4 ⚠️ PARTIAL — No browser console leak was observed, but several API routes return raw error.message values. See P2-008.
- 1.5 ⚠️ PARTIAL — The production build and public chunks were checked, with no confirmed source-map or secret exposure; exhaustive source-map exposure was not verified.
- 1.6 ✅ PASS — Missing required configuration fails clearly through bounded 503 responses or explicit server errors rather than silently using privileged defaults.

#### Database security

- 2.1 ⚠️ PARTIAL — Production metadata shows RLS enabled on all inspected public tables, but the current repository lacks the core RLS migrations needed to reproduce that posture.
- 2.2 ⚠️ PARTIAL — Production policies exist for private ownership and authenticated catalogue reads; their source is not complete in the current tree.
- 2.3 ✅ PASS — Production write policies use owner checks and WITH CHECK conditions for purchases, subscriptions, baselines, preferences, alerts, and usage events.
- 2.4 ✅ PASS — Inspected policies use auth.uid() or trusted ownership joins rather than mutable end-user metadata for private authorization.
- 2.5 ✅ PASS — Service-role access is confined to server-only modules and server environment variables; no client bundle path was found.
- 2.6 ⬚ N/A — No Supabase Storage bucket or file-upload surface is used by the application.
- 2.7 ✅ PASS — Application access uses Supabase query builders; no user-controlled raw SQL interpolation was found.
- 2.8 ✅ PASS — Inspected SECURITY DEFINER functions pin search_path; the billing claim function also validates session/email/token/status/expiry and is executable only by service_role.

#### Authentication and session management

- 3.1 ✅ PASS — Proxy session refresh plus the protected product layout provide server-side protection for current product routes.
- 3.2 ✅ PASS — Current protected product routes are covered by the product route boundary and protected APIs perform their own checks; the architecture does not rely on a client-only guard.
- 3.3 ✅ PASS — Security-sensitive server code uses getClaims/getUser rather than trusting client-provided identity or getSession-only authorization.
- 3.4 ✅ PASS — The auth callback exchanges the code server-side and constrains redirects to internal app paths.
- 3.5 ✅ PASS — Supabase SSR cookies are used; the billing claim cookie is HttpOnly, SameSite=Lax, and secure in production.
- 3.6 ⚠️ PARTIAL — API routes authenticate callers, but check-now lacks resource ownership, entitlement, and quota checks. See P2-001.
- 3.7 ⬚ N/A — No social/OAuth provider flow was exposed in the audited application.
- 3.8 ⚠️ PARTIAL — Password-reset redirects and generic responses are safe, but provider-configured token lifetime/one-time settings were not accessible for verification.

#### Server-side validation

- 4.1 ✅ PASS — Externally reachable API and action inputs use Zod or provider signature parsing; cron has no user body input.
- 4.2 ✅ PASS — User-owned writes derive identity from the authenticated server context; the separate check-now ownership scope is reported under 3.6.
- 4.3 ✅ PASS — React escaping and strict URL validation are used; the only dangerouslySetInnerHTML is a static trusted design contract.
- 4.4 ❌ FAIL — The cron GET route performs external work and database writes. The bearer secret limits access, but state changes should not be exposed through a safe/idempotent method.
- 4.5 ⚠️ PARTIAL — Billing/webhook errors are generic, but catalogue/monitoring routes can return raw provider/database messages. See P2-008.
- 4.6 ✅ PASS — Stripe webhook events are verified from the raw request body with the configured signature secret.

#### Dependency and package security

- 5.1 ✅ PASS — npm audit for production dependencies reported 0 vulnerabilities at the moderate threshold.
- 5.2 ✅ PASS — No suspicious or hallucinated dependency was confirmed; package names and resolved tree were inspected.
- 5.3 ✅ PASS — package-lock.json is tracked and provides npm lockfile v3 integrity metadata.
- 5.4 ⚠️ PARTIAL — Several packages are outdated, but no actionable vulnerability was identified and no broad upgrade is justified by this audit alone.
- 5.5 ⚠️ PARTIAL — No confirmed unused dependency was found from the top-level tree/import review; a dedicated dependency-use analysis was not run.

#### Rate limiting

- 6.1 ❌ FAIL — Checkout and authenticated monitoring can trigger cost/resource consumption without application rate limits or quotas. See P2-002.
- 6.2 ⚠️ PARTIAL — Supabase provides baseline auth controls, but application login/signup/reset abuse controls were not found and leaked-password protection is disabled.
- 6.3 ⬚ N/A — No custom rate-limit implementation exists to validate; its absence is captured by 6.1 and 6.2.

#### CORS

- 7.1 ✅ PASS — No wildcard CORS configuration was found; APIs are same-origin and no permissive Access-Control-Allow-Origin behavior was observed in safe probes.
- 7.2 ✅ PASS — No credentialed cross-origin API surface is configured.

#### File upload security

- 8.1 ⬚ N/A — No upload endpoint exists.
- 8.2 ⬚ N/A — No application-managed storage bucket is used.
- 8.3 ⬚ N/A — No uploaded content can enter an executable serving path.

### 16.4 Detailed Security Findings

#### FINDING SEC-001

Severity: MEDIUM  
Category: Authorization / resource abuse  
Location: app/api/monitoring/check-now/route.ts:16-44  
CWE: CWE-862, CWE-770

What's wrong: authentication and UUID validation are enforced, but ownership of the requested catalogue product, paid entitlement, and per-user quota are not.

Why it matters: any signed-in user can invoke provider work and service-role observation persistence for a product they did not purchase.

Attack requirements: any normal authenticated account; no privileged database access is required.

Evidence: the route accepts a product ID, calls findProductById, then invokes the service-role monitoring writer; no ownership or rate-limit call is present.

Recommended fix: require an owned purchase/subscription and active entitlement, apply a server-side quota, and make observation writes scoped and idempotent.

Effort: medium.

Verification: two-user staging test; user A must receive 403 for user B’s product, repeated requests must reach a bounded 429, and only authorized observations/alerts may be written.

#### FINDING SEC-002

Severity: MEDIUM  
Category: Rate limiting and resource exhaustion  
Location: app/api/billing/checkout/route.ts:20-58; app/api/monitoring/check-now/route.ts:16-44  
CWE: CWE-770, CWE-799

What's wrong: payment-session creation and external monitoring have no application-level IP/account limit, quota, or complete idempotency contract.

Why it matters: an attacker can create abandoned pending billing state or consume eBay/database capacity.

Attack requirements: network access for checkout; an account for check-now.

Evidence: source review found no rate-limit implementation; the monitoring scheduler is bounded per sweep but not per caller.

Recommended fix: add edge/account limits, checkout idempotency, monitoring quotas, and cleanup for expired pending checkout records.

Effort: medium.

Verification: staging load test demonstrates bounded rows/provider calls and stable 429 behavior.

#### FINDING SEC-003

Severity: MEDIUM  
Category: Authentication hardening  
Location: Supabase production security advisor: auth_leaked_password_protection  
CWE: CWE-521

What's wrong: Supabase reports leaked-password protection disabled.

Why it matters: users may select passwords known to have appeared in breach corpora, increasing credential-stuffing risk.

Attack requirements: a user chooses or reuses a compromised password; this is a preventive-control gap, not evidence of current account compromise.

Evidence: connected Supabase security advisor returned a WARN for this control.

Recommended fix: enable the provider control and verify its behavior in staging.

Effort: small provider configuration change.

Verification: provider setting enabled and a known leaked-password test is rejected without exposing the password in logs.

#### FINDING SEC-004

Severity: LOW  
Category: Error information disclosure  
Location: app/api/catalogue/search/route.ts; app/api/catalogue/manual/route.ts; app/api/monitoring/check-now/route.ts  
CWE: CWE-209

What's wrong: some failure paths serialize error.message directly to the client.

Why it matters: provider, database, or implementation details can aid debugging by an attacker and create unstable public error contracts.

Attack requirements: trigger an error through an authenticated or malformed request.

Evidence: browser logs were clean, but the source returns raw messages.

Recommended fix: map failures to stable public messages and log the original error server-side.

Effort: small.

Verification: forced provider/database failures return only stable public codes/messages.

#### FINDING SEC-005

Severity: LOW  
Category: Security control provenance  
Location: supabase/migrations/20260915000000_stripe_billing_foundation.sql:73-86; missing core migrations in current tree  
CWE: CWE-284

What's wrong: current production RLS is enabled and policies were verified remotely, but core schema/policy source is not present in the repository.

Why it matters: a reset or new environment cannot be proven to have the same isolation controls.

Attack requirements: database recreation or migration drift followed by an authenticated account.

Evidence: production Supabase lists earlier core migrations; current Git tree contains only the billing migration for the application database.

Recommended fix: restore all core migrations and add clean-database cross-user tests.

Effort: medium to large.

Verification: bootstrap an empty staging project only from the current repository and run anonymous/cross-user CRUD tests.

#### FINDING SEC-006

Severity: LOW  
Category: Browser security headers  
Location: next.config.ts:3-6; production root response  
CWE: CWE-693, CWE-1021

What's wrong: HSTS is present, but CSP, nosniff, frame, referrer, and permissions headers were not present in the sampled production response.

Why it matters: browser-side containment and clickjacking defenses are weaker if a future injection or embedding issue appears.

Attack requirements: victim visits an attacker-controlled embedding or framing page; no current XSS was found.

Evidence: safe production GET header inspection.

Recommended fix: add compatible security headers and validate them on page, API, and error responses.

Effort: small to medium.

Verification: deploy and inspect public/protected/API/error response headers.

#### FINDING SEC-007

Severity: LOW  
Category: Account enumeration  
Location: app/auth/actions.ts:32-42; components/marketing/auth-form.tsx:32-35  
CWE: CWE-204

What's wrong: signup provider errors are returned to the user, while password reset correctly uses a generic response.

Why it matters: public signup probing may distinguish registered addresses.

Attack requirements: public requests for candidate addresses.

Recommended fix: make signup failures indistinguishable and retain details server-side.

Effort: small.

Verification: existing and unused addresses produce equivalent public responses.

#### FINDING SEC-008

Severity: LOW  
Category: HTTP method safety  
Location: app/api/cron/monitoring/route.ts:17-20  
CWE: CWE-749

What's wrong: a GET handler performs state changes and outbound work.

Why it matters: method semantics are misleading and can create accidental replays through generic GET tooling.

Attack requirements: access to the cron bearer secret or an authorized scheduler; the secret currently limits practical exposure.

Recommended fix: use POST or a dedicated signed internal job invocation.

Effort: small.

Verification: GET is rejected or made non-mutating; the scheduler uses the explicit write method.

### 16.5 Quick Security Wins

- Enable Supabase leaked-password protection.
- Replace raw client-visible error.message responses with stable generic messages.
- Make signup failures generic.
- Add nosniff, frame, Referrer-Policy, and Permissions-Policy headers.
- Change the cron invocation to an explicit state-changing method while retaining bearer/signature validation.
- Document CRON_SECRET and eBay settings in .env.example without values.

### 16.6 What's Already Done Right

- Service-role Supabase access is server-only and not public-prefixed.
- Supabase SSR cookies are used instead of client-managed bearer tokens.
- Internal redirects are constrained to safe /app paths and reject protocol-relative/backslash variants.
- Stripe webhooks verify the raw body signature before trusting event data.
- Billing claim tokens use random bytes and store only a hash.
- Stripe card entry is delegated to hosted Checkout/Portal rather than handled by the application.
- eBay URLs use exact host allowlists, HTTPS, redirect blocking, DNS/private-address checks, and request timeouts.
- No file-upload or executable content surface was found.
- React output is escaped; the only raw HTML insertion is a static trusted string.
- Production RLS metadata currently shows owner-scoped write policies on private tables.

### 16.7 Security Checklist Summary

1.1 ✅  1.2 ✅  1.3 ✅  1.4 ⚠️  1.5 ⚠️  1.6 ✅  
2.1 ⚠️  2.2 ⚠️  2.3 ✅  2.4 ✅  2.5 ✅  2.6 ⬚  2.7 ✅  2.8 ✅  
3.1 ✅  3.2 ✅  3.3 ✅  3.4 ✅  3.5 ✅  3.6 ⚠️  3.7 ⬚  3.8 ⚠️  
4.1 ✅  4.2 ✅  4.3 ✅  4.4 ❌  4.5 ⚠️  4.6 ✅  
5.1 ✅  5.2 ✅  5.3 ✅  5.4 ⚠️  5.5 ⚠️  
6.1 ❌  6.2 ⚠️  6.3 ⬚  
7.1 ✅  7.2 ✅  
8.1 ⬚  8.2 ⬚  8.3 ⬚

## 17. What's Already Done Well

The application does not need a broad rewrite. The most reusable strengths are:

- The route-group structure gives public and product areas clear ownership.
- Supabase access is split between user-scoped SSR and server-only privileged operations.
- Auth callback redirect validation is narrow and understandable.
- The billing claim flow has careful email, token, expiry, and one-time checks.
- Webhook idempotency records and hosted Stripe pages provide a good payment boundary.
- URL safety is stricter than a simple hostname check and rejects private address targets.
- Inputs are bounded with schemas and the application avoids raw SQL interpolation.
- The public design system is consistent and responsive.
- Local build, lint, typecheck, and tests are already green.

## 18. Quick Wins

- Set the production site URL and required Stripe values; verify checkout/claim/portal.
- Configure CRON_SECRET and the monitored-source variables; add a scheduler invocation.
- Add the missing operational variables to .env.example.
- Enable leaked-password protection.
- Hide raw API error details.
- Add core response security headers.
- Make signup failures generic.
- Add /coverage and /data-privacy to the sitemap.
- Correct README.md before the next handoff.
- Add a production smoke test for billing and monitoring configuration.

## 19. Prioritised Remediation Plan

| Order | Findings | Action | Why this order | Effort | Prerequisite | Verification |
|---|---|---|---|---|---|---|
| 1 | P1-001, P1-002, P2-005 | Correct production billing/monitoring configuration and track the scheduler contract | Current paid and monitoring workflows are visibly unavailable | Small-medium | Deployment access and provider values | Safe production status probes; staging billing/cron smoke tests |
| 2 | P1-003, P2-001, P2-002 | Build one entitlement/ownership/rate-limit boundary and apply it to Pro actions | Prevents paid-feature bypass and service/provider abuse | Medium | Confirm product entitlement semantics | Free/active/expired account matrix; two-user authorization and 429 tests |
| 3 | P1-004 | Restore complete core schema/RLS migrations and bootstrap tests | Makes production isolation reproducible and prevents migration drift | Medium-large | Identify canonical remote migration source | Empty staging project bootstrapped from Git; cross-user CRUD tests |
| 4 | P1-005 | Implement subscription observation writes and alert transitions | Removes a product path that is currently represented only by reads | Medium | Define supported subscription source/semantics | Fixture and end-to-end monitoring tests |
| 5 | P2-004, P2-003 | Make monitoring writes atomic and detail queries direct/paginated | Reduces duplicate work and history-dependent latency/data errors | Medium | Canonical schema constraints | Concurrent writer test and large-history query test |
| 6 | P2-006, P2-009 | Narrow request-bound layout work and regenerate typed database bindings | Improves public rendering and compile-time drift detection | Medium | Core schema source restored | Build/typecheck plus public route smoke test |
| 7 | P2-008, P2-011, P3-001, P3-002, P3-004 | Apply error, auth-provider, header, signup, and method hardening | Low effort security improvements after core boundaries are stable | Small | Deployment/provider access | Header/error/abuse regression tests |
| 8 | P2-007, P2-010, P3-003 | Correct misleading endpoint semantics, README, and sitemap | Improves integration and operational handoff without changing architecture | Small | None | API contract test, clean checkout onboarding, sitemap diff |

## 20. Suggested Implementation Batches

### Batch A: Production unblock

Findings: P1-001, P1-002, P2-005.  
Configure site/billing/cron/eBay values, add the scheduler contract, and run safe production smoke checks.

### Batch B: Authorization and abuse boundary

Findings: P1-003, P2-001, P2-002.  
Implement a shared entitlement/ownership guard, quotas, idempotency, and the free/paid test matrix.

### Batch C: Database provenance and monitoring correctness

Findings: P1-004, P1-005, P2-004.  
Restore core migrations, regenerate types, implement subscription observation writes, and make observation persistence atomic.

### Batch D: Query and rendering efficiency

Findings: P2-003, P2-006, P2-009.  
Direct-query baseline details, isolate public layout work, and restore generated billing types.

### Batch E: Security and handoff hygiene

Findings: P2-008, P2-011, P2-010, P3-001, P3-002, P3-003, P3-004, P2-007.  
Harden public error/header/auth behavior, correct the endpoint contract, and repair operational documentation/metadata.

## 21. Issues NOT Worth Fixing

- The mobile navigation trigger remaining in the DOM while a native modal dialog is open is intentional framework/browser behavior; showModal() makes the rest of the document inert, and the sampled tab order stayed inside the menu.
- The static dangerouslySetInnerHTML design-contract block is a constant controlled by the repository, not user content; replacing it solely to remove the API would add churn without reducing a demonstrated risk.
- Supabase unused-index notices are informational. Removing indexes from a new monitoring workload without measured query plans is not justified.
- Newer package versions are not automatically a defect. npm audit found no production vulnerability, so a wholesale dependency upgrade is not recommended by this audit.
- Local extraneous optional image/build modules were not tracked repository changes and did not affect the build.
- The historical Vercel runtime error cluster was tied to an older deployment, not the matched current revision, so it is not promoted as a current production finding.
- No visual redesign is justified by the sampled production pages; they were clean at all tested viewport sizes.

## 22. Unverified Areas And Audit Limitations

- Authenticated product screens and successful user actions were not runtime-tested because no authorized test account/session was available. Static route/action/query review and unauthenticated redirect checks were performed instead.
- No real Stripe charge, live checkout completion, webhook delivery, purchase creation, or customer-portal session was performed.
- No production monitoring job was allowed to run against real user data or external provider capacity. Safe unauthenticated endpoint probes and source review were used.
- No private user data or another user’s records were accessed.
- Full Supabase provider settings beyond connected metadata/advisors, including password-reset token lifetime, were not available.
- An exhaustive source-map exposure enumeration was not completed.
- Browser low-level request inspection was unavailable; direct fetch probes inspected the relevant production responses, robots/sitemap, and API errors.
- A full screen-reader, contrast, and exhaustive keyboard audit was not performed.
- The requested Codex Security Deep Scan could not start. Its exact terminal error was: “Codex Security Deep Scan discovery did not start or rejoin. Deep Scan cannot safely start a read-only worker: the parent must provide a managed filesystem permission profile.” No deep-scan artifacts or deep-scan findings were produced; the security section above is based on the manual repository, production, Supabase, and dependency evidence.

### Completion gates

Browser gate: passed for all discovered public production pages; protected pages were safely tested as unauthenticated redirects and explicitly marked blocked; major public navigation/forms/states, desktop/tablet/mobile layouts, console output, resources, and safe failed API states were checked.

Repository gate: passed for routing, first-party application areas relevant to the audit, API/server routes, auth boundaries, database access, integrations, environment usage, dependency health, build/type/lint/test health, security checklist completeness, and production/repository distinction.

Quality-control pass: completed. Findings were deduplicated, tied to code/configuration/runtime evidence, assigned confidence and priority, and kept separate from observations that are not worth fixing.

