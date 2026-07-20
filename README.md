# @nera-static/plugin-popular-content

[![Test](https://github.com/seebaermichi/nera-plugin-popular-content/actions/workflows/test.yml/badge.svg)](https://github.com/seebaermichi/nera-plugin-popular-content/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/@nera-static/plugin-popular-content)](https://www.npmjs.com/package/@nera-static/plugin-popular-content)

A plugin for the [Nera](https://github.com/seebaermichi/nera) static site generator that creates lists of popular content based on meta properties. Perfect for featured sections, homepage teasers, or content sliders.

## ✨ Features

- Group content by any meta property (e.g., `is_popular`, `is_featured`)
- Configurable sorting (ascending or descending)
- Multiple content groups in a single config file
- Access grouped content globally via `app.popularContent`
- Includes ready-to-use Pug templates with BEM CSS methodology
- Template publishing system for easy customization
- Lightweight and zero-runtime overhead
- Full compatibility with Nera v4.1.0+

## 🚀 Installation

Install the plugin in your Nera project:

```bash
npm install @nera-static/plugin-popular-content
```

Nera will automatically detect the plugin and apply content grouping during the build.

## ⚙️ Configuration

Define your content grouping in `config/popular-content.yaml`:

```yaml
properties:
  - meta_property_name: is_popular
    order: desc
  - meta_property_name: is_home_teaser
    order: desc
```

### Attribute notes

- `meta_property_name`: The meta field to group by
- `order`: Sort direction (`asc` or `desc`, default: `asc`)

## 🧩 Usage

### Mark content with metadata

```yaml
---
title: Amazing Article
description: This article is really amazing
is_popular: 3
is_home_teaser: 1
---
```

```yaml
---
title: Another Great Post
description: Another excellent read
is_popular: 1
is_home_teaser: 2
---
```

### Access in templates

```pug
if app.popularContent.is_popular && app.popularContent.is_popular.length > 0
  section.popular-content
    h2 Popular Articles
    ul
      each item in app.popularContent.is_popular
        li
          a(href=item.href) #{item.title}
          p #{item.description}

if app.popularContent.is_home_teaser && app.popularContent.is_home_teaser.length > 0
  section.home-teasers
    each item in app.popularContent.is_home_teaser
      article.teaser
        h3 #{item.title}
        p #{item.description}
        a(href=item.href) Read more
```

`app.popularContent` is always defined — it is `{}` when no properties are
configured — so the outer `if` is enough. Check the individual key as shown
above rather than assuming it exists: a key only appears once it is listed in
`config/popular-content.yaml`.

The names used here (`is_popular`, `is_home_teaser`) are the ones in the
shipped config. If you rename `meta_property_name`, the key in
`app.popularContent` changes with it — `app.popularContentProperties` lists the
configured names in order.

### Available data structure

```javascript
{
  title: "Article Title",
  description: "Article description",
  href: "/path/to/article.html",
  is_popular: 3,
  content: "<h1>Article Title</h1><p>Content...</p>"
}
```

## 🛠️ Template Publishing

Use the default templates provided by the plugin:

```bash
npx nera-popular-content
```

This copies:

```
views/vendor/plugin-popular-content/
├── popular-content.pug
└── teaser.pug
```

Publishing skips when the destination already exists, so re-running never
discards your edits. To overwrite them with the packaged versions:

```bash
npx nera-popular-content --force
```

Include them in your layout:

```pug
include ../vendor/plugin-popular-content/popular-content
include ../vendor/plugin-popular-content/teaser
```

The path is relative to the **including file**. From a layout in
`views/layouts/`, `../vendor/…` resolves to `views/vendor/…`. A bare
`views/vendor/…` would resolve to `views/layouts/views/vendor/…` and fail.

### Renamed properties

The shipped templates render `is_popular` and `is_home_teaser`. If you renamed
`meta_property_name`, set the key before the include:

```pug
- var popularContentKey = 'my_popular_name'
include ../vendor/plugin-popular-content/popular-content

- var homeTeaserKey = 'my_teaser_name'
include ../vendor/plugin-popular-content/teaser
```

## 🎨 Styling

Default templates use BEM CSS methodology:

**Popular Content:**

- `.popular-content`
- `.popular-content__title`
- `.popular-content__list`
- `.popular-content__item`
- `.popular-content__link`
- `.popular-content__description`
- `.popular-content__date`

**Teasers:**

- `.home-teasers`
- `.home-teasers__title`
- `.home-teasers__grid`
- `.home-teasers__card`
- `.home-teasers__header`
- `.home-teasers__card-title`
- `.home-teasers__content`
- `.home-teasers__description`
- `.home-teasers__footer`
- `.home-teasers__link`

## 📊 Generated Output

The plugin injects grouped and sorted content into `app.popularContent`. Use templates or custom markup to render the output.

## 🧪 Development

```bash
npm install
npm test
npm run lint
```

Tests use [Vitest](https://vitest.dev) and [Cheerio](https://cheerio.js.org) to verify:

- Grouping and sorting logic
- Support for multiple properties
- Correct injection into app data
- Template rendering and structure
- Publishing logic and file overwrite protection

## 🧑‍💻 Author

Michael Becker
[https://github.com/seebaermichi](https://github.com/seebaermichi)

## 🔗 Links

- [Plugin Repository](https://github.com/seebaermichi/nera-plugin-popular-content)
- [NPM Package](https://www.npmjs.com/package/@nera-static/plugin-popular-content)
- [Nera Static Site Generator](https://github.com/seebaermichi/nera)

## 🧩 Compatibility

- **Nera**: v4.1.0+
- **Node.js**: >= 18
- **Plugin API**: Uses `getAppData()` for global content aggregation

## 📦 License

MIT
