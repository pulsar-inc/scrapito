module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  overrides: [
    {
      // for files matching this pattern
      files: ['**/*.vue', '**/*.js'],
      parserOptions: {
        parser: 'babel-eslint',
      },
      extends: ['@nuxtjs', 'prettier', 'plugin:prettier/recommended', 'plugin:nuxt/recommended'],
      plugins: ['prettier'],
      // add your custom rules here
      rules: {},
    },
    {
      // for files matching this pattern
      files: ['**/*.ts'],
      // following config will override "normal" config
      parserOptions: {
        parser: '@typescript-eslint/parser',
        project: ['./tsconfig.json', './packages/*/tsconfig.json'],
      },
      plugins: ['@typescript-eslint', 'prettier'],
      extends: [
        'eslint:recommended',
        'prettier',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
    },
  ],
};
