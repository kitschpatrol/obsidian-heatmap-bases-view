import type { PluginManifest } from 'obsidian'
import fs from 'node:fs/promises'
import process from 'node:process'
import type packageMetadata from '../package.json'

/** Generate the plugin manifest from the package metadata. */
export async function generateManifest(): Promise<void> {
	const packageJson = JSON.parse(
		await fs.readFile('./package.json', 'utf8'),
	) as typeof packageMetadata
	const inferredManifest = {
		author: packageJson.author.name,
		authorUrl: packageJson.author.url,
		description: packageJson.description,
		id: packageJson.name,
		version: packageJson.version,
	}
	const manifest: PluginManifest = { ...inferredManifest, ...packageJson.obsidian }

	const contents = `${JSON.stringify(manifest, undefined, 2)}\n`
	await fs.mkdir('./dist', { recursive: true })
	await fs.writeFile('./dist/manifest.json', contents)
	// Keep the root manifest available to installers such as BRAT.
	await fs.writeFile('./manifest.json', contents)
}

if (process.argv[1]?.endsWith('generate-manifest.ts')) {
	await generateManifest()
}
