import type { App } from 'obsidian'
import { Modal, Setting } from 'obsidian'
import type { ColorSchemeItem } from '../types'
import { isValidHexColor } from '../color-utils'

/**
 * Modal for editing or creating a color scheme.
 */
export class EditSchemeModal extends Modal {
	private readonly scheme: ColorSchemeItem
	private readonly isNew: boolean
	private readonly onSave: (scheme: ColorSchemeItem) => void
	private errorEl: HTMLElement | null = null

	constructor(
		app: App,
		scheme: ColorSchemeItem,
		isNew: boolean,
		onSave: (scheme: ColorSchemeItem) => void,
	) {
		super(app)
		this.scheme = { ...scheme }
		this.isNew = isNew
		this.onSave = onSave
	}

	override onOpen() {
		const { contentEl } = this
		contentEl.empty()
		contentEl.createEl('h2', { text: this.isNew ? 'Add color scheme' : 'Edit color scheme' })

		new Setting(contentEl)
			.setName('Name')
			.setDesc('Display name for this color scheme')
			.addText((text) =>
				text
					.setPlaceholder('My custom scheme')
					.setValue(this.scheme.name)
					.onChange((value) => {
						this.scheme.name = value
					}),
			)

		new Setting(contentEl)
			.setName('Zero color')
			.setDesc('Color for empty/zero values (hex format, e.g. #ebedf0)')
			.addText((text) =>
				text
					.setPlaceholder('#ebedf0')
					.setValue(this.scheme.zeroColor)
					.onChange((value) => {
						this.scheme.zeroColor = value
					}),
			)

		new Setting(contentEl)
			.setName('Max color')
			.setDesc('Color for maximum values (hex format, e.g. #39d353)')
			.addText((text) =>
				text
					.setPlaceholder('#39d353')
					.setValue(this.scheme.maxColor)
					.onChange((value) => {
						this.scheme.maxColor = value
					}),
			)

		// Error message area
		this.errorEl = contentEl.createDiv('heatmap-modal-error')

		// Buttons
		new Setting(contentEl)
			.addButton((button) =>
				button
					.setButtonText('Save')
					.setCta()
					.onClick(() => {
						this.save()
					}),
			)
			.addButton((button) =>
				button.setButtonText('Cancel').onClick(() => {
					this.close()
				}),
			)
	}

	private save(): void {
		// Validate
		if (!this.scheme.name.trim()) {
			this.showError('Name is required')
			return
		}

		if (!isValidHexColor(this.scheme.zeroColor)) {
			this.showError('Zero color must be a valid hex color (e.g. #ebedf0)')
			return
		}

		if (!isValidHexColor(this.scheme.maxColor)) {
			this.showError('Max color must be a valid hex color (e.g. #39d353)')
			return
		}

		// Normalize colors
		if (!this.scheme.zeroColor.startsWith('#')) {
			this.scheme.zeroColor = '#' + this.scheme.zeroColor
		}

		if (!this.scheme.maxColor.startsWith('#')) {
			this.scheme.maxColor = '#' + this.scheme.maxColor
		}

		// Generate id from name if new
		if (this.isNew) {
			this.scheme.id = this.scheme.name
				.toLowerCase()
				.replace(/[^a-z0-9]+/gu, '-')
				.replace(/^-|-$/gu, '')
			if (!this.scheme.id) {
				this.scheme.id = 'scheme'
			}
		}

		this.onSave(this.scheme)
		this.close()
	}

	private showError(message: string): void {
		if (this.errorEl) {
			this.errorEl.textContent = message
		}
	}

	override onClose() {
		this.contentEl.empty()
	}
}
