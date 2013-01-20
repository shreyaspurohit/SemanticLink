var winston = require('winston');
winston.add(winston.transports.File, { filename: '../app.log' });

var options = {
    from: new Date - 24 * 60 * 60 * 1000,
    until: new Date
  };

//
// Find items logged between today and yesterday.
//
winston.query(options, function (err, results) {
	if (err) {
		throw err;
	}

	console.log(results);
});
