import { knipConfig } from '@kitschpatrol/knip-config'

export default knipConfig({
	entry: ['src/main.ts', 'scripts/*.ts'],
	ignore: ['examples/**/*'],
})
