//Database Parameters
var host="localhost",
	port="27017",
	dbName="SemanticLink";
var connectUrl=host + ":" + port + "/" + dbName;
var db=connect(connectUrl);

//Create Collections
db.createCollection("LinkData");
db.createCollection("UserAgent");
db.createCollection("UserAgentSummary");
db.createCollection("tagCollection");

//Add indexes
db.LinkData.ensureIndex({"betterLink" : 1});
db.LinkData.ensureIndex({"modifiedDate" : 1});
