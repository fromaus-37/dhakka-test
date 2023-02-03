const { exec } = require('child_process');
const path = require('path');
const testConsts = require('../testConsts');

module.exports = async function (globalConfig /*, projectConfig*/) {
  if (!globalConfig.collectCoverage) return Promise.resolve();

  return new Promise((resolve, reject) => {
    //1. using nyc merge command like cp command, except only a
    //merged file get copied instead of all of them
    //2.Have verified manually that any existing coverage `.json`
    //file in the --temp-dir folder (./.nyc_output by default)
    //will get overritten by the nyc command
    exec(
      `nyc merge ${testConsts.nycOutputDir} ${path.join(
        globalConfig.coverageDirectory,
        'integration-coverage.json'
      )}`,
      (err /*, stdout, stderr*/) => {
        if (err) {
          reject();
          return;
        }
        resolve();
      }
    );
  });
};
