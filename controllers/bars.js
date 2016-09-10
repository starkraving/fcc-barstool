var express = require('express');
var router = express.Router();
var yelp = require('node-yelp');
var fs = require('fs');
var path = require('path');
var MemberBar   = require('../models/memberbar.js');

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
	var datetime = new Date().getTime();
	if ( !req.session.username ) {
		req.session.username = req.params.location+'_'+datetime;
	}
	var client = yelp.createClient({
		oauth: {
			consumer_key: process.env.YELP_CONSUMER_KEY,
			consumer_secret: process.env.YELP_CONSUMER_SECRET,
			token: process.env.YELP_TOKEN,
			token_secret: process.env.YELP_TOKEN_SECRET
		}
	});
	var handleData = function(data){
		MemberBar.find({ username : req.session.username })
			.where('goingTS').gte(datetime - (18*60*60*1000))
			.select('barId')
			.exec(function(err, result){
				data.going = result;
				if ( typeof req.query.json == 'undefined' ) {
					res.render("bars_location", {
						title: "Bars in "+req.params.location, 
						sess: req.session,
						location: req.params.location,
						data: data,
						showGoing: function(arGoing, strBarID){
							if ( arGoing.length === 0 ) return 'Not going';
							var going = arGoing.filter(function(bar){
								return ( bar.barId == strBarID );
							});
							return ( going.length === 0 ) ? 'Not going' : 'Going';
						}
					});
				} else {
					res.contentType('text/JSON');
					res.end(JSON.stringify(data));
				}
			});
	};
	client.search({ term: 'bar', location: req.params.location })
		.then(function(data){
			handleData(data);
		})
		.catch(function (err) {
			var data = JSON.parse(fs.readFileSync(path.resolve(__dirname+'/../views/bars.json')));
			handleData(data);
		})
});

/**
 *display details of bar in iframe
 */
router.get('/:location/:bar', function(req, res){
	console.log({location: req.params.location, bar: req.params.bar});
	var datetime = new Date().getTime();
	if ( !req.session.username ) {
		req.session.username = req.params.location+'_'+datetime;
	}
	var handleContent = function(data){
		MemberBar.findOne({
			username : req.session.username, 
			barId    : req.params.bar})
		.where('goingTS').gte(datetime - (18*60*60*1000))
		.exec(function(err, result){
			if ( !err ) {
				data.going = result;
			}
			if ( typeof req.query.json != 'undefined' ) {
				res.contentType('text/JSON');
				res.end(JSON.stringify(data));
			} else {
				res.render('bars_location_bar', {
					data: data, 
					title: data.name,
					location: req.params.location,
					bar: req.params.bar, 
					sess: req.session,
					backURI: ( req.params.location.split(',').length > 1 && req.params.location.match(/^[1234567890.,-]+$/) )
									? 'latlong/'+req.params.location.split(',').join('/') 
									: escape(req.params.location)
				});
			}
		});
	};
	var client = yelp.createClient({
		oauth: {
			consumer_key: process.env.YELP_CONSUMER_KEY,
			consumer_secret: process.env.YELP_CONSUMER_SECRET,
			token: process.env.YELP_TOKEN,
			token_secret: process.env.YELP_TOKEN_SECRET
		}
	});
	client.business(req.params.bar)
		.then(function(data){
			handleContent(data)
		})
		.catch(function(err){
			var data = JSON.parse(fs.readFileSync(path.resolve(__dirname+'/../views/bar.json')));
			handleContent(data);
		});
});

/**
 *register or de-register a bar for today's date
 */
router.post('/:location/:bar/register', function(req, res){
	var datetime = new Date().getTime();
	if ( !req.session.username ) {
		req.session.username = req.params.location+'_'+datetime;
	}
	var handleRedirect = function(location) {
		if ( location.match(/^[1234567890.,-]+$/) ) {
			latlong = location.split(',');
			redirectURL = '/bars/latlong/'+latlong[0]+'/'+latlong[1];
		} else {
			redirectURL = '/bars/'+escape(location);
		}
		res.redirect(redirectURL);
	};
	MemberBar.findOne({
			username : req.session.username, 
			barId    : req.params.bar})
		.where('goingTS').gte(datetime - (18*60*60*1000))
		.exec(function(err, result){
			if ( result ) {
				result.remove(function(err, doc, rowsaffected){
					if ( typeof req.query.json != 'undefined' ) {
						res.contentType('text/JSON');
						res.end(JSON.stringify({success: true, action: 'delete', rowsaffected: rowsaffected, going: false, datetime: datetime}));
					} else {
						handleRedirect(req.params.location);
					}
				});
			} else {
				var going = new MemberBar({
					username : req.session.username,
					barId    : req.params.bar,
					goingTS  : datetime
				}).save(function(err, doc, rowsaffected){
					if ( typeof req.query.json != 'undefined' ) {
						res.contentType('text/JSON');
						res.end(JSON.stringify({success: true, action: 'insert', rowsaffected: rowsaffected, going: true, datetime: datetime}));
					} else {
						handleRedirect(req.params.location);
					}
				});
			}
		});
});

/**
 *return Yelp API results of lat/long coordinates as JSON
 */
router.get('/latlong/:lat/:long', function(req, res){
	var datetime = new Date().getTime();
	var latlong = [req.params.lat, req.params.long].join(',');
	if ( !req.session.username ) {
		req.session.username = latlong.replace(',', '_')+'_'+datetime;
	}
	var client = yelp.createClient({
		oauth: {
			consumer_key: process.env.YELP_CONSUMER_KEY,
			consumer_secret: process.env.YELP_CONSUMER_SECRET,
			token: process.env.YELP_TOKEN,
			token_secret: process.env.YELP_TOKEN_SECRET
		}
	});
	var handleData = function(data){
		MemberBar.find({ username : req.session.username })
			.where('goingTS').gte(datetime - (18*60*60*1000))
			.select('barId')
			.exec(function(err, result){
				data.going = result;
				if ( typeof req.query.json == 'undefined' ) {
					res.render("bars_latlong_lat_long", {
						title: "Bars in "+req.params.location, 
						sess: req.session,
						lat: req.params.lat,
						long: req.params.long,
						data: data,
						showGoing: function(arGoing, strBarID){
							if ( arGoing.length === 0 ) return 'Not going';
							var going = arGoing.filter(function(bar){
								return ( bar.barId == strBarID );
							});
							return ( going.length === 0 ) ? 'Not going' : 'Going';
						}
					});
				} else {
					res.contentType('text/JSON');
					res.end(JSON.stringify(data));
				}
			});
	};	
	client.search({ term: 'bar', ll: latlong })
		.then(function(data){
			handleData(data);
		})
		.catch(function (err) {
			var data = JSON.parse(fs.readFileSync(path.resolve(__dirname+'/../views/bars.json')));
			handleData(data);
		});
});

module.exports = router;