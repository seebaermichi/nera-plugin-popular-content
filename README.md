# @nera-static/plugin-popular-content

A plugin for the [Nera](https://github.com/seebaermichi/nera) static site generator that creates lists of popular content based on meta properties. Perfect for creating featured content sections, homepage teasers, or content sliders.

## ✨ Features

-   Group content by any meta property (e.g., `is_popular`, `is_featured`)
-   Configurable sorting (ascending or descending)
-   Multiple content groups in a single configuration
-   Access all grouped content via `app.popularContent`
-   Includes ready-to-use Pug templates for common layouts
-   Lightweight and zero-runtime overhead

## 🚀 Installation

Install the plugin in your Nera project:

```bash
npm install @nera-static/plugin-popular-content
```

Nera will automatically detect the plugin and apply the content grouping during the build.

## ⚙️ Configuration

The plugin uses `config/popular-content.yaml` to define which meta properties to track:

```yaml
properties:
    - meta_property_name: is_popular
      order: desc
    - meta_property_name: is_home_teaser
      order: desc
```

-   **`meta_property_name`**: The meta field to group by
-   **`order`**: Sort order (`asc` or `desc`, defaults to `asc`)

## 🧩 Usage

### Mark content in your markdown files

Add the configured meta properties to your pages:

```yaml
---
title: Amazing Article
description: This article is really amazing
is_popular: 3
is_home_teaser: 1
---
# Amazing Article

Your content here...
```

```yaml
---
title: Another Great Post
description: Another excellent read
is_popular: 1
is_home_teaser: 2
---
# Another Great Post

More content...
```

### Access in your templates

The plugin makes grouped content available via `app.popularContent`:

```pug
// Display popular content
if app.popularContent.is_popular.length > 0
    section.popular-content
        h2 Popular Articles
        ul
            each item in app.popularContent.is_popular
                li
                    a(href=item.href) #{item.title}
                    p #{item.description}

// Display homepage teasers
if app.popularContent.is_home_teaser.length > 0
    section.home-teasers
        each item in app.popularContent.is_home_teaser
            article.teaser
                h3 #{item.title}
                p #{item.description}
                a(href=item.href) Read more
```

### Available data structure

Each item in the grouped arrays contains:

```javascript
{
    title: "Article Title",
    description: "Article description",
    href: "/path/to/article.html",
    is_popular: 3,
    content: "<h1>Article Title</h1><p>Content...</p>",
    // ... all other meta properties
}
```

## 🛠️ Publish Default Templates

Use the default templates provided by the plugin:

```bash
npx @nera-static/plugin-popular-content run publish-template
```

This copies templates to:

```
views/vendor/plugin-popular-content/
├── popular-content.pug
└── teaser.pug
```

### Using the templates

Include them in your layouts:

```pug
// Basic popular content list
include views/vendor/plugin-popular-content/popular-content

// Teaser cards for homepage
include views/vendor/plugin-popular-content/teaser
```

### Template customization

You can customize the copied templates or create your own based on the data structure provided by `app.popularContent`.

## 🎯 Use Cases

### Homepage Featured Content

```yaml
# config/popular-content.yaml
properties:
    - meta_property_name: is_featured
      order: desc
```

```yaml
---
title: Featured Article
is_featured: 1
---
```

### Content Sliders

```yaml
properties:
    - meta_property_name: slider_priority
      order: desc
```

### Multiple Content Sections

```yaml
properties:
    - meta_property_name: is_trending
      order: desc
    - meta_property_name: is_recent
      order: desc
    - meta_property_name: is_recommended
      order: asc
```

## 🧪 Development

```bash
npm install
npm test
npm run lint
```

### Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) for Git hooks:

-   **pre-commit**: Runs linting (`npm run lint`)
-   **pre-push**: Runs tests (`npm test`)

After cloning, activate the hooks:

```bash
git config core.hooksPath .husky
```

Tests use [Vitest](https://vitest.dev) and [Cheerio](https://cheerio.js.org) and cover:

-   Content grouping by meta properties
-   Sorting functionality (ascending/descending)
-   Multiple property handling
-   Content preservation in grouped items
-   Template rendering with HTML structure validation
-   Template publishing logic

## 🧑‍💻 Author

Michael Becker  
[https://github.com/seebaermichi](https://github.com/seebaermichi)

## 🔗 Links

-   [Plugin Repository](https://github.com/seebaermichi/nera-plugin-popular-content)
-   [NPM Package](https://www.npmjs.com/package/@nera-static/plugin-popular-content)
-   [Nera Static Site Generator](https://github.com/seebaermichi/nera)

## 📦 License

MIT
