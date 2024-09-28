import prettier from 'eslint-plugin-prettier'
import ts from '@typescript-eslint/eslint-plugin'

export default [
  {
    files: ['**/*.ts'],
    plugins: { prettier, ts },
    rules: {
      'prettier/prettier': ['error'],
    },
  },
]
