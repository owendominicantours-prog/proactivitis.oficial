const { FlatCompat } = require("@eslint/eslintrc");

/** @type {import("eslint").FlatConfig[]} */
const config = [
  ...new FlatCompat({ baseDirectory: __dirname }).extends("next/core-web-vitals"),
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react-hooks/set-state-in-effect": "off"
    }
  }
];

module.exports = config;
