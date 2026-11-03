import type { BasesEntry, QueryController } from 'obsidian'
import { BasesView } from 'obsidian'
import type HeatmapPlugin from './main'
import type { RenderOptions } from './renderer'
import type {
	CellSizePreset,
	ColorScheme,
	HeatmapViewConfig,
	LayoutDirection,
	ProcessedData,
} from './types'
import { getSchemeDefinition } from './color-utils'
import { detectValueType, processData } from './data'
import { calculateDateRange } from './date-utils'
import { setupInteractions } from './interactions'
import { createEmptyState, renderHeatmap } from './renderer'

/**
 * Heatmap view implementation for Obsidian Bases.
 */
export class HeatmapView extends BasesView {
	readonly type = 'heatmap'

	private readonly containerEl: HTMLElement
	private cleanupInteractions: (() => void) | null = null
	private processedData: null | ProcessedData = null

	constructor(
		controller: QueryController,
		parentElement: HTMLElement,
		private readonly plugin: HeatmapPlugin,
	) {
		super(controller)
		this.containerEl = parentElement.createDiv('heatmap-view-container')
	}

	/**
	 * Get the current view configuration with defaults.
	 */
	private getConfig(): HeatmapViewConfig {
		const { config } = this

		// Parse optional numeric values
		const minValueString = config.get('minValue') as string
		const maxValueString = config.get('maxValue') as string
		const minValue = minValueString ? parseFloat(minValueString) : null
		const maxValue = maxValueString ? parseFloat(maxValueString) : null

		return {
			cellSize: (config.get('cellSize') as CellSizePreset) || 'small',
			colorScheme: (config.get('colorScheme') as ColorScheme) || 'green',
			dateProperty: (config.get('dateProperty') as string) || '__filename__',
			endDate: (config.get('endDate') as string) || null,
			layoutDirection: (config.get('layoutDirection') as LayoutDirection) || 'horizontal',
			maxValue: maxValue === null || Number.isNaN(maxValue) ? null : maxValue,
			minValue: minValue === null || Number.isNaN(minValue) ? null : minValue,
			showMonthLabels: config.get('showMonthLabels') !== false,
			showWeekdayLabels: config.get('showWeekdayLabels') !== false,
			startDate: (config.get('startDate') as string) || null,
			valueProperty: (config.get('valueProperty') as string) || '',
			weekStart: parseInt((config.get('weekStart') as string) || '0', 10) as 0 | 1,
		}
	}

	/**
	 * Called when query data changes.
	 */
	onDataUpdated(): void {
		this.render()
	}

	/**
	 * Render the heatmap view.
	 */
	private render(): void {
		// Clean up previous interactions
		if (this.cleanupInteractions) {
			this.cleanupInteractions()
			this.cleanupInteractions = null
		}

		// Clear container
		this.containerEl.empty()

		const viewConfig = this.getConfig()

		// Check for required configuration
		if (!viewConfig.valueProperty) {
			const emptyState = createEmptyState(
				'Configure value property',
				'Select a property to visualize in the view settings.',
			)
			this.containerEl.append(emptyState)
			return
		}

		// Get entries from query data
		const queryData = this.data

		// If data hasn't loaded yet, don't render anything.
		// onDataUpdated() will be called again when data is ready.
		if (!queryData) {
			return
		}

		const entries: BasesEntry[] = queryData.data || []

		if (entries.length === 0) {
			const emptyState = createEmptyState(
				'No data to display',
				'No notes found in the current filter. Check your Base filters.',
			)
			this.containerEl.append(emptyState)
			return
		}

		// Detect value type for validation
		const valueType = detectValueType(entries, viewConfig.valueProperty, viewConfig.dateProperty)
		if (valueType === 'unsupported') {
			const emptyState = createEmptyState(
				'Unsupported property type',
				`"${viewConfig.valueProperty}" is not a boolean or number property. Heatmap requires boolean or number properties.`,
			)
			this.containerEl.append(emptyState)
			return
		}

		// Process data
		this.processedData = processData(entries, viewConfig.dateProperty, viewConfig.valueProperty)

		// Override stats with config values if provided
		if (viewConfig.minValue !== null) {
			this.processedData.stats.min = viewConfig.minValue
		}

		if (viewConfig.maxValue !== null) {
			this.processedData.stats.max = viewConfig.maxValue
		}

		// Check if we have any valid dated entries
		if (this.processedData.entries.size === 0) {
			const emptyState = createEmptyState(
				'No dated notes found',
				'No notes with valid dates were found. Check your date property setting.',
			)
			this.containerEl.append(emptyState)
			return
		}

		// Calculate date range
		const dateRange = calculateDateRange(
			this.processedData.entries,
			viewConfig.startDate,
			viewConfig.endDate,
		)

		// Look up color scheme from plugin settings
		const schemeItem =
			this.plugin.settings.colorSchemes.find((s) => s.id === viewConfig.colorScheme) ??
			this.plugin.settings.colorSchemes[0]
		const schemeDefinition = getSchemeDefinition(schemeItem)

		// Render options
		const renderOptions: RenderOptions = {
			cellSize: viewConfig.cellSize,
			layoutDirection: viewConfig.layoutDirection,
			schemeDefinition,
			showMonthLabels: viewConfig.showMonthLabels,
			showWeekdayLabels: viewConfig.showWeekdayLabels,
			weekStart: viewConfig.weekStart,
		}

		// Render heatmap
		const heatmapElement = renderHeatmap(this.processedData, dateRange, renderOptions)
		this.containerEl.append(heatmapElement)

		// Set up interactions
		this.cleanupInteractions = setupInteractions({
			app: this.app,
			containerEl: heatmapElement,
			entries: this.processedData.entries,
			layoutDirection: viewConfig.layoutDirection,
			plugin: this.plugin,
		})
	}
}
