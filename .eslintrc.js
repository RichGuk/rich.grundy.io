module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 12,
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  rules: {
    semi: ["error", "never"],
  },
};
