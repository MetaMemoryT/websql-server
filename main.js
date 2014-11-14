var Primus = require('primus');

var primus = Primus.createServer({ port: 8080, transformer: 'websockets' });

primus.on('connection', function(spark) {
  spark.write('hello world2');
});
