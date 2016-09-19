var express    = require('express');
var Member     = require('./member.js');
var yelp       = require('node-yelp');
var fs         = require('fs');
var path       = require('path');


module.exports = (function(){
	var client;
	var initYelp = function(){
		client = yelp.createClient({
			oauth: {
				consumer_key: process.env.YELP_CONSUMER_KEY,
				consumer_secret: process.env.YELP_CONSUMER_SECRET,
				token: process.env.YELP_TOKEN,
				token_secret: process.env.YELP_TOKEN_SECRET
			}
		});
	};
	return {
		search: function(req, res, next) {
			initYelp();
			client.search({ term: 'bar', location: req.params.location })
				.then(function(data){
					res.yelpResults = data;
					next();
				})
				.catch(function (err) {
					res.yelpResults = JSON.parse(fs.readFileSync(path.resolve(__dirname+'/../views/bars.json')));
					next();
				});
		},
		latlong: function(req, res, next) {
			initYelp();
			client.search({ term: 'bar', ll: [req.params.lat, req.params.long].join(',') })
				.then(function(data){
					res.yelpResults = data;
					next();
				})
				.catch(function (err) {
					res.yelpResults = JSON.parse(fs.readFileSync(path.resolve(__dirname+'/../views/bars.json')));
					next();
				});
		},
		business: function(req, res, next) {
			initYelp();
			client.business(req.params.bar)
				.then(function(data){
					res.yelpBusiness = data;
					next();
				})
				.catch(function(err){
					res.yelpBusiness = JSON.parse(fs.readFileSync(path.resolve(__dirname+'/../views/bar.json')));
					next();
				});
		}
	};
})();