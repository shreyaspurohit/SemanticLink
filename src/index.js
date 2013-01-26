/*global require console exports process*/

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandler");
var common= require("./common");

common.winston.add(common.winston.transports.File, { filename: common.constants.logFile });
server.start(router.route, requestHandlers);

if((process.argv.length > 2 && process.argv[2] !== '-isRunningAsCluster')
   || process.argv.length <= 2){
  requestHandlers.initDBJobs();
}

exports.rq = requestHandlers;
