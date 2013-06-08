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
//Filesystem
var fs = require('fs');
// Holds semaphore locks for each file being watched
var files = {};

var fileListener = function listen(event,filename){
  files[filename].lock.take(function() {
    console.log(event);
    console.log(filename);
    var res = files[filename].res;
    res.write("slow hello"+filename+"\n");
  });
  res.end()
}

// don't call watch file without creating an JSON struct in var files for filename
// e.g. files['myfile.txt'] = {}
function watchFile(filename) {
  files[filename].lock = require('semaphore')(1);
  fs.watch(filename, fileListener);
}

function respond(req, res, next) {
  var slowRes = function(req,res,next) {
    var filename = req.params.name;
    files[filename].res = res;
    files[filename].req = req;
    watchFile('test.js');
  }
  res.write('fast hello\n');
  setTimeout(slowRes(req,res,next),500);

}

var server = restify.createServer();
server.get('/watchfile/:name', respond);
server.head('/watchfile/:name', respond);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});

