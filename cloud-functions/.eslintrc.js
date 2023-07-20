module.exports = {
	root: true,
	env: {
		es6: true,
		node: true
	},
	extends: [
		'eslint:recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
		'google',
		'plugin:@typescript-eslint/recommended'
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		tsconfigRootDir: __dirname,
		sourceType: 'module'
	},
	ignorePatterns: [
		'/lib/**/*' // Ignore built files.
	],
	plugins: ['@typescript-eslint', 'import'],
	rules: {
		'require-jsdoc': 'off',
		'linebreak-style': 0,
		camelcase: 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unused-vars': 'error',
		'arrow-spacing': ['warn', { before: true, after: true }],
		'comma-dangle': ['error', 'never'],
		indent: ['error', 'tab'],
		'max-len': 'off',
		'no-multiple-empty-lines': ['error', { max: 1 }],
		'no-tabs': ['error', { allowIndentationTabs: true }],
		'no-trailing-spaces': ['warn'],
		'no-unused-vars': 'off',
		'object-curly-spacing': ['error', 'always'],
		quotes: ['error', 'single', { avoidEscape: true }],
		semi: [2, 'always'],
		'switch-colon-spacing': ['error', { after: true, before: false }],
		'import/no-unresolved': [
			'error',
			{
				ignore: ['^firebase-functions/.+']
			}
		]
	}
};
