module.exports = {
	extends: [
		// add more generic rulesets here, such as:
		'eslint:recommended',
		'plugin:vue/recommended'
	],
	rules: {
		'indent': ['error', 2],
		'linebreak-style': ['error', 'unix'],
		'quotes': 'off',
		'semi': ['error', 'always'],
		'curly': ['error', 'all'],
		'no-console': ['warn'],
		'no-undef': ['error'],
		'no-unused-vars': ['error'],
		'brace-style': ['error']
	}
}
