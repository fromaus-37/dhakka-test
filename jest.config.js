const { debuggerIsAttached } = require('debugger-is-attached');
const path = require('path');

module.exports = async () => {
  const isDebuggerAttached = await debuggerIsAttached();

  const testsFolder = '<rootDir>/tests';
  const unitTestFolder = testsFolder + '/unitTests';
  const integrationTestFolder = testsFolder + '/integrationTests';
  const getSetupFiles = (folder) =>
    isDebuggerAttached ? [] : [path.join(folder, 'jestSetup.js')];

  const baseProjectConfig = {
    //Here put any project properties (these would
    //be properties of ProjectConfig type in
    //Config.ts in Jest repo) that are the same for
    //all projects
  };

  let config = {
    collectCoverage: true,
    coverageReporters: ['json'],
    globalTeardown: path.join(testsFolder, 'globalTeardown.js'),
    projects: [
      {
        ...baseProjectConfig,
        displayName: 'UnitTests',
        testMatch: [path.join(unitTestFolder, '**/*.test.js')],
        slowTestThreshold: 1000, //1 second
        setupFilesAfterEnv: getSetupFiles(unitTestFolder),
      },
      {
        ...baseProjectConfig,
        displayName: 'IntegrationTests',
        testMatch: [path.join(integrationTestFolder, '**/*.test.js')],
        slowTestThreshold: 180000, //1 minute
        setupFilesAfterEnv: getSetupFiles(integrationTestFolder),
        globalSetup: path.join(integrationTestFolder, 'globalSetup.js'),
        globalTeardown: path.join(integrationTestFolder, 'globalTeardown.js'),
      },
    ],
    //any other Jest config (properties that are in type
    //InitialConfig but not in type ProjectConfig in Config.ts
    //in Jest repo) go here
  };

  if (isDebuggerAttached) config['testTimeout'] = 600000; //ten minutes

  return config;
};
