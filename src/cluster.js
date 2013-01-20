/*global require console exports*/

var common = require('./common');
var cluster = require('cluster');
var workers = [];

if (cluster.isMaster) {
    cluster.setupMaster({
	args : ["-isRunningAsCluster"]
    });

    //start up workers for each cpu
    require('os').cpus().forEach(function() {
        workers.push(cluster.fork());
    });

	//Handle things when a worker dies
	cluster.on('exit', function(worker, code, signal) {
        common.winston.info('Worker ' + worker.process.pid + ' died with signal '+ signal+', re-spawning.');
        var batchProcessExit = false;
        for(var i=0; i < workers.length; i+=1){
            if(worker.process.pid === workers[i].process.pid) workers.splice(i);
            if(i === 0)batchProcessExit = true;
		}		
        workers.push(cluster.fork());        
        if(batchProcessExit)workers[0].send(common.constants.ipcBatchJobStart);
    });
    
    //Log when the workers are online
    cluster.on('listening', function(worker, address) {
		common.winston.info("A worker "+ worker.process.pid +" is now connected to " + address.address + ":" + address.port);
	});

	//Start background jobs on the first available worker only, probably jobs that you dont want to run on every worker process
	workers[0].send(common.constants.ipcBatchJobStart);
} else {
	//The worker code
    //load up our application as a worker
    var app = require('./index.js');
    common.winston.info("Worker " + cluster.worker.process.pid + " Online.");
    
	//Handle messages from the master
	cluster.worker.on('message',function(msg){
		common.winston.info(cluster.worker.process.pid + " : " + msg);
		if(msg === common.constants.ipcBatchJobStart){
			app.rq.initDBJobs();
		}
	});
}
