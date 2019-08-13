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
  rules: {
    'indent': ['warn', 2],
    'linebreak-style': ['warn', 'unix'],
    'quotes': 'off',
    'semi': ['warn', 'always'],
    'curly': ['warn', 'all'],
    'no-console': ['warn'],
    'no-debugger': ['warn'],
    'no-undef': ['warn'],
    'no-unused-vars': ['warn'],
    'brace-style': ['warn'],
    'prefer-const': ['warn']
  },
};
