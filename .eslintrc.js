module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    // this is necessary because
    // defult is ES5 which throws
    //errors on things like async and arrow functions
    ecmaVersion: 2020,
  },
  //following block is necessary because otherwise
  //ESLInt throws error on `require` and `module` keyword
  //which are of course available in node (because of node's
  //CommonJS module system) but are not a feature of ES5 or ES6
  env: {
    node: true,
  },
  rules: {
    //following allows us to destructure remaining properties
    //of a destructured objects in a variable named _.
    //as in ..._
    //If we need to use those remaining destrcutured
    //properties then we would instead catach them in a names
    //var like ...props. In that case we would use props
    //also otherwise eslint would throw an error.
    //but if we don't intend to use them at all
    //and ..._ is just there so we could sift through
    //some named properties before (as in {a, b,, _...} = obj
    //then we don't want edlint to throw error that _
    //has not been used.
    'no-unused-vars': ['error', { varsIgnorePattern: '^_' }],
  },
};
