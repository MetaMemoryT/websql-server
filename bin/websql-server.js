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