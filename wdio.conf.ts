import 'dotenv/config'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { addFeature } from '@wdio/allure-reporter'

if (!process.env.APPIUM_HOME) {
    process.env.APPIUM_HOME = path.dirname(fileURLToPath(import.meta.url))
}

const deviceName = process.env.ANDROID_DEVICE_NAME || 'Medium Phone API 37'
const platformVersion = process.env.ANDROID_PLATFORM_VERSION
const appPath = process.env.ANDROID_APP_PATH
const appiumPort = process.env.APPIUM_PORT ? parseInt(process.env.APPIUM_PORT, 10) : 4723

const androidCaps: Record<string, unknown> = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': deviceName,
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 120,
    'appium:adbExecTimeout': 60000,
    // Cold CI emulators can take well over the driver's 60 s default to
    // install the UiAutomator2 server APK on first session; raise only this
    // ceiling (evidenced CI tripwire). All other timeouts stay as-is so a
    // genuinely wedged device still fails fast with clear errors.
    'appium:uiautomator2ServerInstallTimeout': 180000,
    'appium:androidDeviceReadyTimeout': 120000,
}

if (platformVersion) {
    androidCaps['appium:platformVersion'] = platformVersion
}

if (appPath) {
    androidCaps['appium:app'] = appPath
} else {
    androidCaps['appium:appPackage'] = 'com.swaglabsmobileapp'
    androidCaps['appium:appActivity'] = '.SplashActivity'
}

const featureBySpec: Record<string, string> = {
    'smoke.spec.ts': 'Smoke',
    'add-to-cart.spec.ts': 'Shopping cart',
    'login-negative.spec.ts': 'Authentication',
}

export const config = {
    runner: 'local',

    specs: ['./test/specs/**/*.ts'],

    suites: {
        smoke: ['./test/specs/smoke.spec.ts'],
        regression: ['./test/specs/add-to-cart.spec.ts', './test/specs/login-negative.spec.ts'],
    },

    maxInstances: 1,

    capabilities: [androidCaps],

    logLevel: 'info',

    bail: 0,

    waitforTimeout: 10000,

    connectionRetryTimeout: 120000,

    connectionRetryCount: 3,

    framework: 'mocha',

    reporters: [
        'spec',
        [
            'allure',
            {
                outputDir: 'reports/allure-results',
                disableWebdriverStepsReporting: true,
                disableWebdriverScreenshotsReporting: false,
                reportedEnvironmentVars: {
                    DEVICE: deviceName,
                    APP: appPath ?? 'com.swaglabsmobileapp',
                    APPIUM_PORT: String(appiumPort),
                },
            },
        ],
    ],

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
    },

    beforeTest: async function (test: { file?: string }) {
        const file = (test.file ?? '').split(/[\\/]/).pop() ?? ''
        addFeature(featureBySpec[file] ?? 'Mobile app')
    },

    afterTest: async function (_test: unknown, _context: unknown, { passed }: { passed: boolean }) {
        if (!passed) {
            await browser.takeScreenshot()
        }
    },

    services: [
        [
            'appium',
            {
                command: 'appium',
                // Diagnostic only: mirror the Appium server log (adb installs,
                // app launches, session errors) into reports/, which CI
                // uploads even on failure. No behavior change to the suite.
                logPath: 'reports',
                args: {
                    port: appiumPort,
                },
            },
        ],
    ],
}
