const fs = require('fs');
const path = require('path');
const tempfolder = require('../utils/tempfolder');
const { exec } = require('child_process');
const { initializeNycFolderForFixture } = require('../utils/nycOutputFolder');

const fixtureName = 'scaffold';
describe(`${fixtureName}`, () => {
  const getNewAppPath = tempfolder.initializeTempFolder('scaffoldUnitTests');

  //TODO: DELETE and recreate .nyc_output folder for the fixture here so that
  //output from all coverage files in it can be merged later
  const nycFolder = initializeNycFolderForFixture('./.nyc_output', fixtureName);

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
    toHaveLines: (receivedFilePath, linesToMatch) => {
      const fileText = fs.readFileSync(receivedFilePath) + '';
      const numLinesToMatch = linesToMatch.length;
      let numLinesMatched = 0;

      const linesInFile = fileText.split('\n');

      for (const line of linesInFile) {
        if (numLinesMatched === numLinesToMatch) break;
        const trimmedLine = line.trim();
        if (linesToMatch.find((lineToMatch) => trimmedLine === lineToMatch))
          numLinesMatched++;
      }

      return {
        pass: numLinesMatched === numLinesToMatch,
        message: () =>
          `Expected to match ${numLinesToMatch} lines in file ${receivedFilePath} but only matched ${numLinesMatched}`,
      };
    },
  });

  const testGeneratesANodeApp = 'generatesANodeApp';

  it(`${testGeneratesANodeApp}`, (done) => {
    const appPathInfo = getNewAppPath();
    const appPath = appPathInfo.path;
    console.log(`test '${testGeneratesANodeApp}' is scaffolding to ${appPath}`);
    //specifying --temp-dir as a UUID within the default ./.nyc_output
    //(same folder name as the folderName into which the app would
    //be scaffolded although that would be in a different base folder whereas
    //this one is located in ./.nyc_output) because there was some kind
    //of contention on this folder when running tests and Jest watcher
    //would keep crashing
    exec(
      `npx nyc --reporter=lcov --report-dir ./cli-coverage --temp-dir ${nycFolder.createSubFolderForTest(
        testGeneratesANodeApp
      )} dhakka -n ${appPath}`,
      (err /*, stdout, stderr*/) => {
        try {
          if (err) {
            console.log(err);
            done(err);
            return;
          }

          expect(fs.existsSync(appPath)).toBe(true);

          const packageJsonPath = path.join(appPath, 'package.json');
          expect(packageJsonPath).toBeFileWithContent();

          const packageObject = require(packageJsonPath);
          expect(packageObject.scripts.test).toBe('jest');
          expect(packageObject.scripts.format).toContain('prettier');
          expect(packageObject.scripts.lint).toContain('eslint .');
          expect(packageObject.scripts['lint:js']).toBe('eslint .');

          expect(path.join(appPath, '.gitignore')).toHaveLines(['.vscode']);

          expect(path.join(appPath, '.eslintrc.js')).toBeFileWithContent();
          expect(path.join(appPath, '.prettierrc.json')).toBeFileWithContent();
          expect(path.join(appPath, '.prettierignore')).toBeFileWithContent();

          //expect Jest correctly installed and configured
          expect(packageObject.devDependencies).toHaveProperty('jest');
          expect(packageObject.devDependencies).toHaveProperty(
            'eslint-plugin-jest'
          );
          expect(
            path.join(appPath, 'tests/.eslintrc.js')
          ).toBeFileWithContent();
          expect(packageObject.scripts['test']).toBe('jest');
          expect(path.join(appPath, 'jest.config.js')).toBeFileWithContent();
          expect(
            path.join(appPath, 'tests/integrationTests/jestSetup.js')
          ).toBeFileWithContent();
          expect(
            path.join(appPath, 'tests/unitTests/jestSetup.js')
          ).toBeFileWithContent();
          expect(packageObject.devDependencies).toHaveProperty(
            'debugger-is-attached'
          );

          //expect husky correctly installed
          expect(packageObject.devDependencies).toHaveProperty('husky');
          expect(packageObject.scripts.prepare).toBe('husky install');
          expect(path.join(appPath, '.husky/pre-commit')).toHaveLines([
            'npm run format',
            'npm run lint:js',
          ]);

          done();
        } catch (error) {
          done(error);
        }
      }
    );
  });
});
