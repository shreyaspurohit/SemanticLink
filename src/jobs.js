/*global require console exports process emit*/

var cronJob = require('cron').CronJob;

function submit(crontime, jobFunc, options){
	var job = new cronJob({
	  cronTime: crontime,
	  onTick: jobFunc,
	  start: options && options.start ? options.start : false,
	  timeZone: options && options.tz ? options.tz : "US/Central"
	});
	if(undefined !== options &&
	      true === options.start){
		job.start();
	}
	return job;
}

exports.submit=submit;