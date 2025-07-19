import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'

const TEST_ROOT = path.resolve('.tmp/publish-template-test')
const SCRIPT_PATH = path.resolve('bin/publish-template.js')
const TEMPLATES_SRC = path.resolve('views/')
const TEMPLATES_DEST = path.join(
    TEST_ROOT,
    'views/vendor/plugin-popular-content/'
)
const DUMMY_PACKAGE = path.join(TEST_ROOT, 'package.json')

// Track whether we created template sources during this test
let createdTemplateFiles = []

beforeEach(() => {
    // Clean test workspace
    fs.rmSync(TEST_ROOT, { recursive: true, force: true })
    fs.mkdirSync(TEST_ROOT, { recursive: true })
    fs.writeFileSync(DUMMY_PACKAGE, JSON.stringify({ name: 'dummy' }, null, 2))

    // Ensure template source files exist
    if (!fs.existsSync(TEMPLATES_SRC)) {
        fs.mkdirSync(TEMPLATES_SRC, { recursive: true })
    }

    const templateFiles = ['popular-content.pug', 'teaser.pug']
    templateFiles.forEach((file) => {
        const filePath = path.join(TEMPLATES_SRC, file)
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, `// ${file} template content`)
            createdTemplateFiles.push(filePath)
        }
    })
})

afterEach(() => {
    fs.rmSync(TEST_ROOT, { recursive: true, force: true })

    // Only delete template files we created during this test
    createdTemplateFiles.forEach((filePath) => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
    })
    createdTemplateFiles = []
})

describe('publish-template command', () => {
    it('copies all pug templates to the correct location', () => {
        execSync(`node ${SCRIPT_PATH}`, { cwd: TEST_ROOT })

        expect(fs.existsSync(TEMPLATES_DEST)).toBe(true)

        const popularContentTemplate = path.join(
            TEMPLATES_DEST,
            'popular-content.pug'
        )
        const teaserTemplate = path.join(TEMPLATES_DEST, 'teaser.pug')

        expect(fs.existsSync(popularContentTemplate)).toBe(true)
        expect(fs.existsSync(teaserTemplate)).toBe(true)

        const content = fs.readFileSync(popularContentTemplate, 'utf-8')
        expect(content).toContain('popular-content')
    })

    it('skips if templates directory already exists', () => {
        fs.mkdirSync(TEMPLATES_DEST, { recursive: true })
        fs.writeFileSync(
            path.join(TEMPLATES_DEST, 'existing.pug'),
            '// existing'
        )

        const output = execSync(`node ${SCRIPT_PATH}`, {
            cwd: TEST_ROOT,
            stdio: 'pipe',
        }).toString()

        expect(output).toMatch(/Skipping/i)
        const existingFile = path.join(TEMPLATES_DEST, 'existing.pug')
        expect(fs.existsSync(existingFile)).toBe(true)
    })
})

afterAll(() => {
    fs.rmSync(path.resolve('.tmp'), { recursive: true, force: true })
})
