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
					return elem && elem !== '' && self.indexOf(elem) == pos;
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

var urlRegEx=/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i ;
function _validateUrl(url){
	if(url && urlRegEx.test(url)){
		return true;
	}
	return false;
}

exports.processDir=_processDir;
exports.generateBetterLink=_generateBetterLink;
exports.validateUrl=_validateUrl;
