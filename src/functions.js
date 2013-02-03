/*global require console exports __dirname*/
var common = require("./common");
var semLink = require("./semLink.js");

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

function removeDuplicates(arr){
	return arr.filter(function(elem, pos, self) {
					return self.indexOf(elem) == pos;
			});
}
function sanitizeArrayElem(arr){
	arr.forEach(function(element, index, array) {
		array[index]=element.toLowerCase().replace(/[^\w\s]/gi, '');//Remove all special characters
	});
	return arr;
}

function _generateBetterLink(realLink, tags, useSuggest, callback){
	function convertTagsToBetterLink(tags){
		return ((tags ? tags.replace(/,/g, '.').replace(/ /g, '') + "." : "") + 
			(tags ? Math.random().toString(36).substr(2,5) : Math.random().toString(36).substr(2,8)).toLowerCase());
	}
	
	if(useSuggest && useSuggest === 'true'){
		semLink.linkTagsUsingHttp(realLink, function(urlTags){
			var allTags = removeDuplicates(sanitizeArrayElem(urlTags.concat(tags.split(','))));
			callback(convertTagsToBetterLink(allTags.slice(0, common.constants.numberOfTagsInNewLink).join(',')), 
					tags);
		});
	}else{
		callback(convertTagsToBetterLink(tags), tags);
	}
}

exports.processDir=_processDir;
exports.generateBetterLink=_generateBetterLink;
