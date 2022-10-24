module.exports = {
  plugins: ['jest'],
  extends: ['plugin:jest/recommended'],

  rules: {
    //if I don't have the following, I keep getting errors
    //about done() not being called when I am calling
    //it, in both the normal case and in case of error,
    // from inside a  callback passed to a funcion called
    //inside the test, but not directly in tests code.
    'jest/no-done-callback': 'off',
  },
};
