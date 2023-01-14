const fs = require('fs');
const path = require('path');

const initializeCoverageFoldersForFixture = (nycOutputFolder, coverageOutputFolder, fixtureName) => {
  const nycFolderForFixture = path.join(nycOutputFolder, fixtureName);
  const coverageFolderForFixture = path.join(coverageOutputFolder, fixtureName);

  for(const folder of [nycFolderForFixture, coverageFolderForFixture])
  {
    if (fs.existsSync(folder)) {
      fs.rmdirSync(folder, { recursive: true, force: true });
    }

    fs.mkdirSync(folder, { recursive: true });
  }

  return {
    nycFolderForFixture,
    coverageFolderForFixture,
    createSubFoldersForTest: (testName) => {
      const result = {
        nycFolderforTest: path.join(nycFolderForFixture, testName),
        coverageFolderForTest: path.join(coverageFolderForFixture, testName),
      }

      Object.values(result).forEach(folder => fs.mkdirSync(folder));

      return result;
    },
  };
};

module.exports = {
  initializeCoverageFoldersForFixture
};
