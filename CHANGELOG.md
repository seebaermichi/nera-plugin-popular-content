# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
