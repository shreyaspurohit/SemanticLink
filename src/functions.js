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

function _generateBetterLink(realLink, tags){
	//TODO read the contents of the real link and use them to create a better link
	return ((tags ? tags.replace(/,/g, '.').replace(/ /g, '') + "." : "") + 
			(tags ? Math.random().toString(36).substr(2,5) : Math.random().toString(36).substr(2,8)).toLowerCase());
}

exports.processDir=_processDir;
exports.generateBetterLink=_generateBetterLink;
