import type {
	App,
	SettingDefinitionAction,
	SettingDefinitionControl,
	SettingDefinitionList,
} from 'obsidian'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type HeatmapPlugin from '../main'
import type { ColorSchemeItem } from '../types'
import { DEFAULT_COLOR_SCHEMES } from './defaults'
import { HeatmapSettingTab } from './settings'

type ModalRecord = {
	isNew: boolean
	onSave: (scheme: ColorSchemeItem) => void
	opened: boolean
	scheme: ColorSchemeItem
}

const modals = vi.hoisted(() => [] as ModalRecord[])

vi.mock('./edit-scheme-modal', () => ({
	EditSchemeModal: class {
		private readonly record: ModalRecord

		constructor(
			_app: App,
			scheme: ColorSchemeItem,
			isNew: boolean,
			onSave: (scheme: ColorSchemeItem) => void,
		) {
			this.record = { isNew, onSave, opened: false, scheme }
			modals.push(this.record)
		}

		open() {
			this.record.opened = true
		}
	},
}))

const FIRST: ColorSchemeItem = {
	id: 'first',
	maxColor: '#111111',
	name: 'First',
	zeroColor: '#000000',
}
const SECOND: ColorSchemeItem = {
	id: 'second',
	maxColor: '#222222',
	name: 'Second',
	zeroColor: '#000000',
}
const THIRD: ColorSchemeItem = {
	id: 'third',
	maxColor: '#333333',
	name: 'Third',
	zeroColor: '#000000',
}

function createTab(colorSchemes: ColorSchemeItem[]) {
	const plugin = {
		saveSettings: vi.fn<() => Promise<void>>().mockResolvedValue(),
		settings: { colorSchemes, showHexColorInTooltip: false },
	}
	const tab = new HeatmapSettingTab({} as App, plugin as unknown as HeatmapPlugin)
	const update = vi.spyOn(tab, 'update')
	return { plugin, tab, update }
}

function getList(tab: HeatmapSettingTab): SettingDefinitionList {
	const list = tab.getSettingDefinitions().find((item) => 'type' in item && item.type === 'list')
	if (!list) {
		throw new Error('Expected a list definition')
	}

	return list as SettingDefinitionList
}

function getRows(tab: HeatmapSettingTab): SettingDefinitionAction[] {
	return getList(tab).items as SettingDefinitionAction[]
}

async function flushSave(): Promise<void> {
	await new Promise((resolve) => {
		setTimeout(resolve, 0)
	})
}

describe('HeatmapSettingTab', () => {
	beforeEach(() => {
		modals.length = 0
	})

	describe('tooltip setting', () => {
		it('binds a toggle to the showHexColorInTooltip key, disabled by default', () => {
			const { tab } = createTab([FIRST])
			const toggle = tab.getSettingDefinitions()[0] as SettingDefinitionControl

			expect(toggle.control).toEqual({
				defaultValue: false,
				key: 'showHexColorInTooltip',
				type: 'toggle',
			})
		})
	})

	describe('color scheme list', () => {
		it('renders one row per scheme, in order', () => {
			const { tab } = createTab([FIRST, SECOND])

			expect(getRows(tab).map((row) => row.name)).toEqual(['First', 'Second'])
		})

		it('describes each row with a gradient preview and its colors', () => {
			const { tab } = createTab([FIRST])
			const container = document.createElement('div')
			container.append(getRows(tab)[0].desc as DocumentFragment)
			const preview = container.querySelector<HTMLElement>('.heatmap-color-scheme-preview')

			expect(container.textContent).toBe('#000000 → #111111')
			expect(preview?.style.getPropertyValue('background')).toContain('linear-gradient')
		})

		it('rebuilds rows from current settings on each call', () => {
			const { plugin, tab } = createTab([FIRST])
			plugin.settings.colorSchemes = [SECOND]

			expect(getRows(tab).map((row) => row.name)).toEqual(['Second'])
		})
	})

	describe('adding a scheme', () => {
		it('appends the saved scheme, persists it, and refreshes the tab', async () => {
			const { plugin, tab, update } = createTab([FIRST])

			getList(tab).addItem?.action(document.createElement('button'))
			expect(modals).toHaveLength(1)
			expect(modals[0]).toMatchObject({ isNew: true, opened: true })

			modals[0].onSave(SECOND)
			await flushSave()

			expect(plugin.settings.colorSchemes).toEqual([FIRST, SECOND])
			expect(plugin.saveSettings).toHaveBeenCalledOnce()
			expect(update).toHaveBeenCalledOnce()
		})

		it('changes nothing when the modal is never saved', async () => {
			const { plugin, tab } = createTab([FIRST])

			getList(tab).addItem?.action(document.createElement('button'))
			await flushSave()

			expect(plugin.settings.colorSchemes).toEqual([FIRST])
			expect(plugin.saveSettings).not.toHaveBeenCalled()
		})
	})

	describe('editing a scheme', () => {
		it('opens the modal for the selected row and replaces only that scheme', async () => {
			const { plugin, tab, update } = createTab([FIRST, SECOND, THIRD])
			const edited = { ...SECOND, name: 'Edited' }

			getRows(tab)[1].action(document.createElement('div'), 1)
			expect(modals[0]).toMatchObject({ isNew: false, opened: true, scheme: SECOND })

			modals[0].onSave(edited)
			await flushSave()

			expect(plugin.settings.colorSchemes).toEqual([FIRST, edited, THIRD])
			expect(plugin.saveSettings).toHaveBeenCalledOnce()
			expect(update).toHaveBeenCalledOnce()
		})

		it('targets the selected row when schemes share an id', async () => {
			const duplicate = { ...FIRST, name: 'Duplicate id' }
			const { plugin, tab } = createTab([FIRST, duplicate])
			const edited = { ...duplicate, name: 'Edited' }

			getRows(tab)[1].action(document.createElement('div'), 1)
			modals[0].onSave(edited)
			await flushSave()

			expect(plugin.settings.colorSchemes).toEqual([FIRST, edited])
		})
	})

	describe('deleting a scheme', () => {
		it('removes the row at the given index, persists it, and refreshes the tab', async () => {
			const { plugin, tab, update } = createTab([FIRST, SECOND, THIRD])

			getList(tab).onDelete?.(1)
			await flushSave()

			expect(plugin.settings.colorSchemes).toEqual([FIRST, THIRD])
			expect(plugin.saveSettings).toHaveBeenCalledOnce()
			expect(update).toHaveBeenCalledOnce()
		})

		it('restores the default schemes when the last scheme is deleted', async () => {
			const { plugin, tab } = createTab([FIRST])

			getList(tab).onDelete?.(0)
			await flushSave()

			expect(plugin.settings.colorSchemes).toEqual(DEFAULT_COLOR_SCHEMES)
			expect(plugin.saveSettings).toHaveBeenCalledOnce()
		})

		it('keeps the defaults intact when every scheme of a fresh install is deleted', async () => {
			const defaultCount = DEFAULT_COLOR_SCHEMES.length
			// A fresh install's settings share the default array by reference.
			const { plugin, tab } = createTab(DEFAULT_COLOR_SCHEMES)

			for (let remaining = defaultCount; remaining > 0; remaining--) {
				getList(tab).onDelete?.(0)
				await flushSave()
			}

			expect(DEFAULT_COLOR_SCHEMES).toHaveLength(defaultCount)
			expect(plugin.settings.colorSchemes).toEqual(DEFAULT_COLOR_SCHEMES)
		})
	})
})
