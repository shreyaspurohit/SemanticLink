/*global require console exports __dirname*/
var zlib = require('zlib');
var common = require("./common");
var functions = require("./functions");
var cachedResources = {},
	cachedDeflateResources = {},
	cachedGzipResources = {};
var moduleLoadTime = Date.now();

function withResponseCacheControl(response, modifiedSince, executeifNotNoneMatch){
	response.setHeader('Last-Modified', moduleLoadTime); //As resources are cached always
	if(modifiedSince === JSON.stringify(moduleLoadTime)){
		response.statusCode = 304;		
	}else{
		executeifNotNoneMatch(response);
	}
	
} 

function respondResource(rPath, response, acceptEncoding, modifiedSince){  
  var key=rPath.replace(common.constants.resourcePathPattern, functions.realDir(common.constants.resourceBase));
  if (acceptEncoding.match(/\bgzip\b/) && cachedGzipResources[key]) {	 
	withResponseCacheControl(response, modifiedSince, function(response){
		response.writeHead(200, { 'content-encoding': 'gzip' });
		response.write(cachedGzipResources[key]);
	});    
  }else if (acceptEncoding.match(/\bdeflate\b/) && cachedDeflateResources[key]) {
	withResponseCacheControl(response, modifiedSince, function(response){
		response.writeHead(200, { 'content-encoding': 'deflate' });    
		response.write(cachedDeflateResources[key]);
	});
  }else if(cachedResources[key]){
	withResponseCacheControl(response, modifiedSince, function(response){
		response.writeHead(200, {});
		response.write(cachedResources[key]);
	});
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

loadAllResources(functions.realDir(common.constants.resourceBase));

exports.respondResource= respondResource;


