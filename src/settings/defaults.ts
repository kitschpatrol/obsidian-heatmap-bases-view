import type { ColorSchemeItem } from '../types'

/**
 * Plugin-wide settings.
 */
export type HeatmapPluginSettings = {
	colorSchemes: ColorSchemeItem[]
	showHexColorInTooltip: boolean
}

/**
 * Default color schemes that ship with the plugin.
 */
export const DEFAULT_COLOR_SCHEMES: ColorSchemeItem[] = [
	{ id: 'green', isDefault: true, maxColor: '#39d353', name: 'Green', zeroColor: '#ebedf0' },
	{ id: 'purple', isDefault: true, maxColor: '#a78bfa', name: 'Purple', zeroColor: '#ebedf0' },
	{ id: 'blue', isDefault: true, maxColor: '#38bdf8', name: 'Blue', zeroColor: '#ebedf0' },
	{ id: 'orange', isDefault: true, maxColor: '#fb923c', name: 'Orange', zeroColor: '#ebedf0' },
	{ id: 'gray', isDefault: true, maxColor: '#adbac7', name: 'Gray', zeroColor: '#ebedf0' },
]

export const DEFAULT_SETTINGS: HeatmapPluginSettings = {
	colorSchemes: DEFAULT_COLOR_SCHEMES,
	showHexColorInTooltip: false,
}
