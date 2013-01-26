/*global require console exports __dirname*/
var common = require('./common');
var resources = require("./resources");
var functions = require("./functions");

function route(request, response, handlers) {
  common.winston.debug("Routing:" + request.pathName + " Header[Accept-Encoding]: " + request.headers['accept-encoding']);  
  var resourcePath=common.constants.resourcePathPattern + "/";
  var acceptEncoding = !request.headers['accept-encoding'] ? '' : request.headers['accept-encoding'];
  if(request.pathName.search(resourcePath) === 0){
    resources.respondResource(request.pathName, response, acceptEncoding);
  }else if(request.pathName.search("/favicon.ico") === 0){
    resources.respondResource(resourcePath+"favicon.ico", response, acceptEncoding);
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
