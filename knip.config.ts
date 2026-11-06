import { knipConfig } from '@kitschpatrol/knip-config'

export default knipConfig({
	entry: ['src/main.ts', 'scripts/*.ts'],
	ignore: ['examples/**/*'],
	ignoreDependencies: [
		'@kitschpatrol/chagent', // Typically invoked through bumpp's --execute argument, which Knip doesn't parse
	],
})
