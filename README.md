<!-- title({ titleCase: true }) -->

# Obsidian Heatmap Bases View

<!-- /title -->

<!-- badges({ githubRelease: true, npm: false }) -->

[![License: 0BSD](https://img.shields.io/badge/License-0BSD-yellow.svg)](https://spdx.org/licenses/0BSD)
[![CI](https://github.com/kitschpatrol/obsidian-heatmap-bases-view/actions/workflows/ci.yml/badge.svg)](https://github.com/kitschpatrol/obsidian-heatmap-bases-view/actions/workflows/ci.yml)
[![GitHub Release](https://img.shields.io/github/v/release/kitschpatrol/obsidian-heatmap-bases-view?label=Release)](https://github.com/kitschpatrol/obsidian-heatmap-bases-view/releases/latest)

<!-- /badges -->

<!-- short-description -->

**Obsidian plugin that adds a GitHub-contributions-style heatmap view to Bases.**

<!-- /short-description -->

<!-- toc({ depth: 2 }) -->

## Table of contents

- [Overview](#overview)
- [Fork changes](#fork-changes)
- [Quick start](#quick-start)
- [Usage](#usage)
- [Settings](#settings)
- [Maintainers](#maintainers)
- [Acknowledgments](#acknowledgments)
- [Contributing](#contributing)
- [License](#license)

<!-- /toc -->

## Overview

Display boolean and numeric properties from daily notes as a calendar heatmap in Obsidian Bases. Use it to track habits, activity, or values such as mood and water intake over time.

![Heatmap visualization example](assets/heatmap-example.png)

Heatmaps support dates from filenames or properties, horizontal and vertical layouts, light and dark themes, custom color schemes, and keyboard navigation.

This is a fork of [Heatmap Bases View](https://github.com/ppeirce/obsidian-heatmap-bases-view) by [Peter Peirce](https://github.com/ppeirce).

This fork is distributed through GitHub releases and will not be published to Obsidian's community plugin registry.

## Fork changes

Changes from the original version this fork was based on:

- **GitHub distribution**\
  Publish plugin files and an installation ZIP through GitHub releases, with no community registry submission.
- **Build output**\
  Generate release files in `dist/` instead of committing a bundled `main.js`, and generate manifests from `package.json`.
- **Repository layout**\
  Keep styles in `src/`, build tools in `scripts/`, test mocks in `test/`, and settings and view registration in separate modules.
- **Modern settings**\
  Use Obsidian's declarative settings API for all plugin settings. This fork requires Obsidian **1.15.0 or newer**.
- **Development tooling**\
  Use pnpm, shared lint and formatting configuration, TypeScript build scripts, a demo vault, and mdat-generated README sections. CI checks builds, linting, and tests on Linux, macOS, and Windows.

## Quick start

1. **Prerequisites**

   [Obsidian](https://obsidian.md/download), version **1.15.0 or newer**, with **Bases** enabled under **Settings → Core plugins**.

2. **Plugin installation**

   Download the ZIP from the [latest GitHub release](https://github.com/kitschpatrol/obsidian-heatmap-bases-view/releases/latest) and extract the `heatmap-bases-view` folder into your vault's `.obsidian/plugins` folder. Restart Obsidian, then enable **Heatmap Bases View** under **Settings → Community plugins**.

3. **Configure**

   Add a checkbox or number property to your daily notes. Create a Base, filter it to those notes, and select **Heatmap** in the view switcher. Set **Value property** to the property you want to display. Leave **Date property** empty to use dates from filenames, or select a date property instead.

4. **Explore**

   Select a filled cell to open its note. Hover over a cell to see its date and value. Adjust the layout, colors, and date range in the view settings. See [Settings](#settings) for the available options.

## Usage

### Daily notes

For example, a note named `2026-01-01.md` could contain:

```md
---
exercise: true
water_glasses: 8
mood: 7
---
```

Create a heatmap view with **Value property** set to `exercise` for a habit tracker, `water_glasses` for hydration, or `mood` for a numeric trend. Multiple views can display different properties from the same notes.

### Dates from a property

If your filenames do not contain dates, add a date property:

```md
---
date: 2026-01-01
completed: true
---
```

Set **Date property** to `date` and **Value property** to `completed` in the heatmap's view settings.

### Reading the heatmap

- **Empty cells** indicate dates without a note.
- **Dim cells** indicate notes with a false, zero, or missing value.
- **Colored cells** indicate positive values. Checkbox values use full intensity when true; numeric values scale between the minimum and maximum.

Select a cell to open its note. Use the arrow keys to move between cells and **Enter** to open the focused note. Hold **Cmd** on macOS or **Ctrl** on Windows or Linux while hovering to use Obsidian's page preview when that core plugin is enabled.

### Example vault

The [Heatmap Demo Vault](examples/Heatmap%20Demo%20Vault/) includes daily notes and a Base with boolean and numeric heatmaps. Run `pnpm install` and `pnpm dev` from this repository, then open the example folder as a vault and enable the plugin.

## Settings

### View options

Each heatmap view has its own options in the Base:

| Option              | Description                                                                            |
| ------------------- | -------------------------------------------------------------------------------------- |
| Date property       | Property containing the date. Leave empty to use the filename.                         |
| Value property      | Checkbox or number property to display.                                                |
| Start date          | Beginning of the range in `YYYY-MM-DD` format. Leave empty to detect it from the data. |
| End date            | End of the range in `YYYY-MM-DD` format. Leave empty to use today.                     |
| Color scheme        | Scheme to use for the heatmap. Green by default.                                       |
| Week starts on      | Sunday or Monday. Sunday by default.                                                   |
| Show weekday labels | Show weekday labels. Enabled by default.                                               |
| Show month labels   | Show month labels. Enabled by default.                                                 |
| Layout direction    | Horizontal or vertical. Horizontal by default.                                         |
| Cell size           | Small (11px), medium (16px), or large (24px). Small by default.                        |
| Min value           | Lower bound for numeric intensity. Leave empty to calculate it from the data.          |
| Max value           | Upper bound for numeric intensity. Leave empty to calculate it from the data.          |

### Plugin settings

Open **Settings → Heatmap Bases View** to change settings shared by all heatmaps.

#### Show hex color in tooltip

Include the cell's hex color code in its tooltip. Disabled by default.

#### Color schemes

Five schemes are included: Green, Purple, Blue, Orange, and Gray. Use the add button to create a scheme, select a scheme to edit it, or use its delete button to remove it. Then choose a scheme in a heatmap's view settings. Deleting every scheme restores the included ones.

Each scheme has a name, a **Zero color**, and a **Max color**. Enter colors as six-digit hex values, with or without a leading `#`. Colors adapt to light and dark themes.

## Maintainers

[kitschpatrol](https://github.com/kitschpatrol)

## Acknowledgments

Thanks to [Peter Peirce](https://github.com/ppeirce) for creating the original [Heatmap Bases View](https://github.com/ppeirce/obsidian-heatmap-bases-view).

<!-- contributing -->

## Contributing

[Issues](https://github.com/kitschpatrol/obsidian-heatmap-bases-view/issues) are welcome and appreciated.

Please open an issue to discuss changes before submitting a pull request. Unsolicited PRs (especially AI-generated ones) are unlikely to be merged.

This repository uses [@kitschpatrol/shared-config](https://github.com/kitschpatrol/shared-config) (via its `ksc` CLI) for linting and formatting, plus [MDAT](https://github.com/kitschpatrol/mdat) for readme placeholder expansion.

<!-- /contributing -->

## License

[0BSD](LICENSE) © [Peter Peirce](https://github.com/ppeirce) (Original plugin)

[0BSD](LICENSE) © [Eric Mika](https://ericmika.com) (Fork changes)
