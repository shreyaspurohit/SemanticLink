/*global require console exports process emit*/

var common=require("./common");
var functions=require("./functions");
var workers = require("./workers");
var withMongoDB = require('./connection').withMongoDB

function initDBJobs(){
  workers.submitRunAlways(__dirname + "/dbWorkers.js", {'fName':'startDBJobs'});
}

function _saveNewLink(realLink, tags, betterLink){
	common.winston.info("Saving Real link: " + realLink + "; Tags: " + tags + "; Better Link: " + betterLink);
	withMongoDB(function(db){
		db.collection('LinkData', function(err, collection) {
			var tagArray = tags ? tags.split(',') : tags;
			if(tagArray){
				tagArray.forEach(function(e,i,a){			
					a[i]=e.trim();
				});
			}
			var newDoc = {'createDate':new Date(), 'modifiedDate':undefined ,'realLink':realLink, 'tags':tagArray, 'betterLink':betterLink, 'hitCount':0};
			collection.insert(newDoc, {safe:true}, function(err, result) {
				if(err){
					common.winston.error("Failed inserting document " + newDoc + " to MongoDB with error- " + err);
				}
			});		
		});
	});
}

function _redirectToRealLink(inBetterLink, agent, callback){
	withMongoDB(function(db){
		db.collection('LinkData', function(err, collection) {
			var findDoc={ 'betterLink': inBetterLink.slice(1)};
			common.winston.debug("Finding document: " + common.util.inspect(findDoc, true, null));
			collection.findAndModify(findDoc, {}, {$inc : { 'hitCount': 1 }, $set:{'modifiedDate':new Date()}}, {'fields':{'realLink':1, '_id':1}}, function(err, item) {
				if(err){
					common.winston.error("Failed finding document " + findDoc + " on MongoDB with error- " + err);
					callback(err, undefined);
				}else{
					if(item){
						callback(undefined, item.realLink.indexOf("http")===0 ? item.realLink : "http://"+item.realLink);					
						updateAccessUserAgent(item._id, agent);
					}else{
						callback(undefined, undefined);
					}
				}			
			});
		});	
	});
}

function updateAccessUserAgent(id, agent){
	var familyMajor=agent.family+'_v'+agent.major;
	withMongoDB(function(db){
		db.collection('UserAgent', function(err, uacollection) {
			var ua = {};		
			ua['browser.'+agent.family] = 1;
			ua['os.'+agent.os.family] = 1;
			ua['browserMajor.'+familyMajor] = 1;
			uacollection.findAndModify({'_id':id}, {}, {$inc : ua}, {'upsert':true}, function(err, item){
				if(err){
					common.winston.error("Failed updating UserAgent for accessing " + id + " on MongoDB with error- " + err);
				}
			});
		});
	});
}

function _suggestTags(query, callback){
	withMongoDB(function(db){
		db.collection('tagCollection', function(err, tcollection){
			var regEx = query + ".*"; 
			tcollection.find({'_id': {$regex: regEx, $options: 'i'}}, {'sort': [['value','desc']], 'limit': 5}, function(err, items){
				if(err){
					common.winston.error("Failed retreiving tags sorted for " + query + " on MongoDB with error- " + err);
					callback(err, undefined);
				}else{
					var top5Suggestions = [];												
					items.toArray(function(err, docs) {
						docs.forEach(function(e){
							top5Suggestions.push(e._id);
						});
						var respJson={
							'query': query,
							'suggestions':top5Suggestions
						};
						callback(undefined, respJson);
					});
				}			
			});
		});
	});
}

function _top5Trending(callback){
	withMongoDB(function(db){
		db.collection('LinkData', function(err, collection) {
			var trendDuration = new Date();
			trendDuration.setDate(trendDuration.getDate()-2);//Cover every thing in last two days to get the trending links
			collection.find({"modifiedDate": {$gte : trendDuration}}, {'fields': {'betterLink':1, 'hitCount':1, '_id':0} ,'sort' : [['hitCount', 'desc']], 'limit': 5, 'timeout': true}, function(err, data){
				if(err){
					common.winston.error("Failed retreiving top 5 links with max hits on MongoDB with error- " + err);
				}			
				var betterLinkArray=[];
				var errors=[];
				data.each(function(err, data){				
					if(err){
						errors.push(err);
					}else if(data === null){
						callback(errors, betterLinkArray);
					}else{
						betterLinkArray.push(data);
					}
				});
			});
		});
	});
}

function _topTags(callback){
	withMongoDB(function(db){
		db.collection('tagCollection', function(err, collection) {
			collection.find({},{'sort':[['value','desc']], 'limit': 40}, function(err, data){
				if(err){
					common.winston.error("Failed retreiving top tags on MongoDB with error- " + err);
					callback(undefined, err);
				}
				data.toArray(function(err, items){
					if(err){
						common.winston.error("Failed retreiving top tags on MongoDB while converting cursor to array with error- " + err);
					}
					callback(items, err);
				});			
			});
		});
	});
}

function _uaSummary(type, callback){
	withMongoDB(function(db){
		db.collection('UserAgentSummary', function(err, collection) {
			collection.findOne({'_id':type}, function(err, data){
				if(err){
					common.winston.error("Failed retreiving UserAgentSummary of browser on MongoDB with error- " + err);
					callback(undefined, err);
				}else{				
					callback(data, err);
				}
			});
		});
	});
}

exports.saveNewLink=_saveNewLink;
exports.redirectToRealLink=_redirectToRealLink;
exports.suggestTags=_suggestTags;
exports.initDBJobs=initDBJobs;
exports.top5Trending=_top5Trending;
exports.topTags=_topTags;
exports.uaSummary=_uaSummary;
