/*
Thermo-Client's job is to pull down configuration updates from an api server

Then it is supposed to update it's internal systems to change the status of the heater
based on inputs from the thermometer compared to the configuration file information
*/

var restify = require('restify');

var file = process.argv[2];
var client = restify.createJsonClient({url:"http://localhost:8080"});

client.get("/watchfile/"+file, function(err,req,res,obj){
  if (err) {
    console.log(err.code);
    if (err.code == 'ECONNRESET') {
      console.log('Connection has timed out');
    }
    else { throw err; }
    //err.statusCode = 404 etc
  }
  else {
    console.log('%j',obj);
    res.socket.end();
  }
  req.end();

});