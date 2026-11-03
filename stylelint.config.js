import { stylelintConfig } from '@kitschpatrol/stylelint-config'

export default stylelintConfig({
	rules: {
		'defensive-css/no-accidental-hover': null,
		'defensive-css/require-flex-wrap': null,
		'defensive-css/require-focus-visible': null,
		'defensive-css/require-prefers-reduced-motion': null,
		// Preserve the existing calendar layout, focus, and hover behavior.
		'no-descending-specificity': null,
	},
})
