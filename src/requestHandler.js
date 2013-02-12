/*global require console exports*/

var exec = require("child_process").exec;
var common = require('./common.js');
var layout = require('./layout.js');
var functions = require('./functions.js');
var dl = require('./dataLayer.js');

function start(rr) {
  common.winston.info("Handling /start or /");
  var respHandler=function(err, data){
   var responseData = {'trending': []};
   if(data && data.length > 0){
	responseData = {'trending': data};  
   }
   rr.respondLayoutHtml(common.constants.ejsIndex, responseData);  
  };
  dl.top5Trending(respHandler);
}

function about(rr){
  common.winston.info("Handling /about");
  rr.respondLayoutHtml(common.constants.ejsAbout);
}

function api(rr){
  common.winston.info("Handling /api");
  rr.respondLayoutHtml(common.constants.ejsApi);
}

function privacy(rr){
  common.winston.info("Handling /privacy");
  rr.respondLayoutHtml(common.constants.ejsPrivacy);
}

function generate(rr){
  common.winston.info("Handling /generate");  
  rr.handlePost(function(postData){	
	  common.winston.info('Generate POST data: ' + common.util.inspect(postData));
	  if(functions.validateUrl(postData.link)){
	        var betterLinkHandler = function(betterLink, completeTags){
			dl.saveNewLink(postData.link, postData.tags, betterLink);		
			rr.broadCastToLinkChannel({'newLink': betterLink});
			rr.respondText(betterLink);
		}
		functions.generateBetterLink(postData.link, postData.tags, postData.useSuggest, betterLinkHandler);	
	  }else{
		  rr.respondText('Invalid input URL format');
	  }	
  });    
}

function doRedirect(rr){
	var agent = common.useragent.lookup(rr.requestUserAgent);
	dl.redirectToRealLink(rr.pathName, agent, function(err, redirectLink){
		if(err || !redirectLink){
			rr.respond404();
		}else{
			common.winston.debug('Redirecting ' + rr.pathName + ' to ' + redirectLink);
			rr.respondRedirect(redirectLink);
		}
	});	
}

function suggestTags(rr){
	rr.handleGet(function(getData){
		common.winston.debug("Query for tag suggest: " + getData.query);
		var callbackHandler = function(err,data){
			if(err){
				rr.endResponse();
			}else{
				rr.respondJson(data);
			}
		};
		dl.suggestTags(getData.query, callbackHandler);
	});
}

function tagCloud(rr){
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
	var resHandler=function(data, err){		
		if(data && data.length > 0){
			var tagDataJson=data.map(function(item){return {'tagName':item._id, 'tagStrength':item.value};});			
			fisherYates(tagDataJson);
			rr.respondJson(tagDataJson);
		}else{
			rr.endResponse();
		}
	};
	dl.topTags(resHandler);
}

function uaSummaryBrowser(rr){
	var resHandler=function(data, err){		
		if(data && data.value){			
			var resultArr = [];
			for(var type in data.value){
				resultArr.push([type, data.value[type]]);
			}
			rr.respondJson(resultArr);
		}else{
			rr.endResponse();
		}		
	};
	dl.uaSummary('browser', resHandler);
}

function uaSummaryOS(rr){
	var resHandler=function(data, err){		
		if(data && data.value){			
			var osType = [], osCount = [];
			for(var type in data.value){
				osType.push(type);
				osCount.push(data.value[type]);
			}
			rr.respondJson({'osArray':osType, 'osCount':osCount});
		}else{
			rr.endResponse();
		}
	};
	dl.uaSummary('os', resHandler);
}

function initDBJobs(){
	dl.initDBJobs();
}

exports._=start;
exports._index=start;
exports._start = start;
exports._about = about;
exports._api = api;
exports._privacy = privacy;
exports._generate=generate;
exports._suggestTags=suggestTags;
exports._tagCloud=tagCloud;
exports._topTags=tagCloud;
exports._uaSummaryBrowser=uaSummaryBrowser;
exports._uaSummaryOS=uaSummaryOS;
exports.doRedirect=doRedirect;
exports.initDBJobs=initDBJobs;
