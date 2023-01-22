const { exec } = require('child_process');
const testConsts = require('./testConsts');

module.exports = async function (globalConfig /*, projectConfig*/) {
  if (!globalConfig.collectCoverage || globalConfig.ci)
    return Promise.resolve();

  return new Promise((resolve, reject) => {
    exec(
      `nyc report -t ${globalConfig.coverageDirectory} --report-dir ${globalConfig.coverageDirectory} ${testConsts.combinedCoverageReporters}`,
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
