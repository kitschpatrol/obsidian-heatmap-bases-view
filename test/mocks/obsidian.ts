// Mock for the obsidian module - used in tests

export class NumberValue {
	constructor(private readonly value: number) {}
	toString() {
		return String(this.value)
	}
	isTruthy() {
		return this.value !== 0
	}
}

export class BooleanValue {
	constructor(private readonly value: boolean) {}
	toString() {
		return String(this.value)
	}
	isTruthy() {
		return this.value
	}
}

export class StringValue {
	constructor(private readonly value: string) {}
	toString() {
		return this.value
	}
	isTruthy() {
		return this.value.length > 0
	}
}

export class DateValue {
	constructor(private readonly value: string) {}
	toString() {
		return this.value
	}
	isTruthy() {
		return true
	}
}

export class NullValue {
	toString() {
		return 'null'
	}
	isTruthy() {
		return false
	}
}

export class PluginSettingTab {
	constructor(
		readonly app: unknown,
		readonly plugin: unknown,
	) {}
	update(): void {
		// Tests spy on this. There is no rendered tab to rebuild.
	}
}
