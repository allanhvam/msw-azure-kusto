import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/semi": ["error", "always"],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@stylistic/curly-newline": ["error", "always"],
      "curly": "error",
      "@stylistic/quote-props": ["error", "consistent-as-needed"],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "src/grammar/generated/**", "src/parser/**"],
  },
];
