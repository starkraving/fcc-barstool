var express = require('express');
var router = express.Router();


/**
 *show a form to specify a location
 */
router.get('/', function(req, res){
	console.log(req.session);
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
	res.render("bars_location", {title: "Bars in "+req.params.location, sess: req.session});
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
	res.render("bars_latlong_lat_long", {title: " latlong :lat :long", sess: req.session});
});

module.exports = router;