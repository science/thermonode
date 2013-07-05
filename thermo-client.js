/*
Thermo-Client's job is to pull down configuration updates from an api server

Then it is supposed to update it's internal systems to change the status of the heater
based on inputs from the thermometer compared to the configuration file information
*/

//INCLUDES
var restify = require('restify');
var dbg = require('./utils').debuggerMsg;
var thermoServer = require('./thermo-server');
var testCallback = null;
var StringDecoder = require('string_decoder').StringDecoder;
var fs = require('fs');

//CONSTANTS
var BOOT_FILE_NAME = "boot.json";

var receiveConfigFileFromURL = function(err,req,res,obj){
  if (err) {
    console.log(err);
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
  if (typeof testCallback == 'function') {testCallback(obj);};
}


var getConfigFileFromURL = function(server, port, path, file, callback){
  if (port === undefined) {port = '80'}
  var file = file;
  var client = restify.createJsonClient({url:"http://"+server+":"+port});
  if (typeof callback == 'function') {testCallback = callback};
  client.get(path+"/"+file, receiveConfigFileFromURL);
}


//open boot file to find location of config URL for full start up
var getBootFileAsJson = function(file){
  var decoder = new StringDecoder;
  var buffer = fs.readFileSync(file);
  var data = decoder.write(buffer);
  var bootConfig = JSON.parse(data);
  return bootConfig;
}





exports.getBootFileAsJson = getBootFileAsJson;
exports.getConfigFileFromURL = getConfigFileFromURL;



/*
System installation requirements
  modeprobe (default with Rasberian)
  WiringPi GPIO utility (https://projects.drogon.net/raspberry-pi/wiringpi/the-gpio-utility/)

Node.js installation requirements
  restify
  nodeunit

*/

/*
JSON command files
  boot.json
    Boot file defines basic variables such as where to obtain full config file from server
      http://[server-name]/[api-path]/[instance-name].json
    Operating limits
      Provides basic safety parameters for operation
        Always turn off heater above XX temperature
        Never operate heater for more than XX minutes
  [instance-name].json
    Defines network refresh/polling period
    Defines immediate and scheduled operations
      Immediate operations defines simply "on/off"
      Scheduled operations
        Provides schedule information for temperature settings per days/times
        Options:
          Daily: Set of times/temps for operation each day (1 set of config/week)
          Weekly: Set of times/temps unique for operation M-Su (7 sets of configs/week)
          WorkWeekly: Set of times/temps unique for operation M-Fr, Sa-Su (2 sets of configs/week)

File formats

boot.json
{
  "config-source": {
    "immediate-polling-seconds": 300,
    "config-url": "http://localhost:8080/now/backbedroom.json"
    "config-url-watch": "http://localhost:8080/watchfile/backbedroom.json"
    "watch-timeout-minutes": 780
  }
  "operating-parameters": {
    "max-temp-f": 80,
    "max-operating-minutes": 60
  }
}

Note that polling-seconds is usually irrelevant b/c client will hit the immediate polling
url and then hang out on config-url-watch will update immediately upon remote file change


[instance-name].json
{
  "immediate-operation": ["on"|"off"|other value/null="undefined"],
  "scheduled-operation-mode": ["daily"|"weekly"|"workweekly"],
  "daily-schedule": {
    ["daily"]: {"times-of-operation": [
      {"start": "6:30 am", "stop": "10:00 am", "temp-f": 68},
      {"start": "10:00 am", "stop": "6:00 pm", "temp-f": 62},
      {"start": "7:00 pm", "stop": "11:00 pm", "temp-f": 70},
      {"start": "11:00 pm", "stop": "5:30 am", "temp-f": 62}
  ]}},
  "weekly-schedule": {
    ["monday".."sunday"]: {"times-of-operation": [
      {"start": "6:30 am", "stop": "10:00 am", "temp-f": 68},
      {"start": "10:00 am", "stop": "6:00 pm", "temp-f": 62},
      {"start": "7:00 pm", "stop": "11:00 pm", "temp-f": 70},
      {"start": "11:00 pm", "stop": "5:30 am", "temp-f": 62}
  ]}},
  "workweekly-schedule": {
    ["workday"|"weekend"]: {"times-of-operation": [
      {"start": "6:30 am", "stop": "10:00 am", "temp-f": 68},
      {"start": "10:00 am", "stop": "6:00 pm", "temp-f": 62},
      {"start": "7:00 pm", "stop": "11:00 pm", "temp-f": 70},
      {"start": "11:00 pm", "stop": "5:30 am", "temp-f": 62}
  ]}},
}

schedule notes:
  If there is a gap between one end time and the following start time, heater will be OFF during that period
  If a scheduled time extends to the following day (or over a following time period of the same day),
    it overrides any settings for the following day/time period until it stops/expires
*/


/*
Command line entries for relay and thermometer hardware

Init for Relay
  gpio mode 0 out

Operation for Relay
  Relay closed:
    gpio write 0 1
  Relay open:
    gpio write 0 0

Init for Thermomometer
sudo modprobe w1-gpio
sudo modprobe w1-therm

Operation for Thermometer
  Look in /sys/bus/w1/devices
    for folder named "28-*"
    Look in folder for file named w1_slave
      pull ascii contents of file into var
      grep var for /YES/
        Continue if found
        Temp read fail/error if not found (try re-init?)
      grep var for /t=[0-9]+/
      place decimal left of the 3rd digit to the right: [0-9]+\.[0-9][0-9][0-9]$
      convert var to float
      temperature can now be read as a celsius float
      bounds check variable within 0 and 45
        If bounds check fails, turn off heater

*/