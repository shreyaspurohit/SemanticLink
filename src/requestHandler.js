/*global require console exports*/

var exec = require("child_process").exec;
var common = require('./common.js');
var layout = require('./layout.js');
var functions = require('./functions.js');
var dl = require('./dataLayer.js');

function start(request, response) {
  common.winston.info("Handling /start or /");
  var respHandler=function(err, data){
   if(data && data.length > 0){
	layout.respondHtml(common.constants.ejsIndex, {'trending': data}, response);  
   }else{
	layout.respondHtml(common.constants.ejsIndex, {'trending': []}, response);  
   }
  };
  dl.top5Trending(respHandler);
}

function generate(request, response){
  common.winston.info("Handling /generate");
  functions.handlePost(request, response, function(postData){
	response.writeHead(200, common.constants.textContent);
	var betterLink = functions.generateBetterLink(postData.link, postData.tags);
	dl.saveNewLink(postData.link, postData.tags, betterLink);	
	response.write(betterLink);
	response.ws.emit('link', {'newLink': betterLink});
	response.end();
  });    
}

function doRedirect(request, response){
	var agent = common.useragent.lookup(request.headers['user-agent']);
	dl.redirectToRealLink(response, request.pathName, agent);	
}

function suggestTags(request, response){
	functions.handleGet(request, response, function(getData){
		common.winston.debug("Query for tag suggest: " + getData.query);
		dl.suggestTags(response, getData.query);
	});
}

function tagCloud(request, response){
	function fisherYates ( arrayData ) {
	  var i = arrayData.length, j, tempi, tempj;
	  if ( i === 0 ) return false;
	  while ( --i ) {
	     j = Math.floor( Math.random() * ( i + 1 ) );
	     tempi = arrayData[i];
	     tempj = arrayData[j];
	     arrayData[i] = tempj;
	     arrayData[j] = tempi;
	   }
	}
	response.writeHead(200, common.constants.textContent);
	var resHandler=function(data, err){		
		if(data && data.length > 0){
			var tagDataJson=data.map(function(item){return {'tagName':item._id, 'tagStrength':item.value};});			
			fisherYates(tagDataJson);
			response.write(JSON.stringify(tagDataJson));
		}
		response.end();
	};
	dl.topTags(resHandler);
}

function uaSummaryBrowser(request, response){
	response.writeHead(200, common.constants.textContent);
	var resHandler=function(data, err){		
		if(data && data.value){			
			var resultArr = [];
			for(var type in data.value){
				resultArr.push([type, data.value[type]]);
			}
			response.write(JSON.stringify(resultArr));
		}
		response.end();
	};
	dl.uaSummary('browser', resHandler);
}

function uaSummaryOS(request, response){
	response.writeHead(200, common.constants.textContent);
	var resHandler=function(data, err){		
		if(data && data.value){			
			var osType = [], osCount = [];
			for(var type in data.value){
				osType.push(type);
				osCount.push(data.value[type]);
			}
			response.write(JSON.stringify({'osArray':osType, 'osCount':osCount}));
		}
		response.end();
	};
	dl.uaSummary('os', resHandler);
}

function initDBJobs(){
	dl.initDBJobs();
}

exports._=start;
exports._index=start;
exports._start = start;
exports._generate=generate;
exports._suggestTags=suggestTags;
exports._tagCloud=tagCloud;
exports._uaSummaryBrowser=uaSummaryBrowser;
exports._uaSummaryOS=uaSummaryOS;
exports.doRedirect=doRedirect;
exports.initDBJobs=initDBJobs;
