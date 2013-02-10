var layout = require('./layout.js');
var common = require('./common.js');
var resultOut;
const title404 = "Oops 404";

function get404(){
 var layout = require("./layout");
 if(resultOut === undefined){
   resultOut = layout.display(common.constants.ejs404, {title: title404, message : common.constants.msg404});
 }
  return resultOut;
}

function RRWrapper(request, response){
	this.request = request;
	this.response = response;
	this.pathName = request.pathName;
	this.requestUserAgent = request.headers['user-agent'];
	this.requestEncodings = !request.headers['accept-encoding'] ? '' : request.headers['accept-encoding'];	
	this.modifiedSince = request.headers['if-modified-since'];
}

RRWrapper.prototype = {
	respondLayoutHtml : function(ejsPath, data){		  
		  layout.respondHtml(ejsPath, data, this.writeResponseHtml(this.response));
	},
	writeResponseHtml : function (response){
		  return function(data){
			  response.writeHead(200, common.constants.htmlContent);
			  response.write(data);
			  response.end();
	      }
	},
	handleGet : function (handler){
		if(this.request.method=='GET') {
			var url_parts = common.url.parse(this.request.url,true);
			handler(url_parts.query);
		}else{
			throw "IllegalRequestTypeError";
		}
	},
	handlePost : function (handler){
		  if (this.request.method == 'POST') {
				var body = '';
				this.request.on('data', function (data) {
					body += data;
					if (body.length > 1e6) {
						// Flood attack, too much data, stop the request
						this.response.writeHead(413, common.constants.textContent); //Request entity too large
						this.request.connection.destroy();
						this.endResponse();
					}
				});
				this.request.on('end', function () {
					var postData = common.qs.parse(body);
					handler(postData);
				});
		  }else{
				throw "IllegalRequestTypeError";
		  }
	},
	respondJson : function(object){
		this.response.writeHead(200, common.constants.jsonContent);
		this.response.write(JSON.stringify(object));
		this.endResponse();
	},
	respond404 : function(){
		common.winston.info("Could not route to path " + this.pathName + ", probably expected one defined request handler for it");
		this.response.writeHead(404, common.constants.htmlContent);
		this.response.write(get404());
		this.endResponse();
	},
	respondText : function(data){
		this.response.writeHead(200, common.constants.textContent);
		this.response.write(data);
		this.endResponse();
	},
	respondRedirect : function (url){
		this.response.writeHead(302, {
			"Content-Type":"text/plain",
			"Location" : url
		});
		this.response.write("Re-directing to URL " + url);
		this.endResponse();
	},
	endResponse: function(){
		this.response.end();
	},
	broadCastToLinkChannel : function(data){
		this.response.ws.emit('link', data);
	}
}

module.exports=RRWrapper;
