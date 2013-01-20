/*global require console exports process emit*/
var backgrounder = require("backgrounder");
var common=require('./common');
var aliveWorker = undefined;

function submitRunOnce(workerPath, msg, callback){
 var worker = backgrounder.spawn(workerPath, {
	"children-count" : 1
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

function submitRunAlways(workerPath, msg, callback){
 if(undefined === aliveWorker){
   aliveWorker = backgrounder.spawn(workerPath, {
  	"children-count" : 1
   });
 }
 aliveWorker.send(msg, function(){
  if(undefined !== callback){
   callback(arguments)
  }
 }); 
}

function terminateAliveWorker(){
 if(undefined !== aliveWorker){
  aliveWorker.terminate();
 }
}

exports.submitRunOnce=submitRunOnce;
exports.submitRunAlways=submitRunAlways;
exports.terminateAliveWorker=terminateAliveWorker;

