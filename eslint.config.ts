import { eslintConfig } from '@kitschpatrol/eslint-config'

export default eslintConfig(
	{
		ignores: ['examples/Heatmap Demo Vault/**', '**/changelog.md'],
		ts: {
			overrides: {
				'jsdoc/require-jsdoc': 'off',
				'no-new': 'off',
				// Date loops advance mutable Date objects rather than reassigning them.
				'no-unmodified-loop-condition': 'off',
				'perfectionist/sort-classes': 'off',
				// The inherited data model uses null and truthy defaults throughout.
				'ts/no-restricted-types': 'off',
				'ts/strict-boolean-expressions': 'off',
				// Keep color conversion helpers beside their formulas.
				'unicorn/consistent-function-scoping': 'off',
				// Preserve ES2018 behavior and decimal parsing in this layout migration.
				'unicorn/no-array-sort': 'off',
				'unicorn/no-null': 'off',
				'unicorn/prefer-at': 'off',
				'unicorn/prefer-number-coercion': 'off',
				'unicorn/prefer-string-replace-all': 'off',
			},
		},
	},
	{
		files: ['README.md'],
		rules: { 'unicorn/filename-case': 'off' },
	},
	{
		files: ['src/**/*.ts', 'test/**/*.ts', 'scripts/**/*.ts'],
		rules: {
			'e18e/prefer-static-regex': 'off',
			// The plugin's target predates the RegExp v flag. Keep local regexes readable.
			'require-unicode-regexp': ['error', { requireFlag: 'u' }],
		},
	},
	{
		files: ['**/*.test.ts', 'test/mocks/**/*.ts'],
		rules: {
			'ts/consistent-type-assertions': 'off',
			'ts/naming-convention': 'off',
			// Test doubles implement only the parts of Obsidian used by each test.
			'ts/no-explicit-any': 'off',
			'ts/no-unsafe-argument': 'off',
			'ts/no-unsafe-assignment': 'off',
			'ts/no-unsafe-member-access': 'off',
			'unicorn/consistent-function-scoping': 'off',
		},
	},
	{
		files: ['src/main.ts', 'src/heatmap-view.ts'],
		rules: {
			// BasesView requires an own readonly type field.
			'ts/class-literal-property-style': ['error', 'fields'],
			// Saved settings and Bases data may be absent despite the API typings.
			'ts/no-unnecessary-condition': 'off',
		},
	},
	{
		files: ['src/color-utils.ts'],
		rules: {
			// Preserve the conventional Oklab formula symbols and existing helper names.
			'ts/naming-convention': 'off',
			'unicorn/name-replacements': 'off',
		},
	},
)
