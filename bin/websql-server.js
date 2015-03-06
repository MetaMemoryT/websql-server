#!/usr/bin/env node --harmony

var Primus = require('primus');
var program = require('commander');
var websqlServerLib = require('../src/sqlite-adapter.js');

program
  .version('0.0.2')
  .option('-p, --port <port>', 'Specify the port <8082>', 8082)
  .option('--force-memory', 'force all the databases to be in :memory:')
  .parse(process.argv);

console.log('server starting...');

var primus = Primus.createServer({
  port: program.port,
  transformer: 'websockets',
  iknowhttpsisbetter: true
});

var options = {
  forceMemory: program.forceMemory
};

primus.on('connection', websqlServerLib.onConnection(options));

// catch the uncaught errors that weren't wrapped in a domain or try catch
// statement do not use this in modules, but only in applications
// as otherwise we could have multiple of these bound
process.on('uncaughtException', function(err) {
  // handle the error safely
  console.log('ERROR: ', err);
});

// http://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
process.stdin.resume(); //so the program will not close instantly

function exitHandler(options, err) {
  if (options.cleanup) console.log('exiting');
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, {
  cleanup: true
}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {
  exit: true
}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {
  exit: true
}));