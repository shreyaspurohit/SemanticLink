/*global require console exports __dirname*/
var common = require('./common');
var resources = require("./resources");
var functions = require("./functions");

function route(request, response, handlers) {
  common.winston.debug("Routing:" + request.pathName);  
  var resourcePath=common.constants.resourcePathPattern + "/";
  if(request.pathName.search(resourcePath) === 0){
    resources.respondResource(request.pathName, response);
  }else if(request.pathName.search("/favicon.ico") === 0){
    resources.respondResource(resourcePath+"favicon.ico", response);
  }
  else{
     var hf = request.pathName.replace(/\//gi, "_");
	  if(handlers[hf] !== undefined){
	  	handlers[hf](request, response);
	  }else{
	  	handlers['doRedirect'](request, response);
	  }	    
  }
}

exports.route = route;
