/*global require console exports __dirname*/
var zlib = require('zlib');
var common = require("./common");
var functions = require("./functions");
var cachedResources = {},
	cachedDeflateResources = {},
	cachedGzipResources = {};
 
function respondResource(rPath, response, acceptEncoding){  
  var key=rPath.replace(common.constants.resourcePathPattern, common.constants.resourceBase);
  if (acceptEncoding.match(/\bgzip\b/) && cachedGzipResources[key]) {
    response.writeHead(200, { 'content-encoding': 'gzip' });
    response.write(cachedGzipResources[key]);
  }else if (acceptEncoding.match(/\bdeflate\b/) && cachedDeflateResources[key]) {
    response.writeHead(200, { 'content-encoding': 'deflate' });    
    response.write(cachedDeflateResources[key]);
  }else if(cachedResources[key]){
    response.writeHead(200, {});
    response.write(cachedResources[key]);
  }else{
    response.writeHead(400);
  }
  response.end();
}

function loadAllResources(dirPath){    
    var handler = function(filePath, data){
      cachedResources[filePath] = data;
      zlib.deflate(data, function(err, rs){
		  if(err !== undefined){
			cachedDeflateResources[filePath] = rs;
		  }
	  });
	  zlib.gzip(data, function(err, rs){
		  if(err !== undefined){
			cachedGzipResources[filePath] = rs;
		  }
	  });
	  common.winston.info("Found file " + filePath + " which was cached at key " + filePath);
    };
    
    var filter = function(){return true;};
    
	functions.processDir(dirPath, handler, filter);
}

loadAllResources(common.constants.resourceBase);

exports.respondResource= respondResource;


