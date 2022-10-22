const fs = require('fs');
const { exec } = require('node:child_process');

/*
Adopting a callback-based implementation here because
even as of now (09-Oct-2022) node v18 documentation says
fs callback-based API is more performant than Promise-based one.

[This discussion](https://github.com/nodejs/node/issues/37583) from
March 2021 showed that fs.promises.readFile was 35% slower in their test
whereas promisify(fs.readFile) was 20% or so slower.

Since the reason why I switched to Vite was because Create-React-App
was excruciatingly slow, and since scaffolding an app means
lots of reading and writing of files, I don't want to build in
a Promise-based pattern here that I can reasonably suppose could be
a lot slower.
*/

/**
 * @callback scaffoldCallback
 * @param {Object} err - If an error occurred in the scaffolding process, this would be the error object. If null, then the process completed successfully.
 */

/**
 *
 * @param {string} path - Absolute of relative path of the folder in which new app will be scaffolded
 * @param {scaffoldCallback} callback - This function would be called when the
 * scaffolding process has completed or terminated due to an error
 */
function scaffold(appPath, scaffoldCommand, callback) {
  const ensureDirectoryEmptyAndGenerateApp = () => {
    fs.readdir(appPath, (err, data) => {
      if (data.length > 0) {
        callback({ errorMessage: 'Specified app folder not empty' });
      } else {
        scaffoldCommand(appPath, callback);
      }
    });
  };

  if (!fs.existsSync(appPath)) {
    fs.mkdir(appPath, { recursive: true }, (err) => {
      if (err) {
        callback(err);
        return;
      }
      ensureDirectoryEmptyAndGenerateApp();
    });
  } else {
    ensureDirectoryEmptyAndGenerateApp();
  }
}

function scaffoldReactCommand(appPath, callback) {
  const scaffoldCommands = [
    `cd ${appPath}`,
    `npm init -y`,
    `npm install --save-dev --save-exact eslint eslint-config-prettier prettier`,
    `npx gitignore VisualStudio`,
  ];

  const scaffoldScript = scaffoldCommands.reduce(
    (previous, current) => `${previous} && ${current}`
  );

  /*
  const filesToCopy = [
    {
      source: './scaffoldFiles/node/.eslintrc.js',
      dest: path.join(appPath, '.eslintrc.js'),
    },
  ];
  */

  exec(scaffoldScript, (err) => {
    if (err) {
      callback(err);
    } else {
      // fs.copyFile(
      //   ,
      //   ,
      //   callback
      // );
      callback();
    }
  }).stdout.pipe(process.stdout);
}

module.exports = {
  scaffold,
  scaffoldReactCommand,
};
