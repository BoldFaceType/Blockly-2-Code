import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // Global ignores
  { 
    ignores: ["dist/", "node_modules/", "public/"] 
  },

  // Base configuration for all files
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // ESLint recommended rules
  {
     rules: {
        "no-unused-vars": "warn",
        "no-undef": "warn"
     }
  },

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // React specific configuration
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      react: pluginReact,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed with modern React/Vite
      "react/prop-types": "off", // Handled by TypeScript
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // React Hooks rules
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: reactHooks.configs.recommended.rules,
  },
];
