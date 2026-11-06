# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-11-03

### Added

- Add a vertical calendar layout with scrolling, sticky labels, and arrow-key navigation that follows the selected orientation.
- Offer small (11px), medium (16px), and large (24px) heatmap cell sizes.
- Add grid semantics and accessible cell labels containing the date and value.

### Changed

- **Breaking:** Raise the minimum supported Obsidian version from 1.10.0 to 1.15.0.
- Present plugin settings through Obsidian’s declarative toggle/list interface, with color schemes edited by selecting a list row.

### Fixed

- Correct heatmap grid sizing and align vertical weekday headers with the cells.
- Edit and delete the selected color scheme correctly when multiple schemes share an ID.
- Preserve built-in color schemes so deleting every scheme reliably restores the defaults, including on fresh installations.

### Documentation

- Rewrite installation, settings, usage, and contribution guidance for the fork’s GitHub ZIP distribution and pnpm workflow.
- Add a demo vault with sample daily notes and boolean/numeric heatmaps in horizontal and vertical layouts.

### Maintenance

- Move build artifacts into `dist/`, generate manifests from package metadata, and add local deployment plus automatic demo-vault deployment during development.
- Migrate contributor tooling to pnpm 12, TypeScript 6, updated esbuild, and shared lint/format configuration; declare Node.js `^24.16.0 || >=26.3.0` for development.
- Separate settings and view registration into modules, reorganize test mocks, and retire Beads tracking and obsolete repository scaffolding.
- Expand regression tests for layout rendering, orientation-aware keyboard navigation, and color-scheme settings behavior.
- Add build, lint, and test CI on Linux, macOS, and Windows.
- Automate scheduled link checks, dependency-update PRs, and GitHub repository metadata synchronization.
- Add Fork Tender automation for integrating upstream changes while preserving the fork’s behavior.
- Automate versioning and GitHub releases with tag/version validation, tests, build provenance attestations, individual plugin files, and an installation ZIP.
- Correct the declared package license to 0BSD and update fork ownership and attribution.

## [1.0.6] - 2026-01-02

### Added

- Manage persistent color schemes in plugin settings: add, edit, or delete named palettes with validated hex endpoints and automatic light/dark zero-color adjustment.
- Open Obsidian Page Preview by holding Ctrl or Cmd while hovering over a note’s heatmap cell.

### Fixed

- Catch date parsing errors and report invalid dates and skipped notes through console warnings with file and property context.

### Documentation

- Explain customizable color schemes and their selection through plugin and view settings.
- Document automated test commands, coverage expectations, and the Beads contributor workflow.

### Maintenance

- Introduce Vitest/jsdom tests, V8 coverage reporting, Obsidian mocks, and coverage for dates, data processing, colors, and interactions; update supporting development dependencies.
- Add Obsidian-specific ESLint rules and move settings preview/error styling into CSS classes.
- Introduce repository-local Beads issue tracking with Git merge support.

## [1.0.5] - 2025-12-12

### Added

- Add a persistent global setting for tooltip hex colors, hidden by default and applied immediately across heatmap views.

### Documentation

- Add a heatmap screenshot to the README.
- Document lint commands, automatic pre-commit checks, version management, and GitHub release procedures.

### Maintenance

- Adopt ESLint 9 flat configuration, type-aware linting, and TypeScript 5, with Husky/lint-staged pre-commit checks and associated source cleanup.

## [1.0.4] - 2025-12-11

### Maintenance

- Remove redundant “Obsidian” wording from the plugin and package descriptions.

## [1.0.3] - 2025-12-11

### Added

- Introduce a GitHub-style heatmap for boolean and numeric note properties in Obsidian Bases, including default-view support; requires Obsidian 1.10.0 or newer.
- Read dates from daily-note filenames or date properties without timezone drift, retaining the highest value when several notes share a date.
- Save automatic or explicit date ranges, Sunday/Monday week starts, and month/weekday label visibility with each Base view.
- Provide five light/dark color palettes with smooth Oklab gradients, automatic or fixed numeric scales, and distinct styling for missing values versus false or zero.
- Support click or Enter to open notes, arrow-key navigation, and hover tooltips showing dates, values, and cell hex colors.

### Documentation

- Document manual installation, Base configuration, color interpretation, and habit-tracking examples using filenames or date properties.

### Maintenance

- Establish TypeScript compilation, esbuild production/watch builds, ESLint configuration, and release-version tooling.

[1.0.3]: https://github.com/kitschpatrol/obsidian-heatmap-bases-view/releases/tag/1.0.3
[1.0.4]: https://github.com/kitschpatrol/obsidian-heatmap-bases-view/compare/1.0.3...1.0.4
[1.0.5]: https://github.com/kitschpatrol/obsidian-heatmap-bases-view/compare/1.0.4...1.0.5
[1.0.6]: https://github.com/kitschpatrol/obsidian-heatmap-bases-view/compare/1.0.5...1.0.6
[2.0.0]: https://github.com/kitschpatrol/obsidian-heatmap-bases-view/compare/1.0.6...2.0.0
