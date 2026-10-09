// Registers the pnpm-installed UiAutomator2 driver in Appium's extensions manifest.
//
// Why this exists: Appium's own `driver install` shells out to npm, which cannot
// operate on pnpm's symlinked node_modules, and Appium's package scan does not
// follow pnpm symlinks either — so the driver would otherwise stay invisible to a
// project-local APPIUM_HOME. This reuses Appium's own Manifest logic, so the entry
// always matches the installed driver version. Runs via the `postinstall` hook,
// making a fresh `pnpm install` end with a working local driver. Idempotent.
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const appiumHome = process.env.APPIUM_HOME ?? projectRoot

const { Manifest } = require('appium/build/lib/extension/manifest.js')
const { INSTALL_TYPE_NPM } = require('appium/build/lib/extension/extension-config.js')

const driverPkgPath = path.join(appiumHome, 'node_modules', 'appium-uiautomator2-driver', 'package.json')
if (!existsSync(driverPkgPath)) {
    throw new Error(`Driver package not found at ${driverPkgPath}. Run 'pnpm install' first.`)
}
const driverPkg = JSON.parse(readFileSync(driverPkgPath, 'utf8'))

const manifest = new Manifest(appiumHome)
await manifest.read()
const changed = manifest.addExtensionFromPackage(driverPkg, driverPkgPath, INSTALL_TYPE_NPM)
await manifest.write()
console.log(
    changed
        ? `Registered driver '${driverPkg.appium.driverName}' (${driverPkg.name}@${driverPkg.version}) in ${appiumHome}`
        : `Driver '${driverPkg.appium.driverName}' already registered in ${appiumHome}`,
)
