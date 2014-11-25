var Primus = require('primus');
var sqlite3 = require('sqlite3');

var primus = Primus.createServer({
  port: 8080,
  transformer: 'websockets',
  iknowhttpsisbetter: true
});

var databaseID = 0;
var databaseList = [];
var databasePathList = [];
var databaseDirectory = 'data/';

primus.on('connection', function(spark) {

  console.log('connection occured');

  spark.on('data', function(data) {
    console.log('data: ', data);
    switch (data.command) {
      case 'open':
        var db = new sqlite3.Database(
          databaseDirectory + data.args[0].name, null,
          function(err) {
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
        databasePathList[data.args.dbname] = db;
        break;
      case 'close':
        databasePathList[data.args.dbname].close(function(err) {
          spark.write({
            command: 'closeComplete',
            err: err,
            id: data.id
          });
        });
        break;
      case 'delete':
        databasePathList[data.args.dbname].close(function(err) {
          fs.unlinkSync(databaseDirectory + data.openargs.dbname);
          spark.write({
            command: 'deleteComplete',
            err: err,
            id: data.id
          });
        });
        break;
      case 'backgroundExecuteSqlBatch':
        throw new Error();
    }
  });
});

console.log('server starting...');