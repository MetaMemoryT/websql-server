/* globals process */
var sqlite3 = require('sqlite3');
var fs = require('fs');

var databaseID = 0;
var databaseList = [];
var databasePathList = [];
var databaseDirectory = 'data/';

module.exports.onConnection = function(spark) {

  console.log('connection occured');

  spark.on('data', function(data) {
    var db = null;
    switch (data.command) {
      case 'open':
        console.log('open: ', databaseDirectory + data.args[0].name);
        break;
      case 'close':
        console.log('open: ', databaseDirectory + data.args.dbname);
        break;
      case 'delete':
        console.log('delete: ', databaseDirectory + data.openargs.dbname);
        break;
      case 'backgroundExecuteSqlBatch':
        data.args[0].executes.forEach(function(a) {
          console.log('run: ', a.query);
        });
        break;
    }
    switch (data.command) {
      case 'open':
        db = new sqlite3.Database(
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
        databasePathList[data.args[0].name] = db;
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
        db = databasePathList[data.args[0].dbargs.dbname];
        if (!db) {
          console.log('runFailed: db not found');
          spark.write({
            command: 'backgroundExecuteSqlBatchFailed',
            err: 'runFailed: db not found',
            id: data.id
          });
          return;
        }
        var queryArray = data.args[0].executes;
        runQueries(data.id, spark, db, queryArray, []);
    }
  });
};

function runQueries(id, spark, db, queryArray, accumAnswer) {
  if (queryArray.length < 1) {
    spark.write({
      command: 'backgroundExecuteSqlBatchComplete',
      answer: accumAnswer,
      id: id
    });
    return;
  }
  var top = queryArray.shift();
  db.all(top.sql, top.params, function(err, rows) {
    var newAnswer = {};
    if (err) {
      newAnswer.type = 'error';
      newAnswer.qid = top.qid;
      accumAnswer.push(newAnswer);
      console.log('runFailed: ', err);
      spark.write({
        command: 'backgroundExecuteSqlBatchFailed',
        err: err,
        answer: accumAnswer,
        id: id
      });
      return;
    }
    newAnswer.type = 'success';
    newAnswer.qid = top.qid;
    var newResult = {};
    newResult.rows = rows;
    newAnswer.result = newResult;
    accumAnswer.push(newAnswer);
    runQueries(id, spark, db, queryArray, accumAnswer);
  });
}

// catch the uncaught errors that weren't wrapped in a domain or try catch statement
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function(err) {
  // handle the error safely
  console.log('ERROR: ', err);
});