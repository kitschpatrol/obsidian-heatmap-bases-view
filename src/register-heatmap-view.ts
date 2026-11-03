import type { QueryController } from 'obsidian'
import type HeatmapPlugin from './main'
import { HeatmapView } from './heatmap-view'

export function registerHeatmapView(plugin: HeatmapPlugin): void {
	plugin.registerBasesView('heatmap', {
		factory(controller: QueryController, containerElement: HTMLElement) {
			return new HeatmapView(controller, containerElement, plugin)
		},
		icon: 'calendar-heat',
		name: 'Heatmap',
		options: () => [
			{
				displayName: 'Date property',
				key: 'dateProperty',
				placeholder: 'Use filename for daily notes',
				type: 'property',
			},
			{
				displayName: 'Value property',
				key: 'valueProperty',
				type: 'property',
			},
			{
				displayName: 'Start date',
				key: 'startDate',
				placeholder: 'YYYY-MM-DD (leave empty for auto)',
				type: 'text',
			},
			{
				displayName: 'End date',
				key: 'endDate',
				placeholder: 'YYYY-MM-DD (leave empty for today)',
				type: 'text',
			},
			{
				default: 'green',
				displayName: 'Color scheme',
				key: 'colorScheme',
				options: getColorSchemeOptions(plugin),
				type: 'dropdown',
			},
			{
				default: '0',
				displayName: 'Week starts on',
				key: 'weekStart',
				options: {
					'0': 'Sunday',
					'1': 'Monday',
				},
				type: 'dropdown',
			},
			{
				default: true,
				displayName: 'Show weekday labels',
				key: 'showWeekdayLabels',
				type: 'toggle',
			},
			{
				default: true,
				displayName: 'Show month labels',
				key: 'showMonthLabels',
				type: 'toggle',
			},
			{
				default: 'horizontal',
				displayName: 'Layout direction',
				key: 'layoutDirection',
				options: {
					horizontal: 'Horizontal (GitHub-style)',
					vertical: 'Vertical (calendar-style)',
				},
				type: 'dropdown',
			},
			{
				default: 'small',
				displayName: 'Cell size',
				key: 'cellSize',
				options: {
					large: 'Large (24px)',
					medium: 'Medium (16px)',
					small: 'Small (11px)',
				},
				type: 'dropdown',
			},
			{
				displayName: 'Min value',
				key: 'minValue',
				placeholder: 'Auto (based on data)',
				type: 'text',
			},
			{
				displayName: 'Max value',
				key: 'maxValue',
				placeholder: 'Auto (based on data)',
				type: 'text',
			},
		],
	})
}

/**
 * Build dropdown options from color schemes in settings.
 */
function getColorSchemeOptions(plugin: HeatmapPlugin): Record<string, string> {
	const options: Record<string, string> = {}
	for (const scheme of plugin.settings.colorSchemes) {
		options[scheme.id] = scheme.name
	}

	return options
}
