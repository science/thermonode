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



//exports['read'] = nodeunit.testCase({
module.exports = {
  setUp: function (callback) {
    var file = 'test.json';
    this.testFilename = file;
    utils.copyFile('test.json.orig','test.json',function(){
    callback();
    });
  },
  tearDown: function (callback) {
    fs.unlinkSync(this.testFilename);
    callback();
  },
  test1: function (test) {
    var file = this.testFilename;
    thermoClient.getConfigFileFromURL('localhost','8080','/watchfile',file, function(obj){
      dbg(util.inspect(obj));
      test.done();
    });
    setTimeout(function() {utils.touchFileSync(file)}, 500);
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
