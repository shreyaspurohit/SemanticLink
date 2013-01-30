/*global require console exports process emit*/

var common=require("./common");
var jobs=require("./jobs");

// Retrieve
var withMongoDB = require('./connection').withMongoDB

// Map function for Tag
var tagMap = function() {			
		if(this.tags){
			this.tags.forEach(function (t) {
			   emit(t, 1);
			});
		}
};
// Reduce function for Tag
var tagReduce = function(k,vals) { 
	var cnt = 0;
	vals.forEach(function(v){
		cnt += v;
	});
	return cnt; 
};

// Map function for User Agent
var uaMap = function() {			
		if(this.browser){
			emit('browser', this.browser);
		}
		if(this.browserMajor){
			emit('browserMajor', this.browserMajor);
		}
		if(this.os){
			emit('os', this.os);
			emit('osCategory', this.os);
		}
};

// Reduce function for User Agent
var uaReduce = function (key, valueObjects) {
    var reducedValue = {};
    var mapOfOS = {
		'Linux':'Linux',
		'Ubuntu':'Linux',
		'Linux Mint':'Linux',
		'Windows':'Windows',
		'Windows 7':'Windows'
	};
	function handleAllIndividual(t, value){
		if (!reducedValue[t]) reducedValue[t] = 0;
        reducedValue[t] += value;
	}
	function handleOsCategory(t, value){
		if(!mapOfOS.hasOwnProperty(t))mapOfOS[t]=t;
		if (!reducedValue[mapOfOS[t]]) reducedValue[mapOfOS[t]] = 0;
        reducedValue[mapOfOS[t]] += value;
	}
    for (var idx = 0; idx < valueObjects.length; idx++) {
        var typeObj = valueObjects[idx];
        for (var t in typeObj) {
			if(key === 'osCategory'){
				handleOsCategory(t, typeObj[t]);
			}else{
				handleAllIndividual(t, typeObj[t]);
			}
        }
    }
    return reducedValue;
};

function doMapReduceOnTags(){
	common.winston.debug("Running mapreduce on tags at " + new Date().toJSON());
	withMongoDB(function(db){
      db.collection('LinkData', function(err, collection) {
      // Peform the map reduce
		  collection.mapReduce(tagMap, tagReduce, {out: 'tagCollection'}, function(err, collection) {
			if(err){
				common.winston.error("Failed map/reducing for tags on MongoDB with error- " + err);			
			}
		  });
	  });
	});
}

function doMapReduceOnUserAgentSummary(){
	common.winston.debug("Running mapreduce on UserAgent at " + new Date().toJSON());
	withMongoDB(function(db){
		db.collection('UserAgent', function(err, collection) {
		  // Peform the map reduce
		  collection.mapReduce(uaMap, uaReduce, {out: 'UserAgentSummary'}, function(err, collection) {
			if(err){
				common.winston.error("Failed map/reducing for UserAgent on MongoDB with error- " + err);			
			}
		  });
		});
	});
}

function runDBJobOnceOnModuleLoad(){
	//doMapReduceOnUserAgentSummary();
}

runDBJobOnceOnModuleLoad();

function startDBJobs(){
  var cronTime="0 */2 * * * *";
  common.winston.info("Submitted job for Map reduce for tag statistics to run " + cronTime + " ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek']");
  jobs.submit(cronTime, doMapReduceOnTags).start();	
  jobs.submit("0 */30 * * * *", doMapReduceOnUserAgentSummary).start();	
}

process.on('message', function(msg, callback) {
      if(msg.fName){
        common.winston.info('Worker '+ process.pid +': processing ' + common.util.inspect(msg));
        if(msg.fName === 'startDBJobs'){
	    startDBJobs();
        }
      }
});
