module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ["plugin:import/typescript"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    quotes: [1, "double"],
  },
};
