import type { Plugin } from 'esbuild'
import chokidar from 'chokidar'
import esbuild from 'esbuild'
import fs from 'node:fs/promises'
import { builtinModules } from 'node:module'
import process from 'node:process'
import { generateManifest } from './generate-manifest'

const production = process.argv.includes('production')
const demoPluginPath = './examples/Heatmap Demo Vault/.obsidian/plugins/heatmap-bases-view'

const assetsPlugin: Plugin = {
	name: 'plugin-assets',
	setup(build) {
		build.onEnd(async (result) => {
			if (result.errors.length > 0) {
				return
			}

			await generateManifest()
			await fs.copyFile('./src/styles.css', './dist/styles.css')

			if (production) {
				return
			}

			await fs.mkdir(demoPluginPath, { recursive: true })
			for (const file of ['main.js', 'manifest.json', 'styles.css']) {
				await fs.copyFile(`./dist/${file}`, `${demoPluginPath}/${file}`)
			}

			await fs.writeFile(`${demoPluginPath}/.hotreload`, new Date().toISOString())
		})
	},
}

const context = await esbuild.context({
	banner: {
		js: `/*
This is a generated source file!
Source: https://github.com/kitschpatrol/obsidian-heatmap-bases-view
*/`,
	},
	bundle: true,
	entryPoints: ['./src/main.ts'],
	external: ['obsidian', 'electron', '@codemirror/*', '@lezer/*', 'node:*', ...builtinModules],
	format: 'cjs',
	logLevel: 'info',
	minify: production,
	outfile: './dist/main.js',
	platform: 'browser',
	plugins: [assetsPlugin],
	sourcemap: production ? false : 'inline',
	// Preserve compatibility with the plugin's existing Obsidian minimum.
	target: 'es2018',
	treeShaking: true,
})

if (production) {
	try {
		await context.rebuild()
	} finally {
		await context.dispose()
	}
} else {
	await context.rebuild()
	console.log('Watching source and package metadata for changes...')
	const watcher = chokidar.watch(['src', 'package.json'], { ignoreInitial: true })
	watcher.on('all', () => {
		void context.rebuild().catch((error: unknown) => {
			console.error('Rebuild failed:', error)
		})
	})

	const stop = async (): Promise<void> => {
		await watcher.close()
		await context.dispose()
	}

	process.once('SIGINT', () => {
		void stop()
	})
	process.once('SIGTERM', () => {
		void stop()
	})
}
