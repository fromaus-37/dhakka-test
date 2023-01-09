const scaffolder = require('../../scaffold.js');
const fs = require('fs');
const path = require('path');
const tempfolder = require('../utils/tempfolder');

describe('scaffold', () => {
  const getNewAppPath = tempfolder.initializeTempFolder('scaffoldUnitTests');

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

  const testGeneratesANodeApp = 'generates a Node app';

  it(`${testGeneratesANodeApp}`, (done) => {
    const appPath = getNewAppPath();
    console.log(`test '${testGeneratesANodeApp}' is scaffolding to ${appPath}`);
    scaffolder.scaffold(appPath, scaffolder.scaffoldNodeCommand, (err) => {
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
        expect(packageObject.scripts.test).toBe('jest --coverage');
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
        expect(path.join(appPath, 'tests/.eslintrc.js')).toBeFileWithContent();
        expect(packageObject.scripts['test']).toBe('jest --coverage');
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
    });
  });
});
