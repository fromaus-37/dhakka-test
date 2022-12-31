'use strict';

//const fs = require('fs');
const { program, Option } = require('commander');
const pkg = require('./package.json');
const { scaffold, scaffoldNodeCommand } = require('./scaffold.js');

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
      scaffold(path, scaffoldNodeCommand, (err) => {
        console.log('An error occured while generating the app:');
        console.log('');
        console.log('----' + err);
      });
    } else {
      //scaffoldReact(path);
      console.log('Option not supported at the moment.');
    }
  });

program.parse();
