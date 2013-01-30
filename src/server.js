/*global require console exports*/

var http = require("http");
var url = require("url");
var common = require('./common.js');
var sio = require('socket.io');
var RRWrapper = require('./rrWrapper.js');
var io = undefined;

function start(route, handlers) {
  function onRequest(request, response) {
    attachSocketIO(response);
    var pathname = url.parse(request.url).pathname;
    request.pathName = pathname;
    route(new RRWrapper(request, response), handlers);
  }
  
  var server = http.createServer(onRequest)
  io = sio.listen(server);
  io.set('log level', 1);
  server.listen(8888);
  common.winston.info("Server has started on port 8888.");
}

function attachSocketIO(response){
    response.ws = io.sockets;
}

exports.start = start;
