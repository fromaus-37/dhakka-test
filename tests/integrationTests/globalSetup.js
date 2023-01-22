const fs = require('fs');
const path = require('path');
const process = require('process');
const testConsts = require('../testConsts');

async function deleteCoverageDirs(globalConfig /*, projectConfig*/) {
  if (!globalConfig.collectCoverage) return Promise.resolve();

  const coverageDirs = [testConsts.nycOutputDir].map((folder) =>
    path.join(process.cwd(), folder)
  );

  //TODO: OTHER VARIATIONS I WANT TO TRY:
  //based on this article: https://blog.logrocket.com/guide-promises-node-js/#:~:text=Promises%20are%20generally%20created%20by,after%20a%20promise%20is%20created.
  //1. linearise the nesting by using multiple chained Promises
  //2. Use promisify
  //3. use async fs module built into Node
  const promisesOfDirDeletion = coverageDirs.map(
    (dir) =>
      new Promise((resolve, reject) => {
        fs.access(dir, fs.constants.F_OK, (err) => {
          if (err) {
            //dir not found, we're done
            resolve();
          } else {
            fs.rmdir(dir, { recursive: true, force: true }, (err) => {
              if (err) reject();
              else resolve();
            });
          }
        });
      })
  );

  return Promise.all(promisesOfDirDeletion);
}

module.exports = deleteCoverageDirs;
