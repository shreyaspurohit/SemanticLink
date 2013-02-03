/*global require console exports process*/
var common=require("./common");
var argv = require('optimist').argv;
var MongoClient = require('mongodb').MongoClient;

var host= argv.MONGO_DB_HOST ? argv.MONGO_DB_HOST : "localhost";
var port= argv.MONGO_DB_PORT ? argv.MONGO_DB_PORT : "27017";
var dbName= argv.MONGO_DB_NAME ? argv.MONGO_DB_NAME : "exampleDB";
var maxPoolSize= argv.MAX_DB_POOL_SIZE ? argv.MAX_DB_POOL_SIZE : 5;

var dbServer=function(){
	return common.util.format(common.constants.mongodbUrl, host, port, dbName, maxPoolSize);
}
var db;

function connect(onConnect){
	// Connect to the db
	MongoClient.connect(dbServer(), function(err, dbObj) {
	  if(!err) {
		common.winston.info("Connected to MongoDB at " + dbServer());
		db=dbObj;
		onConnect(undefined, db);
	  }else{
		common.winston.error("Failed connecting to MongoDB at " + dbServer + ", with error- " + err);		
		onConnect(err);
	  }
	});
}


function withMongoDB(handler){
	if(db){
		handler(db);
	}else{
		connect(function(err, db){
			if(err)throw 'ErrorConnectingToMongo';
			handler(db);
		});
	}
}

function getConnectionParameters(){
	return {
		'host': host,
		'port': port,
		'dbName': dbName,
		'maxPoolSize': maxPoolSize
	};
}

function setConnectionParameters(config){
	host = config.host;
	port = config.port;
	dbName = config.dbName;
	if(config.maxPoolSize){
		maxPoolSize = config.maxPoolSize;
	}
}

exports.withMongoDB = withMongoDB;
exports.getConnectionParameters=getConnectionParameters;
exports.setConnectionParameters=setConnectionParameters;
