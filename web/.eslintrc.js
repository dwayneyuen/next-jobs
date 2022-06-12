module.exports = {
  ignorePatterns: [".eslintrc.js", "next.config.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  extends: ["next/core-web-vitals"],
  plugins: ["@typescript-eslint/eslint-plugin"],
  rules: {
    "@next/next/no-html-link-for-pages": ["error", "web/pages/"],
    "@next/next/no-img-element": 0,
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
  },
};
