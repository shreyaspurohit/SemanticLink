/*global require console exports __dirname*/
var common = require('./common');
var resources = require("./resources");
var functions = require("./functions");

function route(rrWrapper, handlers) {
  common.winston.debug("Routing:" + rrWrapper.pathName + " Header[Accept-Encoding]: " + rrWrapper.requestEncodings);  
  var resourcePath=common.constants.resourcePathPattern + "/";  
  if(rrWrapper.pathName.search(resourcePath) === 0){
    resources.respondResource(rrWrapper.pathName, rrWrapper.response, rrWrapper.requestEncodings);
  }else if(rrWrapper.pathName.search("/favicon.ico") === 0){
    resources.respondResource(resourcePath+"favicon.ico", rrWrapper.response, rrWrapper.requestEncodings);
  }
  else{
     var hf = rrWrapper.pathName.replace(/\//gi, "_");
	  if(handlers[hf] !== undefined){
	  	handlers[hf](rrWrapper);
	  }else{
	  	handlers['doRedirect'](rrWrapper);
	  }	    
  }
}

exports.route = route;
