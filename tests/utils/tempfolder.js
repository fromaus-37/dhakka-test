const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const os = require('os');

const initializeTempFolder = (tempFolderName) => {
  const tempFolderPath = path.join(os.tmpdir(), tempFolderName);

  console.log(`SCAFFOLDED FILES PATH: ${tempFolderPath}`);

  if (fs.existsSync(tempFolderPath)) {
    fs.rmdirSync(tempFolderPath, { recursive: true });
  }

  const getNewAppPath = () => {
    return path.join(tempFolderPath, `F${uuid.v1()}`);
  };

  return getNewAppPath;
};

module.exports = {
  initializeTempFolder,
};
