import { Plugin } from 'obsidian'
import type { HeatmapPluginSettings } from './settings/defaults'
import { registerHeatmapView } from './register-heatmap-view'
import { DEFAULT_COLOR_SCHEMES, DEFAULT_SETTINGS } from './settings/defaults'
import { HeatmapSettingTab } from './settings/settings'

/**
 * Heatmap Bases View Plugin
 *
 * Provides a GitHub-contributions-style heatmap view for Obsidian Bases.
 * Visualizes boolean or numeric properties from daily notes over time.
 */
export default class HeatmapPlugin extends Plugin {
	override settings: HeatmapPluginSettings = { ...DEFAULT_SETTINGS }

	override async onload() {
		await this.loadSettings()
		this.addSettingTab(new HeatmapSettingTab(this.app, this))

		// Register with Page Preview plugin for hover previews
		// Note: registerHoverLinkSource is not in the public type definitions but exists at runtime
		;(
			this.app.workspace as unknown as {
				registerHoverLinkSource: (
					id: string,
					info: { defaultMod: boolean; display: string },
				) => void
			}
		).registerHoverLinkSource('heatmap-bases-view', {
			defaultMod: true,
			display: 'Heatmap',
		})

		registerHeatmapView(this)
	}

	override onunload() {
		// Cleanup is handled automatically by Obsidian
	}

	async loadSettings() {
		const loaded = (await this.loadData()) as HeatmapPluginSettings | null
		this.settings = { ...DEFAULT_SETTINGS, ...loaded }
		// Ensure colorSchemes exists (migration from old settings)
		if (!this.settings.colorSchemes || this.settings.colorSchemes.length === 0) {
			this.settings.colorSchemes = DEFAULT_COLOR_SCHEMES
		}
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}
