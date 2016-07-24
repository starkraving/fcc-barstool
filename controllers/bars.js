var express = require('express');
var router = express.Router();


/**
 *show a form to specify a location
 */
router.get('/', function(req, res){
	res.render("bars_", {title: " "});
});

/**
 *save the location to session
 */
router.post('', function(req, res){
	
	res.redirect("/bars/:location");
});

/**
 *display matching bars for this location
 */
router.get('/:location', function(req, res){
	res.render("bars_location", {title: " :location"});
});

/**
 *display details of bar in iframe
 */
router.get('/:location/:bar', function(req, res){
	res.render("bars_location_bar", {title: " :location :bar"});
});

/**
 *register or de-register a bar for today's date
 */
router.post('/:location/:bar/register', function(req, res){
	
	res.redirect("/bars/:location");
});

module.exports = router;