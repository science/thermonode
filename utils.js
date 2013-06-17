var fs = require('fs');
var dbgmsg = require('util').debug;

// 0 = none, big number = output lots of stuff
var DEBUG_LEVEL = 10;

// from http://stackoverflow.com/questions/3885817/how-to-check-if-a-number-is-float-or-integer
var isInt = function (n) {
   return n===+n && n===(n|0);
}

//write debug messages to stderr using node debug log method
var debuggerMsg = function (debugMsg, level){
  if (isInt(level)) { //do nothing
  }
  else { level = 10}
  //print debug message if debuggingLevel warrants it
  if (DEBUG_LEVEL >= level){
    dbgmsg(debugMsg);
  }
}

var touchFileSync = function(file){
  fs.utimesSync(file, new Date(), new Date());
}

var copyFile = function(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

exports.debuggerMsg = debuggerMsg;
exports.isInt = isInt;
exports.touchFileSync = touchFileSync;
exports.copyFile = copyFile;