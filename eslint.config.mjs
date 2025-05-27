import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsPlugin from "@typescript-eslint/eslint-plugin"; // Импортируем плагин

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.ts", "**/*.tsx"], // Применяем этот блок только к TypeScript файлам
    plugins: {
      "@typescript-eslint": tsPlugin, // Регистрируем плагин для этого блока конфигурации
    },
    // languageOptions: { // parser и parserOptions обычно настраиваются через next/core-web-vitals
    //   parser: tsParser, // Если next/core-web-vitals не настроил парсер для этого блока
    //   parserOptions: {
    //     project: "./tsconfig.json",
    //   },
    // },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Здесь можно добавить другие пользовательские правила для TypeScript
    },
  },
];

export default eslintConfig;
