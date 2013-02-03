/*global require console exports process emit*/
/*
 *  This module is reponsible to make sense of the link and generate
 *  keywords based on it in reasonable time.
 * 
 */
var common=require('./common');
var http = require('http');
var https = require('https');
//For now 'title' of webpage provides the best details of a website. Need to add more intellect
var titleRegEx = /[\s\S]*<title>(.*)<\/title>[\s\S]*/gm ;
var ignore = ['a', 'an', 'the', 'how', 'to', 'using', 'in', 'this', 'that', 'for',
			 '&amp;', ''];
			 
function extract(data, callback){
	var result = titleRegEx.exec(data);
	if(result && result[1]){//Remove special characters except space from title
		var filtered = result[1].replace(/[^\w\s ]/gi, '').split(' ').filter(function(val, index, arr){
			if(ignore.indexOf(val.toLowerCase()) === -1){
				return true;
			}
			return false;
		});
		common.winston.debug('New Tags: ' + filtered);
		callback(filtered)						
		return true;
	}
	return false;
}
function requestLinkTagsHttp(url, callback){
	function whatType(url){
		if(url.indexOf('http://') == 0)
			return http;
		else if(url.indexOf('https://') == 0)
			return https
		else{
			return;
		}
	}
	var type = whatType(url);
	if(!type){
		callback([]);
		return;
	}
	
	var onTimeout = function(request, response, f) {
		var startTime=Date.now();
		return function() {
			var endTime=Date.now();
			common.winston.debug('Max response time exceeded, aborting request, destroying response: ' + startTime + '/' + endTime + '/' + (endTime-startTime))			
			response.destroy();
			request.abort();
			f([]);
		};
	};
	var sTime=Date.now();	
	var req= type.get(url, function(res){
		var timeout = setTimeout(onTimeout(req, res, callback), 1500);//Lets try to limit time to get data to 1500ms
	    res.setEncoding('utf8');	    		
	    var data = '';
	    res.on('data', function (chunk) { 	
		  data += chunk; //Get chunks till the below extract condition becomes true
		  if(extract(data, callback)){
			    common.winston.debug('Time to get keys for ' + url +' in ms: ' + (Date.now()-sTime));
				req.abort();	
				res.destroy();
				clearTimeout(timeout);	  
		  }
	    });	
	}).on('error', function(e) {
		common.winston.info("Error while "+ type +" get on : " + url + " error: " + e.message);
		clearTimeout(timeout);
	});	
}

exports.linkTagsUsingHttp=requestLinkTagsHttp;
