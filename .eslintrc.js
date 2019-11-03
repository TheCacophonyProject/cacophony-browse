module.exports = {
  plugins: ["@typescript-eslint"],
  root: true,
  extends: [
    "plugin:vue/essential",
    "plugin:prettier/recommended",
    "eslint:recommended"
  ],
  parserOptions: {
    parser: require.resolve("@typescript-eslint/parser")
  },
  rules: {
    "no-prototype-builtins": "off",
    "linebreak-style": ["warn", "unix"],
    quotes: "off",
    semi: ["warn", "always"],
    curly: ["warn", "all"],
    "no-console": ["warn"],
    "no-debugger": ["warn"],
    "no-undef": ["warn"],
    "no-unused-vars": ["warn"],
    "brace-style": ["warn"],
    "prefer-const": ["warn"]
  }
};
