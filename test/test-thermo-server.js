//var nodeunit = require('nodeunit');
var util = require('util');
var thermoServer = require('../thermo-server');
var dbg = require('../utils').debuggerMsg;


//var retval = thermoServer.foo();
//console.log(retval);
//
//var server = thermoServer.start();
//console.log('complete');
//server.on('listening', function(){console.log('ready'); server.stop;});

var server = require('child_process').fork('../thermo-server');

dbg('pre start');
server.on('message', function(msg) {
  if (msg == 'started'){
    console.log('msg: '+msg);
    server.send('stop');
  }
  else if (msg == 'stopped'){
    console.log('server stopped');
    server.disconnect();
    server.unref();
  }
  else {dbg('Unknown msg: '+util.inspect(msg));};
});

server.on('exit', function() {dbg('server p_exit')});

server.send('start');
dbg('post start');

//var cb = function(){console.log('ready'); thermoServer.stop();}
//server = thermoServer.start();
//server.on('listening', );


//exports['read'] = nodeunit.testCase({
//
//  setUp: function () {
//    console.log('start');
//    this._thermoServer = thermoServer.start();
//    this.foo="bar";
//    console.log('start 2');
//  },
//    tearDown: function () {
//    console.log('stop');
//    thermoServer.stop();
//    console.log('stop 2');
//  },
//  'test1': function (test) {
//    console.log('11 '+this.foo);
//    test.done();
//
////  this._thermoServer.on('listening'){
////    test.equal(2,2);
////    test.done();
////    }
//  }
//});
