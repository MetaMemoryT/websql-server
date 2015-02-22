#!/usr/bin/env node

var Primus = require('primus');
var program = require('commander');
var websqlServerLib = require('../main.js');

program
  .version('0.0.2')
  .option('-p, --port <port>', 'Specify the port <8082>', 8082)
  .parse(process.argv);

console.log('server starting...');

var primus = Primus.createServer({
  port: program.port,
  transformer: 'websockets',
  iknowhttpsisbetter: true
});

primus.on('connection', websqlServerLib.onConnection);