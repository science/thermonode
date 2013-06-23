var nodeunit = require('nodeunit');
var fs = require('fs');
var util = require('util');
var utils = require('../utils');
var dbg = require('../utils').debuggerMsg;
var child_process = require('child_process');
var restify = require('restify');
var thermoClient = require('../thermo-client');

// var server = child_process.fork('../thermo-server');
// server.on('message', function(msg) {
//   if (msg == 'started'){
//     console.log('msg: '+msg);
//     server.send('stop');
//   }
//   else if (msg == 'stopped'){
//     console.log('server stopped');
//     server.disconnect();
//     server.unref();
//   }
//   else {dbg('Unknown msg: '+util.inspect(msg));};
// });
//
// server.on('exit', function() {dbg('server p_exit')});
//
// server.send('start');
// dbg('post start');
//


// thermoServer = require('child_process').fork('../thermo-server');
// thermoServer.on('message', function(msg) {
//   if (msg=='started')
//     {dbg('server started');}
//   });
// thermoServer.send('start');


//consts
//Basic read test json files
var ORIGINAL_BASIC_JSON = 'test.json.orig';


//Test basic GET from JSON config file
//exports['read'] = nodeunit.testCase({
module.exports = {
  setUp: function (callback) {
    var file = 'test.json';
    this.testFilename = file;
    utils.copyFile(ORIGINAL_BASIC_JSON, file,function(){
      callback();
    });
  },
  tearDown: function (callback) {
    fs.unlinkSync(this.testFilename);
    callback();
  },
  basicGetDelayedConfigFile: function (test) {
    var WAIT_TIME_MS = 500;
    var file = this.testFilename;
    var startTime = Date.now();
    thermoClient.getConfigFileFromURL('localhost','8080','/watchfile',file, function(obj){
      var get_file = fs.readFileSync(file, {"encoding":"utf8"});
      var orig_file = fs.readFileSync(ORIGINAL_BASIC_JSON, {"encoding":"utf8"});
      test.equal(get_file, orig_file, "Original file and request file are not identical.");
      var endTime = Date.now();
      test.ok(endTime > startTime+WAIT_TIME_MS, "Delayed Get test took less than specified minimum wait time to run.");
      test.done();
    });
    //we delay a bit and then modify the config file which should trigger file return to waiting request
    setTimeout(function() {utils.touchFileSync(file)}, WAIT_TIME_MS);
  },
   test2: function (test) {
     test.equal(2,2);
     test.done();
   }
};


// thermoServer.send('stop');
// thermoServer.on('message', function(msg) {
//   if (msg=='stopped') {
//     thermoServer.disconnect();
//     thermoServer.unref();
//    }
// });
