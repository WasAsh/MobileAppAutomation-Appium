# Mobile Automation with Appium

Android end-to-end tests for the [Sauce Labs Swag Labs sample app](https://github.com/saucelabs/sample-app-mobile),
built with **WebdriverIO 9 + Appium 3 + TypeScript**, Page Object Model, Allure reporting,
tagged smoke/regression suites, and GitHub Actions CI on an API 34 emulator.

## Prerequisites

- Node.js 24, pnpm 11
- Java 17+, Android SDK with an emulator (e.g. Pixel, API 34+)
- Swag Labs app **v2.3.0** installed on the emulator, or point `ANDROID_APP_PATH`
  at the APK ([release asset](https://github.com/saucelabs/sample-app-mobile/releases/download/2.3.0/Android.SauceLabs.Mobile.Sample.app.2.3.0.apk))
- No global Appium install needed: Appium 3 and the UiAutomator2 driver are
  project-local devDependencies; `postinstall` registers the driver automatically

## Setup

```bash
pnpm install
cp .env.example .env   # then fill in local values; never commit .env
```

`.env` keys: `ANDROID_DEVICE_NAME`, `ANDROID_PLATFORM_VERSION`, `ANDROID_APP_PATH`, `APPIUM_PORT`.
Without `ANDROID_APP_PATH`, the suite drives the installed
`com.swaglabsmobileapp` / `.SplashActivity` instead.

## Run

```bash
pnpm test                # full suite (default WDIO specs glob)
pnpm test:smoke          # @smoke suite only
pnpm test:regression     # @regression suites only
pnpm test:all            # full suite (explicit)
pnpm exec tsc --noEmit   # typecheck
pnpm report:allure       # generate reports/allure-report (needs the `allure` CLI)
```

With no arguments, `pnpm test` and `pnpm test:android` both run the full suite.

## Conventions

- Page objects in `test/pageobjects` (shared waits/taps/types in `BasePage`);
  demo users in `test/data/users.ts` (public `secret_sauce` demo credentials).
- Suites carry Mocha title tags (`@smoke`, `@regression`), mirrored by WDIO
  `suites` in `wdio.conf.ts` for `--suite` selection.
- Failures auto-attach a screenshot to Allure (`afterTest` + `takeScreenshot`);
  each spec is labelled with an Allure feature (`beforeTest` hook) and the run
  environment (device/app/port) is recorded in the report.
- CI (`.github/workflows/android.yml`, push + PR): Java 17, API 34 emulator,
  pinned Swag Labs 2.3.0 APK, `tsc` + full suite, `reports/` uploaded even on failure.

## Layout

```text
test/pageobjects   Login / Products / Cart page objects over BasePage
test/data          demo users (standard, locked-out, problem, invalid)
test/specs         smoke, add-to-cart E2E, login-negative
scripts/           postinstall: register pnpm-installed UiAutomator2 driver
wdio.conf.ts       caps, suites, reporters, Allure hooks (env-driven, no secrets)
.github/workflows  Android E2E CI
```
