const scaffolder = require('../../scaffold.js');
const fs = require('fs');
const path = require('path');
const tempfolder = require('../utils/tempfolder');

describe('scaffold', () => {
  const getNewAppPath = tempfolder.initializeTempFolder('unitTests');

  const getScaffoldCommandStub = () =>
    jest.fn((appPath, callback) => {
      callback();
    });

  it('creates the path if not there and generates scaffold', (done) => {
    const pathToApp = getNewAppPath().path;
    const scaffoldCommand = getScaffoldCommandStub();

    scaffolder.scaffold(pathToApp, scaffoldCommand, () => {
      try {
        expect(fs.existsSync(pathToApp)).toBe(true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('does not scaffold in a non-empty directory', (done) => {
    const pathToApp = getNewAppPath().path;

    const scaffoldCommand = getScaffoldCommandStub();
    fs.mkdir(pathToApp, { recursive: true }, (err) => {
      if (err) done(err);

      try {
        const newFile = path.join(pathToApp, 'testFile.txt');
        fs.writeFile(newFile, 'test', (err) => {
          if (err) {
            done(err);
            return;
          }
          try {
            scaffolder.scaffold(pathToApp, scaffoldCommand, (err) => {
              try {
                expect(err).toBeTruthy();
                expect(err).toHaveProperty(
                  'errorMessage',
                  'Specified app folder not empty'
                );
                done();
              } catch (error) {
                done(error);
              }
            });
          } catch (error) {
            done(error);
          }
        });
      } catch (error) {
        done(error);
      }
    });
  });
});
