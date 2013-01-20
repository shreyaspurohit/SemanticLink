/*global require console exports __dirname*/
var common = require("./common");

function _processDir(dirPath, handler, filter){
 var handleFile = function(filePath, fileHandler, filter){
							return function(err, stats){
								if(stats.isDirectory())
									_processDir(filePath,fileHandler, filter);
								else if(filter(filePath)){							    	
									common.fs.readFile(filePath, 'utf8', function (err, data) {
									  if (err) throw err;
									  fileHandler(filePath, data);
									});
							    }
						    };
						   };
						   
 var processDir = function(dirPath, handler, filter){
	common.fs.readdir(dirPath, function(err,files){
	  for(var i in files){
	    var filePath = dirPath + "/" + files[i];
		common.fs.stat(filePath, handleFile(filePath, handler, filter));
	  }
	});
 };
 processDir(dirPath, handler, filter);
}

function _handlePost(request, response, handler){
  if (request.method == 'POST') {
        var body = '';
        request.on('data', function (data) {
            body += data;
            if (body.length > 1e6) {
                // Flood attack, too much data, stop the request
                response.writeHead(413, common.constants.textContent); //Request entity too large
                request.connection.destroy();
            }
        });
        request.on('end', function () {
            var postData = common.qs.parse(body);
            handler(postData);
        });
  }else{
		throw "IllegalRequestTypeError";
  }
}

function _handleGet(request, response, handler){
	if(request.method=='GET') {
		var url_parts = common.url.parse(request.url,true);
		handler(url_parts.query);
	}else{
	    throw "IllegalRequestTypeError";
	}
}

function _generateBetterLink(realLink, tags){
	//TODO read the contents of the real link and use them to create a better link
	return ((tags ? tags.replace(/,/g, '.').replace(/ /g, '') + "." : "") + 
			(tags ? Math.random().toString(36).substr(14,16) : Math.random().toString(36).substr(10,16)).toLowerCase());
}

var resultOut;
const title404 = "Oops 404";

function get404(){
 var layout = require("./layout");
 if(resultOut === undefined){
   resultOut = layout.display(common.constants.ejs404, {title: title404, message : common.constants.msg404});
 }
  return resultOut;
}

function send404(response, path){
    common.winston.info("Could not route to path " + path + ", probably expected one defined request handler for it");
	response.writeHead(404, common.constants.htmlContent);
	response.write(get404());
	response.end();
}

function sendRedirect(response, url){
	response.writeHead(302, {
		"Content-Type":"text/plain",
		"Location" : url
	});
	response.write("Re-directing to URL " + url);
	response.end();
}

exports.processDir=_processDir;
exports.handlePost=_handlePost;
exports.handleGet=_handleGet;
exports.generateBetterLink=_generateBetterLink;
exports.send404=send404;
exports.sendRedirect=sendRedirect;
