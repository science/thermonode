var dbgmsg = require('util').debug;

// 0 = none, big number = output lots of stuff
var DEBUG_LEVEL = 10;

// from http://stackoverflow.com/questions/3885817/how-to-check-if-a-number-is-float-or-integer
var isInt = function (n) {
   return n===+n && n===(n|0);
}
exports.isInt = isInt;

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
exports.debuggerMsg = debuggerMsg;