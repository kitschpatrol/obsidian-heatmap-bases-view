import type { BasesEntry, BasesPropertyId } from 'obsidian'
import { BooleanValue, DateValue, NullValue, NumberValue, StringValue } from 'obsidian'
import type { HeatmapEntry, ProcessedData } from './types'
import { formatDateISO, parseDateFromFilename, parseISODateString } from './date-utils'

/**
 * Value types that can be visualized in the heatmap.
 */
export type ValueType = 'boolean' | 'number' | 'unsupported'

/**
 * Convert a property name to BasesPropertyId format. Property IDs are formatted
 * as "type.name"
 */
function toPropertyId(propertyName: string): BasesPropertyId {
	// Bare property names refer to frontmatter. Preserve qualified IDs as-is.
	return (
		propertyName.includes('.') ? propertyName : `frontmatter.${propertyName}`
	) as BasesPropertyId
}

/**
 * Extract the date from a BasesEntry based on configuration.
 */
export function extractDate(entry: BasesEntry, dateProperty: string): null | string {
	if (dateProperty === '__filename__' || !dateProperty) {
		// Parse from filename
		try {
			const parsed = parseDateFromFilename(entry.file.basename)
			if (!parsed) {
				console.warn(`Failed to parse date from filename: "${entry.file.basename}"`, {
					file: entry.file.path,
				})
				return null
			}

			return formatDateISO(parsed)
		} catch (error) {
			console.warn(`Error parsing date from filename: "${entry.file.basename}"`, {
				error: String(error),
				file: entry.file.path,
			})
			return null
		}
	}

	// Get from property
	const propId = toPropertyId(dateProperty)
	const value = entry.getValue(propId)

	if (value === null || value instanceof NullValue) {
		return null
	}

	try {
		// Handle DateValue directly
		if (value instanceof DateValue) {
			const dateString = value.toString()
			// DateValue.toString() should return ISO format
			const parsed = parseISODateString(dateString) ?? new Date(dateString)
			if (Number.isNaN(parsed.getTime())) {
				console.warn(`Invalid date in property "${dateProperty}": "${dateString}"`, {
					file: entry.file.path,
					property: dateProperty,
				})
				return null
			}

			return formatDateISO(parsed)
		}

		// Try to parse from string representation
		const stringValue = value.toString()
		const parsed = parseISODateString(stringValue) ?? new Date(stringValue)
		if (Number.isNaN(parsed.getTime())) {
			console.warn(`Invalid date in property "${dateProperty}": "${stringValue}"`, {
				file: entry.file.path,
				property: dateProperty,
			})
			return null
		}

		return formatDateISO(parsed)
	} catch (error) {
		console.warn(`Error parsing date from property "${dateProperty}"`, {
			error: String(error),
			file: entry.file.path,
			property: dateProperty,
		})
		return null
	}
}

/**
 * Extract and normalize the value from a BasesEntry.
 */
export function extractValue(
	entry: BasesEntry,
	valueProperty: string,
): { displayValue: string; type: ValueType; value: null | number } {
	const propId = toPropertyId(valueProperty)
	const obsidianValue = entry.getValue(propId)

	// Handle missing/null property
	if (obsidianValue === null || obsidianValue instanceof NullValue) {
		return { displayValue: `${valueProperty}: not set`, type: 'unsupported', value: null }
	}

	// Handle BooleanValue
	if (obsidianValue instanceof BooleanValue) {
		const boolValue = obsidianValue.isTruthy()
		return {
			displayValue: boolValue ? 'Yes' : 'No',
			type: 'boolean',
			value: boolValue ? 1 : 0,
		}
	}

	// Handle NumberValue
	if (obsidianValue instanceof NumberValue) {
		const numberValue = Number(obsidianValue.toString())
		if (Number.isNaN(numberValue)) {
			return {
				displayValue: obsidianValue.toString(),
				type: 'unsupported',
				value: null,
			}
		}

		return {
			displayValue: String(numberValue),
			type: 'number',
			value: numberValue,
		}
	}

	// Handle StringValue - try to parse as number or boolean
	if (obsidianValue instanceof StringValue) {
		const stringValue = obsidianValue.toString()

		// Try parsing as number
		const numericValue = parseFloat(stringValue)
		if (!Number.isNaN(numericValue)) {
			return {
				displayValue: stringValue,
				type: 'number',
				value: numericValue,
			}
		}

		// Try parsing as boolean strings
		const lower = stringValue.toLowerCase()
		if (lower === 'true' || lower === 'yes') {
			return { displayValue: 'Yes', type: 'boolean', value: 1 }
		}

		if (lower === 'false' || lower === 'no') {
			return { displayValue: 'No', type: 'boolean', value: 0 }
		}

		// Unsupported string
		return {
			displayValue: stringValue,
			type: 'unsupported',
			value: null,
		}
	}

	// Fallback - try to use isTruthy() for other Value types
	const isTruthy = obsidianValue.isTruthy()
	return {
		displayValue: obsidianValue.toString(),
		type: 'boolean',
		value: isTruthy ? 1 : 0,
	}
}

/**
 * Process BasesEntry results into heatmap data.
 */
export function processData(
	entries: BasesEntry[],
	dateProperty: string,
	valueProperty: string,
): ProcessedData {
	const heatmapEntries = new Map<string, HeatmapEntry>()
	let min = Infinity
	let max = -Infinity
	let count = 0
	let hasNumeric = false
	let skippedEntries = 0

	for (const entry of entries) {
		const date = extractDate(entry, dateProperty)
		if (!date) {
			skippedEntries++
			continue // Skip entries without valid dates
		}

		const { displayValue, type, value } = extractValue(entry, valueProperty)

		// Track if we have numeric values (not just boolean)
		if (type === 'number' && value !== null && value !== 0 && value !== 1) {
			hasNumeric = true
		}

		// Update stats for non-null values (including 0)
		if (value !== null) {
			min = Math.min(min, value)
			max = Math.max(max, value)
			count++
		}

		// If multiple entries have the same date, keep the one with higher value
		// or the first one if equal
		const existing = heatmapEntries.get(date)
		if (existing) {
			if (value !== null && (existing.value === null || value > existing.value)) {
				heatmapEntries.set(date, { date, displayValue, note: entry.file, value })
			}
		} else {
			heatmapEntries.set(date, { date, displayValue, note: entry.file, value })
		}
	}

	// Handle edge cases
	if (min === Infinity) {
		min = 0
	}

	if (max === -Infinity) {
		max = 1
	}

	if (min === max && min > 0) {
		// Single value case - set min to 0 for better intensity scaling
		min = 0
	}

	// Log summary if entries were skipped
	if (skippedEntries > 0) {
		console.warn(
			`Data processing summary: ${skippedEntries} entries skipped due to invalid dates.`,
			{
				dateProperty,
				skippedEntries,
				successfulEntries: heatmapEntries.size,
				totalEntries: entries.length,
			},
		)
	}

	return {
		entries: heatmapEntries,
		stats: {
			count,
			hasNumeric,
			max,
			min,
		},
	}
}

/**
 * Detect the value type for a property across all entries.
 */
export function detectValueType(
	entries: BasesEntry[],
	valueProperty: string,
	dateProperty: string,
): ValueType {
	let seenBoolean = false
	let seenNumber = false
	let seenValidEntry = false

	const propId = toPropertyId(valueProperty)

	for (const entry of entries) {
		// Only consider entries that have valid dates
		const date = extractDate(entry, dateProperty)
		if (!date) {
			continue
		}

		const obsidianValue = entry.getValue(propId)
		if (obsidianValue === null || obsidianValue instanceof NullValue) {
			continue
		}

		seenValidEntry = true

		if (obsidianValue instanceof BooleanValue) {
			seenBoolean = true
		} else if (obsidianValue instanceof NumberValue) {
			const numberValue = Number(obsidianValue.toString())
			if (Number.isNaN(numberValue)) {
				return 'unsupported'
			}

			// Check if it's used as a boolean (0 or 1) or as a real number
			if (numberValue === 0 || numberValue === 1) {
				seenBoolean = true
			} else {
				seenNumber = true
			}
		} else if (obsidianValue instanceof StringValue) {
			const stringValue = obsidianValue.toString()
			const numericValue = parseFloat(stringValue)
			if (Number.isNaN(numericValue)) {
				const lower = stringValue.toLowerCase()
				if (['false', 'no', 'true', 'yes'].includes(lower)) {
					seenBoolean = true
				} else {
					return 'unsupported'
				}
			} else if (numericValue === 0 || numericValue === 1) {
				seenBoolean = true
			} else {
				seenNumber = true
			}
		} else {
			// Other Value types - try to use as boolean via isTruthy
			seenBoolean = true
		}
	}

	// If we didn't see any valid entries, treat as unsupported
	if (!seenValidEntry) {
		return 'unsupported'
	}

	if (seenNumber) {
		return 'number'
	}

	if (seenBoolean) {
		return 'boolean'
	}

	return 'unsupported'
}
