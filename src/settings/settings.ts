import type { App, SettingDefinitionItem } from 'obsidian'
import { PluginSettingTab } from 'obsidian'
import type HeatmapPlugin from '../main'
import type { ColorSchemeItem } from '../types'
import type { HeatmapPluginSettings } from './defaults'
import { DEFAULT_COLOR_SCHEMES, DEFAULT_SETTINGS } from './defaults'
import { EditSchemeModal } from './edit-scheme-modal'

/**
 * Settings tab for the Heatmap plugin.
 */
export class HeatmapSettingTab extends PluginSettingTab {
	plugin: HeatmapPlugin

	constructor(app: App, plugin: HeatmapPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	override getSettingDefinitions(): Array<SettingDefinitionItem<keyof HeatmapPluginSettings>> {
		return [
			{
				control: {
					defaultValue: DEFAULT_SETTINGS.showHexColorInTooltip,
					key: 'showHexColorInTooltip',
					type: 'toggle',
				},
				desc: 'Display the hex color code in cell tooltips on hover',
				name: 'Show hex color in tooltip',
			},
			{
				addItem: {
					action: () => {
						this.addScheme()
					},
					name: 'Add color scheme',
				},
				heading: 'Color schemes',
				items: this.plugin.settings.colorSchemes.map((scheme) => ({
					action: (_element: HTMLElement, index: number) => {
						this.editScheme(index)
					},
					desc: createSchemeDescription(scheme),
					name: scheme.name,
				})),
				onDelete: (index) => {
					void this.saveSchemes(
						this.plugin.settings.colorSchemes.filter((_scheme, itemIndex) => itemIndex !== index),
					)
				},
				type: 'list',
			},
		]
	}

	private addScheme(): void {
		const newScheme: ColorSchemeItem = {
			id: '',
			maxColor: '#39d353',
			name: '',
			zeroColor: '#ebedf0',
		}

		new EditSchemeModal(this.app, newScheme, true, (result) => {
			void this.saveSchemes([...this.plugin.settings.colorSchemes, result])
		}).open()
	}

	private editScheme(index: number): void {
		const scheme = this.plugin.settings.colorSchemes[index]

		new EditSchemeModal(this.app, scheme, false, (result) => {
			void this.saveSchemes(
				this.plugin.settings.colorSchemes.map((item, itemIndex) =>
					itemIndex === index ? result : item,
				),
			)
		}).open()
	}

	private async saveSchemes(colorSchemes: ColorSchemeItem[]): Promise<void> {
		// Ensure we always have at least one scheme
		this.plugin.settings.colorSchemes =
			colorSchemes.length > 0 ? colorSchemes : [...DEFAULT_COLOR_SCHEMES]

		await this.plugin.saveSettings()
		this.update()
	}
}

/**
 * Build a scheme's row description: a gradient preview followed by its colors.
 */
function createSchemeDescription(scheme: ColorSchemeItem): DocumentFragment {
	const preview = document.createElement('span')
	preview.className = 'heatmap-color-scheme-preview'
	preview.style.setProperty(
		'background',
		`linear-gradient(to right, ${scheme.zeroColor}, ${scheme.maxColor})`,
	)

	const fragment = document.createDocumentFragment()
	fragment.append(preview, `${scheme.zeroColor} → ${scheme.maxColor}`)
	return fragment
}
