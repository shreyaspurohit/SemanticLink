/*global require console exports process emit*/

var common=require("./common");
var functions=require("./functions");
var jobs=require("./jobs");
var workers = require("./workers");

// Retrieve
var MongoClient = require('mongodb').MongoClient;
var host= process.argv["MONGO_DB_HOST"] ? process.argv["MONGO_DB_HOST"] : "localhost";
var port= process.argv["MONGO_DB_PORT"] ? process.argv["MONGO_DB_PORT"] : "27017";
var dbName= process.argv["MONGO_DB_NAME"] ? process.argv["MONGO_DB_NAME"] : "exampleDB";

var dbServer=common.util.format(common.constants.mongodbUrl, host, port, dbName);
var db;
// Connect to the db
MongoClient.connect(dbServer, function(err, dbObj) {
  if(!err) {
    common.winston.info("Connected to MongoDB at " + dbServer);
    db=dbObj;
  }else{
    common.winston.error("Failed connecting to MongoDB at " + dbServer + ", with error- " + err);
  }
});

// Map function
var tagMap = function() {			
		if(this.tags){
			this.tags.forEach(function (t) {
			   emit(t, 1);
			});
		}
};
// Reduce function
var tagReduce = function(k,vals) { 
	var cnt = 0;
	vals.forEach(function(v){
		cnt += v;
	});
	return cnt; 
};

function doMapReduceOnTags(){
	common.winston.debug("Running mapreduce on tags at " + new Date().toJSON());
	db.collection('LinkData', function(err, collection) {
      // Peform the map reduce
      collection.mapReduce(tagMap, tagReduce, {out: 'tagCollection'}, function(err, collection) {
		if(err){
			common.winston.error("Failed map/reducing for tags on MongoDB with error- " + err);			
		}
	  });
	});
}

function startDBJobs(){
  var cronTime="0 */2 * * * *";
  common.winston.info("Submitted job for Map reduce for tag statistics to run " + cronTime + " ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek']");
  jobs.submit(cronTime, doMapReduceOnTags).start();	
}

function initDBJobs(){
  workers.submitRunAlways(__dirname + "/dataLayer.js", {'fName':'startDBJobs'});
}

process.on('message', function(msg, callback) {
      if(msg.fName){
        common.winston.info('Worker '+ process.pid +': processing ' + common.util.inspect(msg));
        if(msg.fName === 'startDBJobs'){
	    startDBJobs();
        }
      }
});

function _saveNewLink(realLink, tags, betterLink){
	common.winston.info("Saving Real link: " + realLink + "; Tags: " + tags + "; Better Link: " + betterLink);
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
}

function _redirectToRealLink(response, inBetterLink){
	db.collection('LinkData', function(err, collection) {
		var findDoc={ 'betterLink': inBetterLink.slice(1)};
		common.winston.debug("Finding document: " + common.util.inspect(findDoc, true, null));
		collection.findAndModify(findDoc, {}, {$inc : { 'hitCount': 1 }, $set:{'modifiedDate':new Date()}}, {'fields':{'realLink':1}}, function(err, item) {
			if(err){
				common.winston.error("Failed finding document " + findDoc + " on MongoDB with error- " + err);
			}else{
				if(item){
					functions.sendRedirect(response, item.realLink.indexOf("http")===0 ? item.realLink : "http://"+item.realLink);
				}else{
					functions.send404(response, inBetterLink);
				}
			}			
		});
	});
}

function _suggestTags(response, query){
	db.collection('tagCollection', function(err, tcollection){
		var regEx = query + ".*"; 
		tcollection.find({'_id': {$regex: regEx, $options: 'i'}}, {'sort': [['value','desc']], 'limit': 5}, function(err, items){
			if(err){
				common.winston.error("Failed retreiving tags sorted for " + query + " on MongoDB with error- " + err);
				response.end();
			}else{
				var top5Suggestions = [];												
				items.toArray(function(err, docs) {
					docs.forEach(function(e){
						top5Suggestions.push(e._id);
					});
					response.writeHead(200, common.constants.textContent);
					var respJson={
						'query': query,
						'suggestions':top5Suggestions
					};
					response.write(JSON.stringify(respJson));
					response.end();
				});						
				
			}			
		});
	});
}

function _top5Trending(callback){
	db.collection('LinkData', function(err, collection) {
		var trendDuration = new Date();
		trendDuration.setDate(Date.now()-2);//Cover every thing in last two days to get the trending links
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
}

function _topTags(callback){
	db.collection('tagCollection', function(err, collection) {
		collection.find({},{'sort':[['value','desc']], 'limit': 50}, function(err, data){
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
}

exports.saveNewLink=_saveNewLink;
exports.redirectToRealLink=_redirectToRealLink;
exports.suggestTags=_suggestTags;
exports.initDBJobs=initDBJobs;
exports.top5Trending=_top5Trending;
exports.topTags=_topTags;
