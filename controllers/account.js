var express = require('express');
var router = express.Router();


/**
 *display a login form
 */
router.get('/signin', function(req, res){
	res.render("account_signin", {title: " signin"});
});

/**
 *log the user
 */
router.post('/signin', function(req, res){
	
	res.redirect("/account");
});

/**
 *user home
 */
router.get('', function(req, res){
	res.render("account", {title: ""});
});

/**
 *user form to change saved location
 */
router.get('/location', function(req, res){
	res.render("account_location", {title: " location"});
});

/**
 *update user location
 */
router.post('/location', function(req, res){
	
	res.redirect("/account");
});

/**
 *display a list of bars user has gone to in the past
 */
router.get('/bars', function(req, res){
	res.render("account_bars", {title: " bars"});
});

/**
 *sign the user out
 */
router.get('/signout', function(req, res){
	
	res.redirect("/bars");
});

/**
 *form to sign up
 */
router.get('/register', function(req, res){
	res.render("account_register", {title: " register"});
});

/**
 *create a user account and sign in
 */
router.post('/register', function(req, res){
	
	res.redirect("/bars");
});

module.exports = router;