const fs = require('fs');
const path = require('path');
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
a Promise-based pattern here that I can reasonably suppose would be
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

function getMerge(continuation, mergeCount) {
  let count = 0;

  return (err) => {
    if (err) {
      continuation(err);
    } else {
      count++;
      if (count === mergeCount) {
        continuation();
      }
    }
  };
}

function scaffoldNodeCommand(appPath, callback) {
  const scaffoldCommands = [
    `cd ${appPath}`,
    `npm init -y`,
    `npm install --save-dev --save-exact eslint eslint-config-prettier prettier jest eslint-plugin-jest debugger-is-attached husky`,
    `npx gitignore Node`,
  ];

  const concatCommandsIntoScript = (commands) =>
    commands.reduce((previous, current) => `${previous} && ${current}`);

  const installHuskyCommands = [
    `cd ${appPath}`,
    `git init`,
    `npm run prepare`,
    `npx husky add .husky/pre-commit "npm run format"`,
    `npx husky add .husky/pre-commit "npm run lint:js"`,
  ];

  const merge_initnpm_copyfiles_modgitignore = getMerge(callback, 3);

  const completeNPMPackageInstall = () => {
    try {
      const packageJsonPath = path.join(appPath, 'package.json');
      fs.readFile(packageJsonPath, (err, data) => {
        if (err) {
          merge_initnpm_copyfiles_modgitignore(err);
        } else {
          try {
            const packageObject = JSON.parse(data);
            packageObject.scripts = {
              test: 'jest',
              'lint:js': 'eslint .',
              lint: 'eslint . && prettier --check .',
              format: 'prettier --write .',
              prepare: 'husky install',
            };
            fs.writeFile(
              packageJsonPath,
              JSON.stringify(packageObject, null, 2),
              (err) => {
                if (err) {
                  merge_initnpm_copyfiles_modgitignore(err);
                } else {
                  exec(
                    concatCommandsIntoScript(installHuskyCommands),
                    merge_initnpm_copyfiles_modgitignore
                  );
                }
              }
            );
          } catch (err) {
            merge_initnpm_copyfiles_modgitignore(err);
          }
        }
      });
    } catch (err) {
      merge_initnpm_copyfiles_modgitignore(err);
    }
  };

  const addVscodeToGitignore = () => {
    fs.appendFile(
      path.join(appPath, '.gitignore'),
      `.vscode`,
      merge_initnpm_copyfiles_modgitignore
    );
  };

  exec(concatCommandsIntoScript(scaffoldCommands), (err) => {
    if (err) {
      merge_initnpm_copyfiles_modgitignore(err);
    } else {
      completeNPMPackageInstall();
      addVscodeToGitignore();
    }
  }).stdout.pipe(process.stdout);

  const directoriesToCreate = [
    path.join(appPath, 'tests/integrationTests'),
    path.join(appPath, 'tests/unitTests'),
  ];

  const filesToCopy = [
    {
      source: '/scaffoldFiles/node/.eslintrc.js',
      dest: path.join(appPath, '.eslintrc.js'),
    },
    {
      source: '/scaffoldFiles/node/.prettierrc.json',
      dest: path.join(appPath, '.prettierrc.json'),
    },
    {
      source: '/scaffoldFiles/node/.prettierignore',
      dest: path.join(appPath, '.prettierignore'),
    },
    {
      source: '/scaffoldFiles/node/jest.config.js',
      dest: path.join(appPath, 'jest.config.js'),
    },
    {
      source: '/scaffoldFiles/node/tests/.eslintrc.js',
      dest: path.join(appPath, 'tests/.eslintrc.js'),
    },
    {
      source: '/scaffoldFiles/node/tests/unitTests/jestSetup.js',
      dest: path.join(appPath, 'tests/unitTests/jestSetup.js'),
    },
    {
      source: '/scaffoldFiles/node/tests/integrationTests/jestSetup.js',
      dest: path.join(appPath, 'tests/integrationTests/jestSetup.js'),
    },
  ].map((obj) => ({
    source: __dirname + obj.source,
    dest: obj.dest,
  }));

  const merge_copyfiles = getMerge(
    merge_initnpm_copyfiles_modgitignore,
    filesToCopy.length
  );

  const copyFiles = (err) => {
    if (err) {
      merge_copyfiles(err);
    } else {
      filesToCopy.forEach((copySpec) => {
        fs.copyFile(copySpec.source, copySpec.dest, (err) => {
          if (err) {
            merge_copyfiles(err);
          } else {
            merge_copyfiles();
          }
        });
      });
    }
  };

  const merge_directoriesToCreate = getMerge(
    copyFiles,
    directoriesToCreate.length
  );

  directoriesToCreate.forEach((dirPath) => {
    fs.mkdir(dirPath, { recursive: true }, merge_directoriesToCreate);
  });
}

module.exports = {
  scaffold,
  scaffoldNodeCommand,
};
