/*global require console exports __dirname*/

var common = require("./common");
var functions = require("./functions");
var funcView = {};

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function getViewFunc(viewPath){
	var filePath = functions.realDir(common.constants.viewBase) + "/" + viewPath;
	var funcName = filePath.replace(/\//g,"_");
	return funcView[funcName];
}

function loadAllViews(dirPath){

    var handler = function(filePath, data){
      var funcName = filePath.replace(/\//g,"_");
      funcView[funcName] = common.ejs.compile(data,{filename: filePath});
	  common.winston.info("Found file " + filePath + " which was compiled to function " + funcName);
    };
    
    var filter = function(filePath){return endsWith(filePath, ".ejs");};
    
	functions.processDir(dirPath, handler, filter);
}

loadAllViews(functions.realDir(common.constants.viewBase));

exports.getViewFunc= getViewFunc;


