module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    // this is necessary because
    // defult is ES5 which throws
    //errors on things like arrow functions
    ecmaVersion: 6,
  },
  //following block is necessary because otherwise
  //ESLInt throws error on `require` and `module` keyword
  //which are of course available in node (because of node's
  //CommonJS module system) but are not a feature of ES5 or ES6
  env: {
    node: true,
  },
  rules: {
    'no-unused-vars': ['error', { varsIgnorePattern: '^_' }],
  },
};
