import type { App } from 'obsidian'
import { setTooltip } from 'obsidian'
import type HeatmapPlugin from './main'
import type { HeatmapEntry, LayoutDirection } from './types'
import { formatDateDisplay, parseISODateString } from './date-utils'

export type InteractionHandlerOptions = {
	app: App
	containerEl: HTMLElement
	entries: Map<string, HeatmapEntry>
	layoutDirection?: LayoutDirection
	plugin: HeatmapPlugin
}

/**
 * Set up interaction handlers for the heatmap cells.
 */
export function setupInteractions(options: InteractionHandlerOptions): () => void {
	const { app, containerEl, entries, layoutDirection = 'horizontal', plugin } = options

	// Track event listeners for cleanup
	const cleanupFns: Array<() => void> = []

	// Handle cell clicks
	const clickHandler = (event: MouseEvent) => {
		const target = event.target as HTMLElement
		const cell = target.closest('.heatmap-cell')

		if (!(cell instanceof HTMLElement)) {
			return
		}

		const { notePath } = cell.dataset
		if (notePath) {
			// Open the note
			void app.workspace.openLinkText(notePath, '', false)
		}
	}

	containerEl.addEventListener('click', clickHandler)
	cleanupFns.push(() => {
		containerEl.removeEventListener('click', clickHandler)
	})

	// Handle hover for tooltips and page preview
	const mouseoverHandler = (event: MouseEvent) => {
		const target = event.target as HTMLElement
		const cell = target.closest('.heatmap-cell')

		if (!(cell instanceof HTMLElement)) {
			return
		}

		const dateString = cell.dataset.date
		if (!dateString) {
			return
		}

		// Trigger page preview when Ctrl/Cmd is held
		const { notePath } = cell.dataset
		if (notePath && (event.ctrlKey || event.metaKey)) {
			app.workspace.trigger('hover-link', {
				event,
				hoverParent: containerEl,
				linktext: notePath,
				source: 'heatmap-bases-view',
				sourcePath: '',
				targetEl: cell,
			})
		}

		const tooltipContent = buildTooltipContent(dateString, entries.get(dateString), cell, plugin)
		setTooltip(cell, tooltipContent, { placement: 'top' })
	}

	containerEl.addEventListener('mouseover', mouseoverHandler)
	cleanupFns.push(() => {
		containerEl.removeEventListener('mouseover', mouseoverHandler)
	})

	// Handle keyboard navigation
	const keydownHandler = (event: KeyboardEvent) => {
		const target = event.target as HTMLElement
		const cell = target.closest('.heatmap-cell')

		if (!(cell instanceof HTMLElement)) {
			return
		}

		const dateString = cell.dataset.date
		if (!dateString) {
			return
		}

		// Handle Enter key to open note
		if (event.key === 'Enter') {
			const { notePath } = cell.dataset
			if (notePath) {
				void app.workspace.openLinkText(notePath, '', false)
			}
		}

		// Handle arrow key navigation
		if (!['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(event.key)) {
			return
		}

		event.preventDefault()
		navigateToAdjacentCell(cell, event.key, containerEl, layoutDirection)
	}

	containerEl.addEventListener('keydown', keydownHandler)
	cleanupFns.push(() => {
		containerEl.removeEventListener('keydown', keydownHandler)
	})

	// Make cells focusable for keyboard navigation
	const cells = containerEl.querySelectorAll('.heatmap-cell')
	cells.forEach((cell) => {
		;(cell as HTMLElement).tabIndex = 0
	})

	// Return cleanup function
	return () => {
		for (const fn of cleanupFns) {
			fn()
		}
	}
}

/**
 * Build tooltip content for a cell.
 */
function buildTooltipContent(
	dateString: string,
	entry: HeatmapEntry | undefined,
	cell: HTMLElement,
	plugin: HeatmapPlugin,
): string {
	const formattedDate = formatDateDisplay(dateString)

	if (!entry) {
		return `${formattedDate}\nNo note`
	}

	// An empty DOM value falls back to the entry's display value.
	// eslint-disable-next-line ts/prefer-nullish-coalescing
	const displayValue = cell.dataset.displayValue || entry.displayValue
	const hexColor = cell.style.backgroundColor ? rgbToHex(cell.style.backgroundColor) : ''
	const colorInfo = hexColor && plugin.settings.showHexColorInTooltip ? `\n${hexColor}` : ''
	return `${formattedDate}\n${displayValue}${colorInfo}`
}

/**
 * Convert RGB color string to hex.
 */
function rgbToHex(rgb: string): string {
	// Handle hex strings passed through
	if (rgb.startsWith('#')) {
		return rgb
	}

	// Parse rgb(r, g, b) format
	const match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/u.exec(rgb)
	if (!match) {
		return rgb
	}

	const r = parseInt(match[1], 10)
	const g = parseInt(match[2], 10)
	const b = parseInt(match[3], 10)

	const toHex = (n: number) => n.toString(16).padStart(2, '0')
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Navigate to an adjacent cell based on arrow key.
 */
function navigateToAdjacentCell(
	currentCell: HTMLElement,
	key: string,
	containerElement: HTMLElement,
	layoutDirection: LayoutDirection,
): void {
	const currentDate = currentCell.dataset.date
	if (!currentDate) {
		return
	}

	const date = parseISODateString(currentDate) ?? new Date(currentDate)
	if (Number.isNaN(date.getTime())) {
		return
	}

	let dayOffset: number
	const isVertical = layoutDirection === 'vertical'

	switch (key) {
		case 'ArrowDown': {
			dayOffset = isVertical ? 7 : 1
			break
		}

		case 'ArrowLeft': {
			dayOffset = isVertical ? -1 : -7
			break
		}

		case 'ArrowRight': {
			dayOffset = isVertical ? 1 : 7
			break
		}

		case 'ArrowUp': {
			dayOffset = isVertical ? -7 : -1
			break
		}

		default: {
			return
		}
	}

	const targetDate = new Date(date)
	targetDate.setDate(date.getDate() + dayOffset)

	const targetDateString = formatDateISO(targetDate)
	const targetCell = containerElement.querySelector(
		// eslint-disable-next-line unicorn/require-css-escape -- ISO dates contain only digits and hyphens.
		`.heatmap-cell[data-date="${targetDateString}"]`,
	)

	if (targetCell instanceof HTMLElement) {
		targetCell.focus()
	}
}

/**
 * Format date to ISO string (duplicated here to avoid circular imports).
 */
function formatDateISO(date: Date): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}
