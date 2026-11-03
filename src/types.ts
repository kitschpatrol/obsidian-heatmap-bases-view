import type { TFile } from 'obsidian'

/**
 * Represents a single note's data for the heatmap.
 */
export type HeatmapEntry = {
	date: string // ISO date string "YYYY-MM-DD"
	displayValue: string // Formatted value for tooltip
	note: TFile // Reference to the note
	value: null | number // Null = note exists but property missing/false
}

/**
 * Output of DataProcessor, input to HeatmapRenderer.
 */
export type ProcessedData = {
	entries: Map<string, HeatmapEntry>
	stats: {
		count: number
		hasNumeric: boolean // False if all boolean
		max: number
		min: number
	}
}

/**
 * Configuration for the heatmap view, stored in the Base file.
 */
export type HeatmapViewConfig = {
	cellSize: CellSizePreset
	colorScheme: ColorScheme // Scheme id from plugin settings
	dateProperty: string // Property name or "__filename__"
	endDate: null | string // ISO date or null for auto
	layoutDirection: LayoutDirection
	maxValue: null | number // Override max for intensity scale (null = auto)
	minValue: null | number // Override min for intensity scale (null = auto)
	showMonthLabels: boolean
	showWeekdayLabels: boolean
	startDate: null | string // ISO date or null for auto
	valueProperty: string // Property name to visualize
	weekStart: 0 | 1 // 0 = Sunday, 1 = Monday
}

// ColorScheme is now a string (scheme id) since schemes are user-configurable
export type ColorScheme = string

export type LayoutDirection = 'horizontal' | 'vertical'

export type CellSizePreset = 'large' | 'medium' | 'small'

export const CELL_SIZE_VALUES: Record<CellSizePreset, number> = {
	large: 24,
	medium: 16,
	small: 11,
}

/**
 * A user-configurable color scheme stored in plugin settings.
 */
export type ColorSchemeItem = {
	id: string // Unique identifier (e.g., 'green', 'my-custom')
	isDefault?: boolean // True for built-in schemes
	maxColor: string // Hex color for max intensity
	name: string // Display name (e.g., 'Green', 'My Custom')
	zeroColor: string // Hex color for zero/empty values
}

/**
 * Represents the visual state of a single cell.
 */
export type CellState =
	| { intensity: number; note: TFile; type: 'filled' } // 0-1 intensity
	| { note: TFile; type: 'zero' } // Note exists, value is 0/false
	| { type: 'empty' } // No note for this date

/**
 * Date range for rendering.
 */
export type DateRange = {
	start: Date
	end: Date
}

/**
 * Month label position for rendering.
 */
export type MonthLabel = {
	endColumn: number
	name: string
	startColumn: number
}

/**
 * Month label position for vertical layout rendering.
 */
export type VerticalMonthLabel = {
	endRow: number
	name: string
	startRow: number
}
