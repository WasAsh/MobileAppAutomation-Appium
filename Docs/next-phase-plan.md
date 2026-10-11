# Next-Phase Plan — Mobile Automation (Appium)

Baseline (green, do not regress): WebdriverIO 9 + Appium 3 + TypeScript + Mocha,
POM (`test/pageobjects`), Sauce Labs Swag Labs Android 2.3.0,
smoke/regression suites, Allure + failure screenshots, GitHub Actions API 34 E2E green.
Details in `README.md`; this file plans only what comes next. No code, test,
dependency, or CI changes are made by this plan.

## 1. Current coverage

- `smoke.spec.ts` — app launches to login screen.
- `add-to-cart.spec.ts` — `standard_user` login → PRODUCTS → first product
  → cart → YOUR CART shows product name.
- `login-negative.spec.ts` (4 tests, `reloadSession` per test) — locked-out,
  invalid credentials, empty username, empty password with exact error strings.
- Page objects: `BasePage` (wait/tap/type), `LoginPage` (accessibility-id
  username/password, `LOGIN` button, error text), `ProductsPage`, `CartPage`.
- Data: `standardUser`, `lockedOutUser`, `problemUser`, `invalidUser`.
- Config/reporting/CI: `maxInstances: 1`, Allure features + env vars, Appium
  server log mirrored to `reports/` (`logPath`), API 34 emulator, pinned APK,
  `tsc` gate, `reports/` artifact on always.

## 2. Genuine gaps (ranked by value)

1. **Checkout flow untested** — the app's core purchase path
   (cart → checkout → info → overview → complete) has zero coverage.
2. **`problemUser` defined but unused** — dead test data; its known quirks
   (e.g. broken product images) are unasserted.
3. **Cart removal uncovered** — add-then-remove → empty-state path missing.
4. **`ProductsPage` coupling** — `getFirstProductName()` hardcodes
   `"Sauce Labs Backpack"` while `addFirstProductToCart()` taps
   `ADD TO CART instance(0)`; sort-order change silently mismatches them.
5. **Session hygiene inconsistent** — negative spec reloads per test,
   happy-path specs don't; suite order can leak logged-in/cart state.
6. **No scroll/gesture helper** — everything resolves without scrolling;
   longer lists and smaller screens will flake.
7. **Reporting stops at artifacts** — Allure needs an external CLI, no
   published report/history in CI.
8. **CI breadth** — single API level (34), no smoke-fast vs full-split
   strategy documented, no scheduled run.
9. **Portfolio finish** — no status badge, no test-plan summary beyond README.

Non-gaps (deliberately out of scope): iOS coverage, multi-device matrix,
performance testing, visual regression — premature for this suite size.

## 3. Sequential tasks (small, in order)

### T1 — Checkout happy-path E2E (highest value) — DONE 2026-10-10
Added `test/pageobjects/CheckoutPage.ts` (info fill → finish → complete
assert, reusing `BasePage`), `CartPage.proceedToCheckout()` (`~test-CHECKOUT`),
`checkoutInfo` (`John`/`Doe`/`12345`) in `test/data/users.ts`, and
`test/specs/checkout.spec.ts` (`@regression`, wired into `suites.regression`
+ Allure `Checkout` feature). Final assert: `CHECKOUT: COMPLETE!` title +
`THANK YOU FOR YOU ORDER`, all selectors verified against the live app
(Medium Phone API 37 emulator, Swag Labs 2.3.0).
Finding: FINISH sits below the fold on the overview screen — the page
object's `finishButton` getter scrolls it into view via `UiScrollable`
(scoped to that getter; no `BasePage`/existing-PO changes).
Acceptance: `tsc` clean; new spec green 3/3 local runs; full suite green
(4 files / 7 tests); no changes to existing selectors, timeouts, deps, or CI.

### T2 — Decouple product name from hardcoded string — DONE 2026-10-10
`ProductsPage` now scopes both lookups to the first `test-Item` container:
name from its `test-Item title` child, tap on its `test-ADD TO CART` child
(container + child IDs verified in a live hierarchy dump: each `test-Item`
holds title, `test-Price`, and `test-ADD TO CART`). Hardcoded
`"Sauce Labs Backpack"` and text-based `ADD TO CART` selector removed.
Acceptance: `tsc` clean, no new dependencies; add-to-cart + checkout green
under default sort, and a temporary sort-check spec (deleted after) proved
pairing under `Name (Z to A)` — first item resolved as
`Test.allTheThings() T-Shirt (Red)`, added and cart-verified; full suite
green (4 files / 7 tests). No CI, timeout, emulator, or unrelated changes.

### T3 — Cart add-then-remove spec — DONE 2026-10-10
New `test/specs/remove-from-cart.spec.ts` (`@regression`, wired into
`suites.regression` + Allure `Shopping cart` feature): login → add first
product → open cart → assert visible → `removeProduct()` → assert
`isProductRemoved(name)` + `isCartEmpty()`. `CartPage` gained `removeButton`
(`~test-REMOVE`), `removeProduct()`, and reverse-`waitForExist` negative
asserts (no `BasePage` changes). Selectors verified in live dumps: cart row
is a `test-Item` holding Amount/Description(title)/Price/`test-REMOVE`, and
after the tap the item, REMOVE, Amount, Description, and Price nodes are all
gone (CHECKOUT/CONTINUE SHOPPING remain, so emptiness asserts on REMOVE).
Acceptance: `tsc` clean, no new dependencies; new spec green first run;
full suite green (5 files / 8 tests). No CI, timeout, emulator, or
unrelated changes.

### T4 — Session isolation for happy-path specs — DONE 2026-10-10
Added the `login-negative` pattern verbatim to `add-to-cart`, `checkout`,
and `remove-from-cart` specs: `beforeEach(async () => { await
browser.reloadSession() })` + `beforeEach` mocha import. No page objects,
config, or other files touched.
Acceptance: `tsc` clean; full suite green (5 files / 8 tests);
`checkout.spec.ts` also verified standalone via `--spec`. No order
dependence; no CI, timeout, emulator, or dependency changes.

### T5 — Scroll-to-element helper in `BasePage` — DONE 2026-10-10
The helper was warranted, not forced: T1 had already evidenced the need
(FINISH below the fold, failing run → passing scroll run), and the
`UiScrollable(...).scrollIntoView(...)` boilerplate was buried inside a
selector string where future screens would re-derive it. Added
`BasePage.scrollToElement(innerSelector)` (protected, same convention as
`tap`/`type`) and converted the single consumer — `CheckoutPage.finishButton`
now calls `scrollToElement('new UiSelector().description("test-FINISH")')`.
The generated UIAutomator string is identical to the proven inline version,
so verified selector behavior is preserved.
Acceptance: `tsc` clean; no test modified; checkout spec green; full suite
green (5 files / 8 tests). No CI, timeout, emulator, or dependency changes.

### T6 — Cover `problemUser` intentionally — DONE 2026-10-10
Observed on the live app (Medium Phone API 37, Swag Labs 2.3.0), no
assumptions: `problem_user`/`secret_sauce` logs in successfully with no
error; its PRODUCTS screen is hierarchy-identical to `standard_user`'s
(normalized page-source diff of live dumps: zero semantic differences —
same `test-Item`/title/price/button/image nodes); its documented broken-
images quirk is visual-only and not assertable from the accessibility tree.
A temporary functional probe (deleted after) then confirmed add-to-cart
works (`Sauce Labs Backpack` added and cart-verified).
New `test/specs/problem-user.spec.ts` (`@regression`, T4 `reloadSession`
pattern, `Shopping cart` Allure feature) pins the observable behavior —
login → PRODUCTS → add first product → cart shows it — with a spec comment
quoting the dump finding so nobody later "fixes" it by asserting broken
images. Acceptance: `tsc` clean; new spec green; full suite green (6 files /
9 tests). No CI, timeout, emulator, or dependency changes.

### T7 — Reporting + CI polish (no behavior change to tests)
LOCAL PORTION — DONE 2026-10-11. `README.md` rewritten from the actual
repo: CI status badge (`actions/workflows/android.yml/badge.svg?branch=
master` — repo `WasAsh/MobileAppAutomation-Appium`, workflow
`android.yml`, default branch `master`, all verified), test-coverage table
(6 specs / 9 tests, verified by spec + `it(` grep), prerequisites, setup
(`.env` keys, emulator boot, `.MainActivity` — fixing the stale
`.SplashActivity` reference), all `package.json` scripts, Allure
instructions (raw `reports/allure-results` + `allure-report` paths,
external CLI install via `npm i -g allure-commandline` / Scoop,
`allure open`, env vars + failure screenshots + `wdio-appium.log`,
`reports/` gitignored), accurate CI description, updated layout (4 page
objects, 6 specs, `Docs/`). No dependency change: the Allure CLI stays
external (documented, not added) — bundling a JVM tool into
`package.json` buys nothing until CI publishes HTML.
Checks: `tsc` clean (exit 0); all 18 README-referenced paths verified to
exist; `.github/workflows/android.yml` untouched. No test, emulator,
timeout, or dependency changes.
CI PORTION — DEFERRED to the final integration pass (workflow NOT edited
yet). Required change in `.github/workflows/android.yml`, inserted between
the E2E step and `Upload test results`: a `Generate Allure report` step
that installs the CLI (`npm install -g allure-commandline`) and runs
`pnpm report:allure`, so the existing `test-results` artifact (raw
`reports/` upload, `if: always()`, 14-day retention) contains a viewable
`reports/allure-report` HTML report alongside `allure-results`. Optional
follow-up (not required for acceptance): history/trend via `gh-pages`.
Acceptance: green run uploads viewable report; README badge reflects
`master`; suite timing unchanged.

### T8 — Portfolio readiness pass — DONE 2026-10-11
New `Docs/test-strategy.md` (no setup duplication — run instructions stay
in README only): scope (auth/cart/checkout on Swag Labs Android 2.3.0;
iOS/matrix/perf/visual explicitly out), devices (local Medium Phone API
37, CI pixel_2 API 34), smoke vs regression suites + Allure features,
coverage (6 files / 9 tests, verified against specs), test data
(`users.ts` public demo creds + `checkoutInfo`), isolation
(`reloadSession` per regression test), selector strategy (accessibility-id
first, `test-Item` container scoping, reverse-`waitForExist`, single
`scrollToElement` consumer), reporting paths + deferred CI publish pointer,
5-step defect triage, known limitations. Every claim re-read from
`test/specs/*.spec.ts`, `test/pageobjects/*.ts`, `wdio.conf.ts`.
README gained a Screenshots section with one genuine image:
`Docs/assets/checkout-overview.png` — the CHECKOUT: OVERVIEW screen copied
byte-identical (182,636 bytes) from `reports/allure-results/`
(`*-attachment.png`, captured by the suite's own `afterTest` hook); no
fabrication, no new dependencies, no emulator run needed (`adb devices`
empty, and a fresh capture would only duplicate it). Layout `Docs/` line
updated. No test, workflow, emulator, timeout, or dependency changes.
Checks: `tsc` clean (exit 0); README + strategy cross-links verified
(`Docs/test-strategy.md`, `Docs/assets/checkout-overview.png`,
`.env.example`, `wdio.conf.ts` all resolve); `.github/workflows/
android.yml` untouched.
Acceptance: no duplicated setup docs; links resolve; reviewer can run
`pnpm install / test / report:allure` from README alone (scripts unchanged
and re-verified in `package.json`).

## 4. Guardrails for every task
- One task at a time; keep the CI baseline green (`tsc` + `pnpm test:all`).
- No timeout increases, no new dependencies, no CI emulator changes unless
  the Appium server log in `reports/` evidences the need.
- Prefer accessibility-id selectors over `UiSelector().text()`.
- Never commit secrets; `.env` stays local.

## 5. Final review (T1–T8) — 2026-10-11, local only, nothing committed
Baseline: HEAD `795d4cc`. Tracked diff (7 files) maps exactly to T1–T6:
`users.ts` (+`checkoutInfo`), `BasePage` (+`scrollToElement`), `CartPage`
(+checkout/remove/negative asserts), `ProductsPage` (container-scoped
lookups, hardcoded name removed), `add-to-cart.spec.ts` (+`reloadSession`),
`wdio.conf.ts` (+3 specs in `suites.regression` + Allure features),
`README.md` (T7/T8 rewrite). Untracked: `CheckoutPage.ts`,
`checkout/problem-user/remove-from-cart` specs, `Docs/` (plan, strategy,
`screenshots` asset). No accidental changes; `package.json`/`pnpm-lock`
untouched; no timeout, emulator, or dependency changes anywhere.
Docs verified against re-read sources: 6 spec files / 9 `it` blocks,
6 suite tags, `reloadSession` in all 5 regression specs (smoke correctly
exempt); README image path + strategy cross-links resolve on disk; badge
URL matches remote/branch/workflow; `.MainActivity` fix confirmed in
`wdio.conf.ts`. No corrections required — nothing fixed.
Validation: `tsc` clean (exit 0). Full local suite NOT re-run — no
emulator attached (`adb devices` empty) and settings must not be changed
to force it; last full green was T6 (6 files / 9 tests), T7–T8 are
docs-only so the suite is unaffected. Outstanding: one emulator-backed
`pnpm test:all` before any commit, plus CI green after the deferred change.
Workflow `git diff HEAD` empty — unchanged. Deferred T7 CI change (not
implemented): in `.github/workflows/android.yml`, insert a `Generate
Allure report` step between the E2E step and `Upload test results`
(`npm install -g allure-commandline` + `pnpm report:allure`) so the
`test-results` artifact ships viewable `reports/allure-report`; only that
file would change in the later CI integration. Risks: committed run will
also commit `Docs/` (new dir) + 4 new test files — review the `git add`
set; Allure CLI install adds ~1 min to CI; no history/trend until a
follow-up `gh-pages` step.
