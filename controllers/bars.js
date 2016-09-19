var express    = require('express');
var router     = express.Router();
var MemberBar  = require('../models/mw.memberbar.js');
var Yelp       = require('../models/mw.yelp.js');

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
router.get('/:location', Yelp.search, MemberBar.going, function(req, res){
	var datetime = new Date().getTime();
	if ( !req.session.username ) {
		req.session.username = req.params.location+'_'+datetime;
	}
	var data = res.yelpResults;
	data.going = res.going;
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

/**
 *display details of bar in iframe
 */
router.get('/:location/:bar', Yelp.business, MemberBar.goingByBar, function(req, res){
	var datetime = new Date().getTime();
	var data = res.yelpBusiness;
	data.going = res.going;
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

/**
 *register or de-register a bar for today's date
 */
router.post('/:location/:bar/register', MemberBar.goingByBar, function(req, res){
	var datetime = new Date().getTime();
	var handleResponse = function(action, going, location) {
		if ( typeof req.query.json != 'undefined' ) {
				res.contentType('text/JSON');
				res.end(JSON.stringify({success: true, action: action, going: going, datetime: datetime}));
		} else {
			if ( location.match(/^[1234567890.,-]+$/) ) {
				latlong = location.split(',');
				redirectURL = '/bars/latlong/'+latlong[0]+'/'+latlong[1];
			} else {
				redirectURL = '/bars/'+escape(location);
			}
			res.redirect(redirectURL);
		}
	};
	if ( res.going ) {
		res.going.remove(function(err, doc, rowsaffected){
			handleResponse('delete', false, req.params.location);
		});
	} else {
		MemberBar.saveBar({
				username : req.session.username,
				barId    : req.params.bar,
				goingTS  : datetime
			},
			function(){
				handleResponse('insert', true, req.params.location);
			}
		);
	}
});

/**
 *return Yelp API results of lat/long coordinates as JSON
 */
router.get('/latlong/:lat/:long', Yelp.latlong, MemberBar.goingByBar, function(req, res){
	var datetime = new Date().getTime();
	var data = res.yelpResults;
	data.going = res.going;
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

module.exports = router;