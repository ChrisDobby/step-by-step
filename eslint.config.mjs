import prettier from 'eslint-plugin-prettier'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.ts'],
    plugins: { prettier, ts },
    rules: {
      'prettier/prettier': ['error'],
    },
    languageOptions: {
      parser: tsParser,
    },
  },
]
