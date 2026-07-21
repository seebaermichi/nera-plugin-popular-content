# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.2.0] - 2026-07-21

### Changed

-   raised minimum Node from 18 to 20; Node 18 reached end-of-life on
    2025-04-30 and the dev toolchain requires Node 20+


## [3.1.0] - 2026-07-20

### Added

-   `--force` flag on `nera-popular-content`, to re-publish templates over an
    existing `views/vendor/plugin-popular-content/` and overwrite local edits.
    Without it, publishing still skips, as before
-   `app.popularContentProperties` — the configured `meta_property_name`
    values, in order. Useful when you have renamed them and need to resolve
    the right key in a template
-   the shipped templates accept an overriding key: set `popularContentKey`
    (or `homeTeaserKey` for the teaser) before the include to render a
    renamed property

### Fixed

-   **the build no longer dies when `config/popular-content.yaml` is absent.**
    `getAppData` returned `null`, which the generator rejects with
    *"getAppData returned invalid format, skipping replace"*, leaving
    `app.popularContent` undefined — and the shipped templates then threw
    `Cannot read properties of undefined (reading 'is_popular')`. `getAppData`
    now returns the app object with an empty `popularContent`, so templates
    and the README's examples render nothing instead of crashing
-   the shipped templates guard against a missing `app.popularContent`, so
    they are safe even if another plugin displaces the value
-   the shipped templates no longer hardcode `is_popular` / `is_home_teaser`
    with no way to change them, which silently rendered nothing for anyone
    who had renamed `meta_property_name`

### Changed

-   configuration is read inside `getAppData` rather than at module load, so
    edits to `config/popular-content.yaml` take effect without a restart
-   `@nera-static/plugin-utils` range raised to `^1.2.0`, where `force` lands

Rendered markup is unchanged: for any site that was already working, these
templates produce byte-identical output. The difference is only in what
happens when a key is missing — previously a crash, now an empty render.

### Documentation

-   corrected the include paths. They are relative to the including file, so
    from a layout it is `include ../vendor/plugin-popular-content/…`; the
    documented `views/vendor/…` resolved to `views/layouts/views/vendor/…`
    and could never work
-   the template examples now guard the individual key before reading
    `.length`
-   fixed an invalid `npx` invocation; the command is `npx nera-popular-content`

## [3.0.0] - 2025-07-20

### Changed

-   **BREAKING**: Configuration loading now uses project directory (`process.cwd()`) instead of plugin directory (`__dirname`)
-   Configuration file must now be located at `config/popular-content.yaml` in the user's project root
-   Removed unnecessary `fileURLToPath` import for cleaner ES module implementation
-   Aligns configuration loading with other modernized Nera plugins

### Migration from v2.x

If you have a custom configuration file, move it from the plugin directory to your project's `config/` directory:

```bash
# Move configuration to project root
mkdir -p config/
# Copy your existing configuration if you had one
# The plugin will now look for config/popular-content.yaml in your project
```

### Technical Details

-   Configuration path changed from `path.resolve(__dirname, 'config/popular-content.yaml')` to `path.resolve(process.cwd(), 'config/popular-content.yaml')`
-   All tests continue to pass with the new configuration loading mechanism
-   Maintains full backward compatibility with configuration file format and options

## [2.1.0] - 2025-07-19

### Added

-   Professional CHANGELOG.md for release tracking
-   Enhanced template publishing system via `@nera-static/plugin-utils@^1.1.0`
-   Support for Nera v4.1.0 static site generator
-   BEM CSS keyword in package.json for improved discoverability

### Changed

-   Updated @nera-static/plugin-utils to v1.1.0 for improved compatibility
-   Modernized bin/publish-template.js to use publishAllTemplates utility
-   Enhanced package.json with CHANGELOG.md in files array
-   Improved code documentation and consistency

### Fixed

-   **Critical Fix**: getAppData() now properly spreads `...data.app` to preserve all app data
-   Template publishing system now uses standardized plugin utilities

### Technical Details

-   Uses `getAppData()` function to provide global app-level popular content data
-   Popular content lists are available in `app.popularContent` for global template access
-   Full compatibility with Nera v4.1.0 plugin system
-   Template publishing to `views/vendor/plugin-popular-content/`
-   Support for multiple meta properties with configurable sorting (asc/desc)

## [2.0.0] - 2024-07-19

### Added

-   Initial stable release with popular content functionality
-   Configuration-driven meta property sorting
-   Template publishing capabilities
-   Comprehensive test suite
