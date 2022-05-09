const Severity = {
  Off: 0,
  Warning: 1,
  Error: 2,
};

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'boundaries', 'security'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/interface-name-prefix': Severity.Off,
    '@typescript-eslint/explicit-function-return-type': Severity.Error,
    '@typescript-eslint/explicit-module-boundary-types': Severity.Off,
    '@typescript-eslint/no-explicit-any': Severity.Off,
    '@typescript-eslint/no-inferrable-types': Severity.Off,
    'no-console': Severity.Error,
  },
  env: {
    jest: true,
    node: true,
  },
};
