const fs = require('fs');
const path = require('path');

const initializeNycFolderForFixture = (nycOutputFolder, fixtureName) => {

    const nycFolderForFixture = path.join(nycOutputFolder, fixtureName);
    if (fs.existsSync(nycFolderForFixture)) {
        fs.rmdirSync(nycFolderForFixture, {recursive: true, force: true});
    }

    fs.mkdirSync(nycFolderForFixture, {recursive: true});
    return {
        nycFolderForFixture,
        createSubFolderForTest: (testName) => {
            const testFolder = path.join(nycFolderForFixture, testName);
            fs.mkdirSync(testFolder);
            return testFolder;
        },
    };
}

module.exports = {
    initializeNycFolderForFixture: initializeNycFolderForFixture,
};