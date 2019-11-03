module.exports = {
  root: true,
  extends: [
    "plugin:vue/essential",
    "plugin:prettier/recommended",
    "eslint:recommended"
  ],
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
