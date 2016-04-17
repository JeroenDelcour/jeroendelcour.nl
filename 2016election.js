var fs = require("fs");
var sqlite3 = require("sqlite3");
var json2csv = require('json2csv');

var dbfile = "./2016election/data_downsampled.sqlite";

module.exports = {

	getData: function(candidate, callback) {

		var db = new sqlite3.Database(dbfile);

		db.all("SELECT * FROM "+candidate+";", function(error, rows) {
			if (error) {
				callback(error, rows);
			} else {
				var fields = ['datetime', 'sentiment', 'tweet_count'];
				json2csv({ data: rows, fields: fields }, function(err, csv) {
					if (err) console.log(err);
					callback(null, csv);
				});
			}
			db.close();
		});
	},

}