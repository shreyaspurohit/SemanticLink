module.exports = {
	msg404: "Oops you sneaky lil *******. Now you know this link does not exist.",
	htmlContent: {"Content-Type":"text/html"},
	textContent: {"Content-Type":"text/plain"},
	jsonContent: {"Content-Type":"application/json"},
	ejs404: "common/404.ejs",
	headMarker: "{{headContents}}",
	bodyMarker: "{{bodyContents}}",
	ejsLayout: "common/layout.ejs",
	ejsIndex: "index.ejs",
	logFile: "../app.log",
	mongodbUrl: "mongodb://%s:%s/%s?w=1&auto_reconnect=true",
	ipcBatchJobStart: "BATCH_JOB_START",
	viewBase: "/views",
	resourceBase: "../resources",
	resourcePathPattern: "/resources"
};
