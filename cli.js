'use strict';

//const fs = require('fs');
const { program, Option } = require('commander');
const pkg = require('./package.json');
const { scaffoldNode, scaffoldReact } = require('./scaffold.js');

program.version(pkg.version).description(pkg.description);

program.addOption(
  new Option('-r, --react', 'scaffold a React app.', true).conflicts('node')
);

program.addOption(
  new Option('-n, --node', 'scaffold a Node app').conflicts('react')
);

program
  .argument(
    '[path]',
    'relative or absolute path of the folder in which new app will be created. Default is the current folder',
    '.'
  )
  .action((path, options /*, command*/) => {
    if (options.node) {
      scaffoldNode(path);
    } else {
      scaffoldReact(path);
    }
  });

program.parse();
