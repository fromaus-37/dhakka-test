class consts {
  static get nycOutputDir() {
    return './.nyc_output';
  }
  static get combinedCoverageReporters() {
    return '--reporter=lcov';
  }
}

module.exports = consts;
