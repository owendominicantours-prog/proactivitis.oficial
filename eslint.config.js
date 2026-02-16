const { FlatCompat } = require("@eslint/eslintrc");

/** @type {import("eslint").FlatConfig[]} */
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "dist/**",
      "out/**",
      "playwright-report/**",
      "test-results/**"
    ]
  },
  ...new FlatCompat({ baseDirectory: __dirname }).extends("next/core-web-vitals"),
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/purity": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react/no-unescaped-entities": "off"
    }
  }
];

module.exports = config;
