import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { load } from 'cheerio'
import pug from 'pug'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'
import { getAppData } from '../index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Templates are resolved from the test file, not from cwd. The suite chdirs
// into a temp directory, and the old `path.resolve('./views/...')` form only
// worked as long as vitest happened to run from the package root.
const VIEWS = path.resolve(__dirname, '../views')

const DEFAULT_CONFIG = `properties:
  - meta_property_name: is_popular
    order: desc
  - meta_property_name: is_home_teaser
    order: desc
`

let cwd
let originalCwd

// The plugin reads config from process.cwd(). Running in the repo picks up the
// package's own config/popular-content.yaml — a file no consumer ever has,
// since the shipped config is documentation and is never merged into a site.
// Each test starts from an empty temp cwd and writes the config it wants.
beforeEach(() => {
    originalCwd = process.cwd()
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'nera-popular-content-'))
    process.chdir(cwd)
})

afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(cwd, { recursive: true, force: true })
})

const writeConfig = (yaml) => {
    fs.mkdirSync(path.join(cwd, 'config'), { recursive: true })
    fs.writeFileSync(path.join(cwd, 'config/popular-content.yaml'), yaml, 'utf-8')
}

const renderTemplate = (name, app) =>
    pug.renderFile(path.join(VIEWS, `${name}.pug`), { app })

describe('Popular Content plugin', () => {
    describe('with the default configuration', () => {
        beforeEach(() => writeConfig(DEFAULT_CONFIG))

        it('groups content by meta properties', () => {
            const pagesData = [
                {
                    content: '<h1>Popular Article 1</h1>',
                    meta: {
                        title: 'Popular Article 1',
                        is_popular: 3,
                        href: '/article1.html',
                    },
                },
                {
                    content: '<h1>Popular Article 2</h1>',
                    meta: {
                        title: 'Popular Article 2',
                        is_popular: 1,
                        href: '/article2.html',
                    },
                },
                {
                    content: '<h1>Regular Article</h1>',
                    meta: {
                        title: 'Regular Article',
                        href: '/regular.html',
                    },
                },
            ]

            const result = getAppData({ pagesData, app: {} })

            expect(result.popularContent.is_popular).toBeDefined()
            expect(result.popularContent.is_popular).toHaveLength(2)
            // config says desc, so highest number first
            expect(result.popularContent.is_popular[0].title).toBe(
                'Popular Article 1'
            )
            expect(result.popularContent.is_popular[1].title).toBe(
                'Popular Article 2'
            )

            const $1 = load(result.popularContent.is_popular[0].content)
            const $2 = load(result.popularContent.is_popular[1].content)
            expect($1('h1').text()).toBe('Popular Article 1')
            expect($2('h1').text()).toBe('Popular Article 2')
        })

        it('sorts content in descending order when configured', () => {
            const pagesData = [
                { content: '<h1>Article A</h1>', meta: { title: 'Article A', is_home_teaser: 1 } },
                { content: '<h1>Article B</h1>', meta: { title: 'Article B', is_home_teaser: 3 } },
                { content: '<h1>Article C</h1>', meta: { title: 'Article C', is_home_teaser: 2 } },
            ]

            const result = getAppData({ pagesData, app: {} })

            expect(result.popularContent.is_home_teaser).toHaveLength(3)
            expect(result.popularContent.is_home_teaser[0].title).toBe('Article B')
            expect(result.popularContent.is_home_teaser[1].title).toBe('Article C')
            expect(result.popularContent.is_home_teaser[2].title).toBe('Article A')
        })

        it('includes content in the grouped items', () => {
            const pagesData = [
                {
                    content: '<h1>Test Content</h1><p>Some description</p>',
                    meta: {
                        title: 'Test Article',
                        is_popular: 1,
                        description: 'A test description',
                    },
                },
            ]

            const result = getAppData({ pagesData, app: {} })

            const $ = load(result.popularContent.is_popular[0].content)
            expect($('h1').text()).toBe('Test Content')
            expect($('p').text()).toBe('Some description')
            expect(result.popularContent.is_popular[0].description).toBe(
                'A test description'
            )
        })

        it('handles empty pages data gracefully', () => {
            const result = getAppData({ pagesData: [], app: {} })

            expect(result.popularContent.is_popular).toHaveLength(0)
            expect(result.popularContent.is_home_teaser).toHaveLength(0)
        })

        it('preserves existing app data', () => {
            const pagesData = [
                { content: '<h1>Test</h1>', meta: { title: 'Test', is_popular: 1 } },
            ]

            const result = getAppData({
                pagesData,
                app: { siteTitle: 'My Site', lang: 'en' },
            })

            expect(result).toMatchObject({
                siteTitle: 'My Site',
                lang: 'en',
                popularContent: {
                    is_popular: [
                        { title: 'Test', is_popular: 1, content: '<h1>Test</h1>' },
                    ],
                    is_home_teaser: [],
                },
            })
        })

        it('returns popularContent regardless of app state', () => {
            const pagesData = [
                { content: '<h1>Test</h1>', meta: { title: 'Test', is_popular: 1 } },
            ]

            for (const app of [null, undefined, {}]) {
                const result = getAppData({ pagesData, app })

                expect(result.popularContent).toEqual({
                    is_popular: [
                        { title: 'Test', is_popular: 1, content: '<h1>Test</h1>' },
                    ],
                    is_home_teaser: [],
                })
            }
        })

        it('exposes the configured property names in order', () => {
            const result = getAppData({ pagesData: [], app: {} })

            expect(result.popularContentProperties).toEqual([
                'is_popular',
                'is_home_teaser',
            ])
        })
    })

    // Regression: getAppData used to return null here. The generator rejects a
    // non-object with "returned invalid format", leaving app.popularContent
    // undefined — and the shipped templates then died reading a property of
    // undefined. The old test for this was named 'returns null when no config
    // is found' but asserted the opposite, so the branch was never covered.
    describe('with no config/popular-content.yaml present', () => {
        it('returns a usable app object, not null', () => {
            const result = getAppData({ pagesData: [], app: { lang: 'en' } })

            expect(result).not.toBeNull()
            expect(typeof result).toBe('object')
            expect(Array.isArray(result)).toBe(false)
        })

        it('preserves existing app values', () => {
            const result = getAppData({
                pagesData: [],
                app: { lang: 'en', siteTitle: 'My Site' },
            })

            expect(result.lang).toBe('en')
            expect(result.siteTitle).toBe('My Site')
        })

        it('still defines popularContent, so templates can read it', () => {
            const result = getAppData({ pagesData: [], app: {} })

            expect(result.popularContent).toEqual({})
            expect(result.popularContentProperties).toEqual([])
        })

        it('renders both shipped templates without throwing', () => {
            const app = getAppData({
                pagesData: [
                    { content: '<h1>A</h1>', meta: { title: 'A', is_popular: 1 } },
                ],
                app: {},
            })

            expect(() => renderTemplate('popular-content', app)).not.toThrow()
            expect(() => renderTemplate('teaser', app)).not.toThrow()
            expect(renderTemplate('popular-content', app)).toBe('')
            expect(renderTemplate('teaser', app)).toBe('')
        })

        it('renders templates without throwing even on a bare app', () => {
            expect(() => renderTemplate('popular-content', {})).not.toThrow()
            expect(() => renderTemplate('teaser', {})).not.toThrow()
        })
    })

    describe('with a renamed meta_property_name', () => {
        beforeEach(() =>
            writeConfig('properties:\n  - meta_property_name: featured\n    order: desc\n')
        )

        it('groups under the configured name', () => {
            const result = getAppData({
                pagesData: [
                    { content: '<h1>F</h1>', meta: { title: 'F', featured: 1 } },
                ],
                app: {},
            })

            expect(result.popularContent.featured).toHaveLength(1)
            expect(result.popularContent.is_popular).toBeUndefined()
            expect(result.popularContentProperties).toEqual(['featured'])
        })

        it('renders nothing by default, and the content once the key is set', () => {
            const app = getAppData({
                pagesData: [
                    { content: '<h1>F</h1>', meta: { title: 'F', href: '/f', featured: 1 } },
                ],
                app: {},
            })

            // The shipped template defaults to is_popular, which no longer exists
            expect(renderTemplate('popular-content', app)).toBe('')

            // ...and honours the documented override
            const html = pug.renderFile(path.join(VIEWS, 'popular-content.pug'), {
                app,
                popularContentKey: 'featured',
            })
            expect(load(html)('.popular-content__link').text()).toBe('F')
        })
    })

    // Regression: the comparator was `valueA - valueB`, which returns NaN for a
    // non-numeric value. A NaN-returning comparator makes Array.prototype.sort
    // undefined behaviour, so a string-valued property came out in a different
    // order for each input permutation. It must now be deterministic.
    describe('with non-numeric meta values', () => {
        beforeEach(() =>
            writeConfig('properties:\n  - meta_property_name: rank\n    order: desc\n')
        )

        const pages = [
            { content: 'a', meta: { title: 'A', rank: 'high' } },
            { content: 'b', meta: { title: 'B', rank: 'low' } },
            { content: 'c', meta: { title: 'C', rank: 'medium' } },
            { content: 'd', meta: { title: 'D', rank: 'urgent' } },
        ]

        const permutations = (arr) =>
            arr.length <= 1
                ? [arr]
                : arr.flatMap((item, i) =>
                    permutations([
                        ...arr.slice(0, i),
                        ...arr.slice(i + 1),
                    ]).map((rest) => [item, ...rest])
                )

        it('produces the same order regardless of input order', () => {
            const orderings = new Set(
                permutations(pages).map((p) =>
                    getAppData({ pagesData: p, app: {} })
                        .popularContent.rank.map((x) => x.title)
                        .join('')
                )
            )

            expect(orderings.size).toBe(1)
            // desc + localeCompare: 'urgent' > 'medium' > 'low' > 'high'
            expect([...orderings][0]).toBe('DCBA')
        })
    })

    // Equal primary values must be ordered deterministically by createdAt
    // rather than left to the order pages happened to arrive in.
    describe('tie-breaking on equal values', () => {
        beforeEach(() =>
            writeConfig('properties:\n  - meta_property_name: is_popular\n    order: desc\n')
        )

        it('breaks ties on createdAt, oldest first, independent of input order', () => {
            const older = new Date('2020-01-01')
            const newer = new Date('2024-01-01')
            const forward = [
                { content: 'n', meta: { title: 'Newer', is_popular: 1, createdAt: newer } },
                { content: 'o', meta: { title: 'Older', is_popular: 1, createdAt: older } },
            ]

            const orderOf = (pagesData) =>
                getAppData({ pagesData, app: {} })
                    .popularContent.is_popular.map((x) => x.title)

            expect(orderOf(forward)).toEqual(['Older', 'Newer'])
            expect(orderOf([...forward].reverse())).toEqual(['Older', 'Newer'])
        })
    })

    describe('template rendering', () => {
        beforeEach(() => writeConfig(DEFAULT_CONFIG))

        it('renders popular content template correctly', () => {
            const pagesData = [
                {
                    content: '<h1>Amazing Article</h1><p>Great content here</p>',
                    meta: {
                        title: 'Amazing Article',
                        description: 'This is an amazing article',
                        href: '/amazing.html',
                        is_popular: 1,
                    },
                },
                {
                    content: '<h1>Another Article</h1>',
                    meta: {
                        title: 'Another Article',
                        description: 'Another great read',
                        href: '/another.html',
                        is_popular: 2,
                    },
                },
            ]

            const result = getAppData({ pagesData, app: {} })
            const $ = load(renderTemplate('popular-content', result))

            expect($('section.popular-content')).toHaveLength(1)
            expect($('h2.popular-content__title').text()).toBe('Popular Content')
            expect($('.popular-content__item')).toHaveLength(2)

            const links = $('.popular-content__link')
            expect(links).toHaveLength(2)
            expect($(links[0]).attr('href')).toBe('/another.html')
            expect($(links[0]).text()).toBe('Another Article')
            expect($(links[1]).attr('href')).toBe('/amazing.html')
            expect($(links[1]).text()).toBe('Amazing Article')

            const descriptions = $('.popular-content__description')
            expect(descriptions).toHaveLength(2)
            expect($(descriptions[0]).text()).toBe('Another great read')
            expect($(descriptions[1]).text()).toBe('This is an amazing article')
        })

        it('renders teaser template correctly', () => {
            const pagesData = [
                {
                    content: '<h1>Featured Content</h1>',
                    meta: {
                        title: 'Featured Content',
                        description: 'This is featured',
                        href: '/featured.html',
                        is_home_teaser: 1,
                    },
                },
            ]

            const result = getAppData({ pagesData, app: {} })
            const $ = load(renderTemplate('teaser', result))

            expect($('section.home-teasers')).toHaveLength(1)
            expect($('h2.home-teasers__title').text()).toBe('Featured Content')
            expect($('.home-teasers__card')).toHaveLength(1)
            expect($('.home-teasers__card-title').text()).toBe('Featured Content')
            expect($('.home-teasers__description').text()).toBe('This is featured')
            expect($('.home-teasers__link').attr('href')).toBe('/featured.html')
            expect($('.home-teasers__link').text()).toBe('Read more')
        })
    })
})
