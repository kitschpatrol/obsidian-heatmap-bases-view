import { describe, expect, it } from 'vitest'
import type { HeatmapEntry, ProcessedData } from './types'
import { renderHeatmap } from './renderer'
import { CELL_SIZE_VALUES } from './types'

const schemeDefinition = {
	dark: { max: '#ffffff', zero: '#000000' },
	light: { max: '#ffffff', zero: '#000000' },
}

function buildData(): ProcessedData {
	const entry: HeatmapEntry = {
		date: '2024-01-03',
		displayValue: '5 changes',
		note: {} as HeatmapEntry['note'],
		value: 5,
	}

	return {
		entries: new Map([[entry.date, entry]]),
		stats: {
			count: 1,
			hasNumeric: true,
			max: 5,
			min: 0,
		},
	}
}

describe('renderHeatmap', () => {
	it('applies layout class and cell size variable', () => {
		const heatmap = renderHeatmap(
			buildData(),
			{ start: new Date(2024, 0, 1), end: new Date(2024, 0, 3) },
			{
				cellSize: 'medium',
				layoutDirection: 'horizontal',
				schemeDefinition,
				showMonthLabels: false,
				showWeekdayLabels: false,
				weekStart: 1,
			},
		)

		expect(heatmap.classList.contains('heatmap--horizontal')).toBe(true)
		expect(heatmap.style.getPropertyValue('--cell-size')).toBe(`${CELL_SIZE_VALUES.medium}px`)

		const grid = heatmap.querySelector<HTMLElement>('.heatmap-cells')!
		expect(grid.style.getPropertyValue('--total-weeks')).toBe('1')
	})

	it('adds role and aria-labels for accessibility', () => {
		const heatmap = renderHeatmap(
			buildData(),
			{ start: new Date(2024, 0, 1), end: new Date(2024, 0, 3) },
			{
				cellSize: 'small',
				layoutDirection: 'horizontal',
				schemeDefinition,
				showMonthLabels: false,
				showWeekdayLabels: false,
				weekStart: 1,
			},
		)

		const grid = heatmap.querySelector<HTMLElement>('.heatmap-cells')
		expect(grid?.getAttribute('role')).toBe('grid')

		const cell = heatmap.querySelector<HTMLElement>('.heatmap-cell[data-date="2024-01-03"]')
		expect(cell?.getAttribute('aria-label')).toContain('2024')
		expect(cell?.getAttribute('aria-label')).toContain('5 changes')
	})

	it('swaps row and column for vertical layout', () => {
		const horizontal = renderHeatmap(
			buildData(),
			{ start: new Date(2024, 0, 1), end: new Date(2024, 0, 3) },
			{
				cellSize: 'small',
				layoutDirection: 'horizontal',
				schemeDefinition,
				showMonthLabels: false,
				showWeekdayLabels: false,
				weekStart: 1,
			},
		)

		const vertical = renderHeatmap(
			buildData(),
			{ start: new Date(2024, 0, 1), end: new Date(2024, 0, 3) },
			{
				cellSize: 'small',
				layoutDirection: 'vertical',
				schemeDefinition,
				showMonthLabels: false,
				showWeekdayLabels: false,
				weekStart: 1,
			},
		)

		expect(vertical.classList.contains('heatmap--vertical')).toBe(true)

		const horizontalCell = horizontal.querySelector<HTMLElement>(
			'.heatmap-cell[data-date="2024-01-03"]',
		)!
		const verticalCell = vertical.querySelector<HTMLElement>(
			'.heatmap-cell[data-date="2024-01-03"]',
		)!

		expect(horizontalCell.style.gridRow).toBe('3')
		expect(horizontalCell.style.gridColumn).toBe('1')
		expect(verticalCell.style.gridRow).toBe('1')
		expect(verticalCell.style.gridColumn).toBe('3')
	})
})
