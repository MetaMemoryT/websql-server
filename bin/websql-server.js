#!/usr/bin/env node

var Primus = require('primus');
var program = require('commander');
var websqlServerLib = require('../main.js');

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