import { FlatCompat } from '@eslint/eslintrc';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  // 🧩 Extensiones oficiales de Next.js
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // 🪄 Orden de imports como advertencia
  {
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    rules: {
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            ['^react', '^@?\\w'], // 🔹 Librerías externas
            ['^@components', '^@shared'], // 🔸 Alias internos
            ['^\\.\\.(/|$)', '^\\./'], // 📁 Relativos locales
            ['^.+\\.s?css$'] // 🎨 Estilos
          ]
        }
      ],
      'simple-import-sort/exports': 'warn'
    }
  }
];

export default eslintConfig;
