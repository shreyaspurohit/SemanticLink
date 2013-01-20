/*global require console exports __dirname*/
var common = require("./common");
var functions = require("./functions");
var cachedResources = {};

function respondResource(rPath, response){  
  var key=rPath.replace(common.constants.resourcePathPattern, common.constants.resourceBase);
  if(cachedResources[key]){
    response.writeHead(200);
    response.write(cachedResources[key]);
  }else{
    response.writeHead(400);
  }
  response.end();
}

function loadAllResources(dirPath){    
    var handler = function(filePath, data){
      cachedResources[filePath] = data;
	  common.winston.info("Found file " + filePath + " which was cached at key " + filePath);
    };
    
    var filter = function(){return true;};
    
	functions.processDir(dirPath, handler, filter);
}

loadAllResources(common.constants.resourceBase);

exports.respondResource= respondResource;


