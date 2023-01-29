module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 50],
    'body-max-line-length': [2, 'always', 72],
    'header-full-stop': [2, 'never', '.'],
    'body-leading-blank': [2, 'always'],
    'references-empty': [2, 'never'],
  },
};
