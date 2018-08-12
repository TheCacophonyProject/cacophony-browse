module.exports = {
  "parser": "vue-eslint-parser",
  plugins: [
    "import"
  ],
  extends: [
    'eslint:recommended',
    "plugin:import/errors",
    'plugin:vue/recommended'
  ],
  "parserOptions": {
    "ecmaVersion": 8,
    "ecmaFeatures": {
      "globalReturn": true,
      "experimentalObjectRestSpread": true
    }
  },
  env: {
    jest: true
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': 'off',
    'semi': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-console': ['warn'],
    'no-undef': ['error'],
    'no-unused-vars': ['error'],
    'brace-style': ['error'],
    'prefer-const': ['error']
  }
};
