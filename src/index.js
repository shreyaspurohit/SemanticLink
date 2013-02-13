/*global require console exports process*/
var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandler");
var common= require("./common");
var f= require("./functions");

common.winston.add(common.winston.transports.File, { filename: f.realDir(common.constants.logFile)});
common.winston.info('Current Working Directory: ' + process.cwd());
server.start(router.route, requestHandlers);

if((process.argv.length > 2 && process.argv[2] !== '-isRunningAsCluster')
   || process.argv.length <= 2){  
  requestHandlers.initDBJobs();
}

exports.rq = requestHandlers;
