var express = require('express');
var router = express.Router();
var yelp = require('node-yelp');
var path = require('path');

/**
 *show a form to specify a location
 */
router.get('/', function(req, res){
	res.render("bars_", {title: "Bars", sess: req.session});
});

/**
 *save the location to session
 */
router.post('', function(req, res){
	req.session.location = req.body.location;
	res.redirect("/bars/"+encodeURIComponent(req.body.location));
});

/**
 *display matching bars for this location
 */
router.get('/:location', function(req, res){
	var client = yelp.createClient({
		oauth: {
			consumer_key: process.env.YELP_CONSUMER_KEY,
			consumer_secret: process.env.YELP_CONSUMER_SECRET,
			token: process.env.YELP_TOKEN,
			token_secret: process.env.YELP_TOKEN_SECRET
		}
	});
	client.search({ term: 'bar', location: req.params.location })
		.then(function(data){
			if ( typeof req.query.json == 'undefined' ) {
				res.render("bars_location", {title: "Bars in "+req.params.location, sess: req.session});
			} else {
				res.contentType('text/JSON');
				res.end(JSON.stringify(data));
			}
		})
		.catch(function (err) {
			res.contentType('text/JSON');
			res.sendFile(path.resolve(__dirname+'/../views/bars.json'));
		})
});

/**
 *display details of bar in iframe
 */
router.get('/:location/:bar', function(req, res){
	res.render("bars_location_bar", {title: " :location :bar", sess: req.session});
});

/**
 *register or de-register a bar for today's date
 */
router.post('/:location/:bar/register', function(req, res){
	
	res.redirect("/bars/:location");
});

/**
 *return Yelp API results of lat/long coordinates as JSON
 */
router.get('/latlong/:lat/:long', function(req, res){
	var client = yelp.createClient({
		oauth: {
			consumer_key: process.env.YELP_CONSUMER_KEY,
			consumer_secret: process.env.YELP_CONSUMER_SECRET,
			token: process.env.YELP_TOKEN,
			token_secret: process.env.YELP_TOKEN_SECRET
		}
	});
	var latlong = [req.params.lat, req.params.long].join(',');
	client.search({ term: 'bar', ll: latlong })
		.then(function(data){
			if ( typeof req.query.json == 'undefined' ) {
				res.render("bars_latlong_lat_long", {title: " latlong :lat :long", sess: req.session});
			} else {
				res.contentType('text/JSON');
				res.end(JSON.stringify(data));
			}
		})
		.catch(function (err) {
			res.contentType('text/JSON');
			res.sendFile(path.resolve(__dirname+'/../views/bars.json'));
		})
});

module.exports = router;