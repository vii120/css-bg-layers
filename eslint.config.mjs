import antfu from '@antfu/eslint-config'

export default antfu(
  {
    nextjs: true,
  },
  {
    // Match the repo's Prettier-like style (single quotes, no semis) instead of antfu's defaults
    rules: {
      'style/arrow-parens': ['error', 'always'],
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'style/member-delimiter-style': ['error', {
        multiline: { delimiter: 'none' },
        singleline: { delimiter: 'semi', requireLast: false },
      }],
      'style/operator-linebreak': ['error', 'after', {
        overrides: { '?': 'before', ':': 'before', '|': 'before', '&': 'before' },
      }],
      'antfu/if-newline': 'off',
      'antfu/curly': 'off',
      'style/multiline-ternary': 'off',
      'style/indent-binary-ops': 'off',
      'style/jsx-one-expression-per-line': 'off',
      'style/jsx-curly-newline': 'off',
    },
  },
)
