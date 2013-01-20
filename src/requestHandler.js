/*global require console exports*/

var exec = require("child_process").exec;
var common = require('./common.js');
var layout = require('./layout.js');
var functions = require('./functions.js');
var dl = require('./dataLayer.js');

function start(request, response) {
  common.winston.info("Handling /start or /");
  var respHandler=function(err, data){
   if(data && data.length > 0){
	layout.respondHtml(common.constants.ejsIndex, {'trending': data}, response);  
   }else{
	layout.respondHtml(common.constants.ejsIndex, {'trending': []}, response);  
   }
  };
  dl.top5Trending(respHandler);
}

function generate(request, response){
  common.winston.info("Handling /generate");
  functions.handlePost(request, response, function(postData){
	response.writeHead(200, common.constants.textContent);
	var betterLink = functions.generateBetterLink(postData.link, postData.tags);
	dl.saveNewLink(postData.link, postData.tags, betterLink);	
	response.write(betterLink);
	response.ws.emit('link', {'newLink': betterLink});
	response.end();
  });    
}

function doRedirect(request, response){
	dl.redirectToRealLink(response, request.pathName);
}

function suggestTags(request, response){
	functions.handleGet(request, response, function(getData){
		common.winston.debug("Query for tag suggest: " + getData.query);
		dl.suggestTags(response, getData.query);
	});
}

function initDBJobs(){
	dl.initDBJobs();
}

exports._=start;
exports._index=start;
exports._start = start;
exports._generate=generate;
exports._suggestTags=suggestTags;
exports.doRedirect=doRedirect;
exports.initDBJobs=initDBJobs;

/*
var exec = require("child_process").exec;

function start(response) {
  console.log("Request handler 'start' was called.");

  exec("find /",
    { timeout: 10000, maxBuffer: 20000*1024 },
    function (error, stdout, stderr) {
      response.writeHead(200, {"Content-Type": "text/plain"});
      response.write(stdout);
      response.end();
    });
}

function upload(response) {
  console.log("Request handler 'upload' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello Upload");
  response.end();
}

exports.start = start;
exports.upload = upload;
*/
