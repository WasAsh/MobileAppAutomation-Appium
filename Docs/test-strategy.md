# Test Strategy — Swag Labs Android E2E

How this suite (`test/`, WebdriverIO 9 + Appium 3 + TypeScript + Mocha)
decides what to cover, how it stays stable, and where it knowingly stops.
Run instructions live in `README.md` and are not duplicated here.

## Scope

- **In scope**: authentication (positive + negative), product listing,
  add-to-cart, remove-from-cart, and the full checkout flow
  (cart → information → overview → complete) of the Sauce Labs Swag Labs
  sample app, Android **v2.3.0** (`com.swaglabsmobileapp` / `.MainActivity`).
- **Out of scope** (deliberate, not gaps): iOS, multi-device matrix,
  performance testing, visual regression — premature for a 6-spec suite.
  The `problem_user` broken-images quirk is explicitly excluded from
  assertions: it is visual-only and undetectable in the accessibility tree
  (see `test/specs/problem-user.spec.ts` header comment).

## Devices & environments

- **Local**: `Medium Phone API 37` emulator (defaults in `wdio.conf.ts`
  via `ANDROID_DEVICE_NAME`; override with `.env`).
- **CI** (`.github/workflows/android.yml`): `pixel_2` emulator,
  API 34 (`google_apis`, `x86_64`), KVM enabled, pinned 2.3.0 APK
  downloaded at runtime (no APK committed), `tsc` gate, `pnpm test:all`.
- Capabilities are env-driven (`ANDROID_DEVICE_NAME`,
  `ANDROID_PLATFORM_VERSION`, `ANDROID_APP_PATH`, `APPIUM_PORT`); without
  `ANDROID_APP_PATH` the suite drives the installed app instead of
  installing the APK. Single session at a time (`maxInstances: 1`).

## Suites

| Suite | Selection | Purpose |
|---|---|---|
| `smoke` | `--suite smoke` (`smoke.spec.ts`, `@smoke`) | 1 test: app launches to login. Fast health check. |
| `regression` | `--suite regression` (5 specs, `@regression`) | 8 tests: login negatives, cart add/remove, problem-user parity, checkout E2E. |

Mocha title tags (`@smoke`/`@regression`) are mirrored by WDIO `suites`
in `wdio.conf.ts`; each spec gets an Allure feature (`Smoke`,
`Shopping cart`, `Checkout`, `Authentication`) via the `beforeTest` hook.

## Coverage (6 files / 9 tests)

- `smoke.spec.ts` — launch → login screen visible.
- `add-to-cart.spec.ts` — `standard_user` login → PRODUCTS → first product
  → cart shows its name.
- `remove-from-cart.spec.ts` — add → cart → `~test-REMOVE` → product gone
  (`reverse` `waitForExist`) and cart empty (REMOVE gone; CHECKOUT/CONTINUE
  SHOPPING remain, so emptiness asserts on REMOVE).
- `problem-user.spec.ts` — `problem_user` logs in and shops exactly like
  `standard_user`; pins observable behavior, documents the visual-only quirk.
- `checkout.spec.ts` — add → cart → `~test-CHECKOUT` → info
  (`John`/`Doe`/`12345`) → overview → FINISH → `CHECKOUT: COMPLETE!` +
  `THANK YOU FOR YOU ORDER`.
- `login-negative.spec.ts` (4 tests) — locked-out, invalid credentials,
  empty username, empty password, each with its exact error string.

## Test data (`test/data/users.ts`)

Public demo credentials, no secrets: `standardUser`, `lockedOutUser`,
`problemUser`, `invalidUser` (`secret_sauce` password family) and
`checkoutInfo` (`John`/`Doe`/`12345`). `.env` stays local and gitignored.

## Isolation & determinism

- Every `@regression` spec runs `beforeEach(browser.reloadSession())` —
  each test starts from a fresh app install state, so suite order cannot
  leak login/cart state. (Smoke has a single stateless test; no hook needed.)
- Product lookups scope to the **first `test-Item` container** and read the
  name from its `test-Item title` child — verified pairing under any sort
  order, no hardcoded product names.
- `removeProduct()` assumes a single-item cart (fresh session + one add),
  documented in `CartPage.ts`; absence is asserted with reverse
  `waitForExist` (10 s), never with sleep.
- Selector priority: accessibility-id (`~test-*`) → `UiSelector`
  description/text. Below-the-fold elements (checkout FINISH) go through
  `BasePage.scrollToElement` (`UiScrollable.scrollIntoView`); plain
  selectors everywhere else.

## Reporting

- Allure raw results → `reports/allure-results`; run environment
  (device/app/port) recorded via `reportedEnvironmentVars`; failure
  screenshots auto-attached by the `afterTest` hook; Appium server log
  mirrored to `reports/wdio-appium.log` via the service `logPath`.
- HTML report: `pnpm report:allure` (needs the external `allure` CLI —
  intentionally not a project dependency) then `allure open
  reports/allure-report`. `reports/` is gitignored.
- CI uploads raw `reports/` as the `test-results` artifact (`if: always()`,
  14-day retention). Publishing viewable HTML from CI is a recorded,
  deferred step (see `next-phase-plan.md` T7) — raw results only for now.

## Defect triage

1. Read the failure screenshot + spec reporter output for the failing step.
2. Check `reports/wdio-appium.log` for install/session/device errors
   (cold-emulator `uiautomator2ServerInstallTimeout` trips are evidenced
   there, not guessed).
3. For selector doubt, dump the live hierarchy with a temporary spec and
   diff normalized page source (established pattern from T2/T6); delete
   the temp spec after.
4. Re-run the single spec (`--spec`) to confirm, then the full suite.
5. Fix minimally: real selectors and helpers only — no timeout increases,
   no new dependencies, no CI emulator changes without server-log evidence.

## Known limitations

- Single API level (34 in CI); no smoke-fast vs full-split scheduling.
- No Allure history/trend across runs (needs the deferred CI publish step).
- No committed APK or screenshots of record, except
  `Docs/assets/checkout-overview.png` (CHECKOUT: OVERVIEW screen, captured
  automatically by the suite's failure-screenshot hook — see README).
