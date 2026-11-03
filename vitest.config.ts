import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: {
		alias: {
			obsidian: fileURLToPath(new URL('test/mocks/obsidian.ts', import.meta.url)),
		},
	},
	test: {
		coverage: {
			exclude: ['src/**/*.test.ts', 'src/main.ts'],
			include: ['src/**/*.ts'],
			provider: 'v8',
			reporter: ['text', 'html'],
		},
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.test.ts'],
	},
})
