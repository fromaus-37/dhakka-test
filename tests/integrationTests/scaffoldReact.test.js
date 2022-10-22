const scaffolder = require('../../scaffold.js');
const fs = require('fs');
const path = require('path');
const tempfolder = require('../utils/tempfolder');

describe('scaffoldReact', () => {
  const getNewAppPath = tempfolder.initializeTempFolder('reactUnitTests');

  expect.extend({
    toBeFileWithContent: (receivedFilePath, minFileSize = 1) => {
      const fileStats = fs.statSync(receivedFilePath, {
        throwIfNoEntry: false,
      });
      if (!fileStats) {
        return {
          pass: false,
          message: () => `File ${receivedFilePath} does not exist`,
        };
      } else {
        if (fileStats.size < minFileSize) {
          return {
            pass: false,
            message: () =>
              `File ${receivedFilePath} does not have content. Expected length ${minFileSize}. Actual length ${fileStats.size}`,
          };
        }
      }

      return {
        pass: true,
        message: () =>
          `Expected ${receivedFilePath} to to be of size ${fileStats.size}`,
      };
    },
  });

  const testGeneratesAReactApp = 'generates a React app';

  it(`${testGeneratesAReactApp}`, (done) => {
    const appPath = getNewAppPath();
    console.log(
      `test '${testGeneratesAReactApp}' is scaffolding to ${appPath}`
    );
    scaffolder.scaffold(appPath, scaffolder.scaffoldReactCommand, (err) => {
      try {
        console.log(err);
        expect(fs.existsSync(appPath)).toBe(true);
        expect(path.join(appPath, 'package.json')).toBeFileWithContent();
        //TODO: Check package.json for installed packages

        //TODO: test that gitignore file contains `.vscode
        // (and only once, in case it was already part of what
        // gitignore created from GitHub copy).

        expect(path.join(appPath, '.gitignore')).toBeFileWithContent();
        expect(path.join(appPath, '.eslintrc.js')).toBeFileWithContent();
        expect(path.join(appPath, '.prettierrc.json')).toBeFileWithContent();
        expect(path.join(appPath, '.prettierignore')).toBeFileWithContent();
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
