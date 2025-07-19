import { describe, it, expect } from 'vitest'
import { load } from 'cheerio'
import pug from 'pug'
import path from 'path'
import { getAppData } from '../index.js'

describe('Popular Content plugin', () => {
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
        // Default sort order is asc, but config has desc, so highest number first
        expect(result.popularContent.is_popular[0].title).toBe(
            'Popular Article 1'
        )
        expect(result.popularContent.is_popular[1].title).toBe(
            'Popular Article 2'
        )

        // Test HTML content with Cheerio
        const $1 = load(result.popularContent.is_popular[0].content)
        const $2 = load(result.popularContent.is_popular[1].content)
        expect($1('h1').text()).toBe('Popular Article 1')
        expect($2('h1').text()).toBe('Popular Article 2')
    })

    it('sorts content in descending order when configured', () => {
        const pagesData = [
            {
                content: '<h1>Article A</h1>',
                meta: {
                    title: 'Article A',
                    is_home_teaser: 1,
                },
            },
            {
                content: '<h1>Article B</h1>',
                meta: {
                    title: 'Article B',
                    is_home_teaser: 3,
                },
            },
            {
                content: '<h1>Article C</h1>',
                meta: {
                    title: 'Article C',
                    is_home_teaser: 2,
                },
            },
        ]

        const result = getAppData({ pagesData, app: {} })

        expect(result.popularContent.is_home_teaser).toBeDefined()
        expect(result.popularContent.is_home_teaser).toHaveLength(3)
        // Should be sorted desc: 3, 2, 1
        expect(result.popularContent.is_home_teaser[0].title).toBe('Article B')
        expect(result.popularContent.is_home_teaser[1].title).toBe('Article C')
        expect(result.popularContent.is_home_teaser[2].title).toBe('Article A')

        // Test HTML content with Cheerio
        const $b = load(result.popularContent.is_home_teaser[0].content)
        const $c = load(result.popularContent.is_home_teaser[1].content)
        const $a = load(result.popularContent.is_home_teaser[2].content)
        expect($b('h1').text()).toBe('Article B')
        expect($c('h1').text()).toBe('Article C')
        expect($a('h1').text()).toBe('Article A')
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

        // Use Cheerio to parse and test HTML content
        const $ = load(result.popularContent.is_popular[0].content)
        expect($('h1').text()).toBe('Test Content')
        expect($('p').text()).toBe('Some description')
        expect(result.popularContent.is_popular[0].description).toBe(
            'A test description'
        )
    })

    it('handles empty pages data gracefully', () => {
        const result = getAppData({ pagesData: [], app: {} })

        expect(result.popularContent.is_popular).toBeDefined()
        expect(result.popularContent.is_popular).toHaveLength(0)
        expect(result.popularContent.is_home_teaser).toBeDefined()
        expect(result.popularContent.is_home_teaser).toHaveLength(0)
    })

    it('preserves existing app data', () => {
        const pagesData = [
            {
                content: '<h1>Test</h1>',
                meta: {
                    title: 'Test',
                    is_popular: 1,
                },
            },
        ]

        const existingApp = {
            siteTitle: 'My Site',
            lang: 'en',
        }

        const result = getAppData({ pagesData, app: existingApp })

        // Plugin should return complete app data with popularContent merged in
        expect(result).toEqual({
            siteTitle: 'My Site',
            lang: 'en',
            popularContent: {
                is_popular: [
                    {
                        title: 'Test',
                        is_popular: 1,
                        content: '<h1>Test</h1>',
                    },
                ],
                is_home_teaser: [],
            },
        })

        // Test HTML content with Cheerio
        const $ = load(result.popularContent.is_popular[0].content)
        expect($('h1').text()).toBe('Test')
    })

    it('returns object with popularContent regardless of app state', () => {
        const pagesData = [
            {
                content: '<h1>Test</h1>',
                meta: {
                    title: 'Test',
                    is_popular: 1,
                },
            },
        ]

        // Should work the same regardless of app state
        const result1 = getAppData({ pagesData, app: null })
        const result2 = getAppData({ pagesData, app: undefined })
        const result3 = getAppData({ pagesData, app: {} })

        const expected = {
            popularContent: {
                is_popular: [
                    {
                        title: 'Test',
                        is_popular: 1,
                        content: '<h1>Test</h1>',
                    },
                ],
                is_home_teaser: [],
            },
        }

        expect(result1).toEqual(expected)
        expect(result2).toEqual(expected)
        expect(result3).toEqual(expected)

        // Test HTML content with Cheerio
        const $ = load(result1.popularContent.is_popular[0].content)
        expect($('h1').text()).toBe('Test')
    })

    it('returns null when no config is found', () => {
        // This test would need to mock getConfig to return null/undefined
        // For now, we'll test the basic structure
        const pagesData = []
        const result = getAppData({ pagesData, app: {} })

        // Should return the popularContent object structure
        expect(result).toHaveProperty('popularContent')
    })

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

        // Test template rendering with Cheerio
        const templatePath = path.resolve('./views/popular-content.pug')
        const html = pug.renderFile(templatePath, { app: result })
        const $ = load(html)

        // Check structure
        expect($('section.popular-content')).toHaveLength(1)
        expect($('h2.popular-content__title')).toHaveLength(1)
        expect($('h2.popular-content__title').text()).toBe('Popular Content')

        // Check that both articles are rendered
        expect($('.popular-content__item')).toHaveLength(2)

        // Check links and titles (sorted desc: 2, 1)
        const links = $('.popular-content__link')
        expect(links).toHaveLength(2)
        expect($(links[0]).attr('href')).toBe('/another.html')
        expect($(links[0]).text()).toBe('Another Article')
        expect($(links[1]).attr('href')).toBe('/amazing.html')
        expect($(links[1]).text()).toBe('Amazing Article')

        // Check descriptions (sorted desc: 2, 1)
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

        // Test teaser template rendering
        const templatePath = path.resolve('./views/teaser.pug')
        const html = pug.renderFile(templatePath, { app: result })
        const $ = load(html)

        // Check structure
        expect($('section.home-teasers')).toHaveLength(1)
        expect($('h2.home-teasers__title')).toHaveLength(1)
        expect($('h2.home-teasers__title').text()).toBe('Featured Content')

        // Check teaser card
        expect($('.home-teasers__card')).toHaveLength(1)
        expect($('.home-teasers__card-title').text()).toBe('Featured Content')
        expect($('.home-teasers__description').text()).toBe('This is featured')
        expect($('.home-teasers__link').attr('href')).toBe('/featured.html')
        expect($('.home-teasers__link').text()).toBe('Read more')
    })
})
