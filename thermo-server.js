/*
Thermo-server's job is to:

1) Serve configuration files on its file system and optionally when they change to make them available to the HTTP client requesting them

API

/wait/file-name..
/now/file-name..

If HTTP client calls /wait, the file time is checked immediately and then if it changes, the file is sent to the HTTP client and the connection is closed
If HTTP client calls /now, the file is sent immediately

2) Allow authorized clients to update configuration files (to permit mobile updates)
   Possibly this will be implemented with FTP updates in the short term?

*/

// API framework
var restify = require('restify');
var fs = require('fs');
var StringDecoder = require('string_decoder').StringDecoder;
var dbgmsg = require('util').debug;


// 0 = none, big number = output lots of stuff
var DEBUG_LEVEL = 10;
var MAX_WATCH_WAIT = 12*60*60 // each file watch process should wait no longer than 12 hours before giving up and just handing over the file as-is

// global file
// Holds semaphore locks for each file being watched
var files = {};

// from http://stackoverflow.com/questions/3885817/how-to-check-if-a-number-is-float-or-integer
function isInt(n) {
   return n===+n && n===(n|0);
}
//write debug messages to stderr using node debug log method
function dbg(debugMsg, level){
  if (isInt(level)) { //do nothing
  }
  else { level = 10}
  //print debug message if debuggingLevel warrants it
  if (DEBUG_LEVEL >= level){
    dbgmsg(debugMsg);
  }
}

// Pass the file contents back to response object
//   Since this function gets called for *every* change event we have
//   to be careful we only act on change events where the file has content
//   For example, an edit event might be represented by the OS as a delete/create
//   In this case, we'll get two "change" events, but one will have the file at 0 bytes and the other will have it filled with content
var getFileOnChange = function (event,filename){
  if (filename && fs.existsSync(filename)) {
    var fileInfo = fs.statSync(filename);
    if (fileInfo.size > 0) {
      // We have a file with content, so we invoke the semaphore we created earlier so we are the only change event
      // that is working to return the file contents into the response object
      files[filename].lock.take(function() {
        // get file contents
        var data = fs.readFileSync(filename, {"encoding":"utf8"});
        var res = files[filename].res;
        res.write(data);
        res.end();
      });
    }
  }
}

// don't call watch file without creating an JSON struct in var files for filename
// e.g. files['myfile.txt'] = {}
function watchFile(filename, req, res, next) {
  dbg('watchFile');
  files[filename] = {};
  files[filename].res = res;
  files[filename].req = req;
  files[filename].lock = require('semaphore')(1);
  fs.watch(filename, getFileOnChange);
}

// kicks off long running process to watch for file changes
function watchFileResponse(req, res, next) {

  res.on('close', function(){dbg('unexpected close');});

  filename = req.params.name;
  dbg('watchFileResponse: '+ filename);
  if (filename && fs.existsSync(filename)) {
    dbg('watch');
    watchFile(filename, req, res, next);
  }
  else {
    dbg('watch not found');
    res.statusCode = 404;
    //response.send('{"code": "FileNotFound", "message":"File specified could not be found"}');
    res.end();
  }
}

var server = restify.createServer();
// restify provided hack to manage curl as a client
server.pre(restify.pre.userAgentConnection());
server.get('/watchfile/:name', watchFileResponse);
server.head('/watchfile/:name', watchFileResponse);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
