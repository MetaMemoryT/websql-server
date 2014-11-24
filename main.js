var Primus = require('primus');
var sqlite3 = require('sqlite3');

var primus = Primus.createServer({
  port: 8080,
  transformer: 'websockets',
  iknowhttpsisbetter: true
});

var databaseID = 0;
var databaseList = [];

primus.on('connection', function(spark) {

  console.log('connection occured');

  spark.on('data', function(data) {
    switch (data.command) {
      case 'open':
        console.log('data.filename: ', data.filename);
        var db = new sqlite3.Database(data.filename, data.mode, function(err) {
          // TODO why is this not printing??
          console.log('openComplete: err: ', err);
        });
        db.on('open', function(err) {
          spark.write({
            command: 'openComplete',
            err: err,
            id: data.id,
            databaseID: databaseID++
          });
        });
        databaseList[databaseID++] = db;
        break;
    }
  });
});

console.log('server starting...');