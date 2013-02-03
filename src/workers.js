/*global require console exports process emit*/
var backgrounder = require("backgrounder");
var common=require('./common');
var aliveWorker = {};

function submitRunOnce(workerPath, config, msg, callback){
 var worker = backgrounder.spawn(workerPath, {
	"children-count" : 1,
	"config" : config
 });
 worker.send(msg, function(){
  if(undefined !== callback){
   callback(arguments)
  }
 });
 worker.on('idle', function(msg) {
   if(!worker.terminated){    
    worker.terminate();
    common.winston.info("Terminated worker["+ worker.children[0].process.pid + "]: " + worker.terminated);
   }
 });

}

function submitRunAlways(workerPath, config, msg, callback){
 if(undefined === aliveWorker[workerPath]){
   aliveWorker[workerPath] = backgrounder.spawn(workerPath, {
  	"children-count" : 1,
  	"config" : config
   });
 }
 aliveWorker[workerPath].send(msg, function(){
  if(undefined !== callback){
   callback(arguments)
  }
 }); 
}

function terminateAliveWorker(){
 for(var w in aliveWorker){
	aliveWorker[w].terminate(); 
 }
}

exports.submitRunOnce=submitRunOnce;
exports.submitRunAlways=submitRunAlways;
exports.terminateAliveWorker=terminateAliveWorker;

