#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginName = 'plugin-popular-content'

const TEMPLATES_SRC = path.resolve(__dirname, '../views/')
const TEMPLATES_DEST = path.resolve(
    process.cwd(),
    `views/vendor/${pluginName}/`
)

const PACKAGE_JSON_PATH = path.resolve(process.cwd(), 'package.json')
const EXPECTED_PACKAGE_NAME = 'dummy' // for test-only override

const packageJsonExists = fs.existsSync(PACKAGE_JSON_PATH)
let shouldProceed = false

if (packageJsonExists) {
    try {
        const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'))
        shouldProceed =
            pkg.name === EXPECTED_PACKAGE_NAME || pkg.name.startsWith('nera')
    } catch (e) {
        console.error(`❌ Error reading package.json: ${e.message}`)
        shouldProceed = false
    }
}

if (!shouldProceed) {
    console.error(
        '❌ Please run this command from the root of your Nera project (where the plugin is installed).'
    )
    process.exit(1)
}

if (fs.existsSync(TEMPLATES_DEST)) {
    console.log(`⚠️ Templates already exist at ${TEMPLATES_DEST}. Skipping.`)
    process.exit(0)
}

// Create destination directory
fs.mkdirSync(TEMPLATES_DEST, { recursive: true })

// Copy all .pug files from views directory
const pugFiles = fs
    .readdirSync(TEMPLATES_SRC)
    .filter((file) => file.endsWith('.pug'))

pugFiles.forEach((file) => {
    const src = path.join(TEMPLATES_SRC, file)
    const dest = path.join(TEMPLATES_DEST, file)
    fs.copyFileSync(src, dest)
    console.log(`✅ Copied ${file} to ${dest}`)
})

console.log(`✅ Popular content templates copied to: ${TEMPLATES_DEST}`)
