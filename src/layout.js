/*global require console exports __dirname*/

var common = require("./common");
var view = require("./view");

var funcLayout;

function getFuncLayout(){
	if(funcLayout === undefined){
		funcLayout = view.getViewFunc(common.constants.ejsLayout);
	}
	return funcLayout;
}

function mergeLayout(filledTmpl){
	var head = filledTmpl.match(/([\s\S]*)<head>([\s\S]*)<\/head>([\s\S]*)/i)[2];
	var body = filledTmpl.match(/([\s\S]*)<body>([\s\S]*)<\/body>([\s\S]*)/i)[2];
	return getFuncLayout()().replace(common.constants.headMarker, head).replace(common.constants.bodyMarker, body);
}

function display(viewPath, data){
	return mergeLayout(view.getViewFunc(viewPath)(data));
}

function respondHtml(viewPath, data, responder){  
  responder(display(viewPath, data)); 
}

exports.display = display;
exports.respondHtml = respondHtml;
