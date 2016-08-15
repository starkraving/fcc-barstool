var express  = require('express');
var router   = express.Router();
var crypto   = require('crypto');
var Member   = require('../models/member.js');

/**
 *display a login form
 */
router.get('/signin', function(req, res){
	res.render("account_signin", {title: "Member Signin", sess: req.session});
});

/**
 *log the user
 */
router.post('/signin', function(req, res){
	Member.findOne({'username': req.body.username}).exec(function(err, result){
		if ( err || !result ) { res.redirect('/account/signin'); }
		else {
			var hash = crypto.createHmac('sha512', result.pwsalt);
			hash.update(req.body.password);
			if ( result.pwhash == hash.digest('hex') ) {
				req.session.username   = result.username;
				req.session.firstname  = result.firstname;
				req.session.lastname   = result.lastname;
				req.session.location   = result.location;
				res.redirect("/bars");
			} else {
				res.redirect("/account/signin");
			}
		}
	});
});

/**
 *user home
 */
router.get('', function(req, res){
	if ( !req.session.username ) {
		res.redirect('/account/signin');
	} else {
		res.render("account", {title: "Member Home", sess: req.session});
	}
});

/**
 *user form to change saved location
 */
router.get('/location', function(req, res){
	if ( !req.session.username ) {
		res.redirect('/account/signin');
	} else {
		Member.findOne({'username': req.session.username}).exec(function(err, result){
			var location = ( result.location ) 
					? result.location 
					: ( ( req.session.location ) 
								? req.session.location 
								: '' );
			res.render("account_location", {
				title    : "Change Member Location", 
				sess     : req.session,
				location : location
			});
		});
	}
});

/**
 *update user location
 */
router.post('/location', function(req, res){
	if ( !req.session.username ) {
		res.redirect('/account/signin');
	} else {
		Member.findOne({'username': req.session.username}).exec(function(err, member){
			member.location = req.body.location;
			req.session.location = req.body.location;
			member.save(function(err, doc, rowsaffected){
				res.redirect("/account");
			});
		});
	}
});

/**
 *display a list of bars user has gone to in the past
 */
router.get('/bars', function(req, res){
	res.render("account_bars", {title: "My Bars", sess: req.session});
});

/**
 *sign the user out
 */
router.get('/signout', function(req, res){
	delete req.session.username;
	delete req.session.firstname;
	delete req.session.lastname;
	delete req.session.location;
	res.redirect("/bars");
});

/**
 *form to sign up
 */
router.get('/register', function(req, res){
	res.render("account_register", {
		title     : "Member Registration",
		sess      : req.session,
		errors    : [],
		username  : "",
		password  : "",
		firstname : "",
		lastname  : "",
		location  : ""
	});
});

/**
 *create a user account and sign in
 */
router.post('/register', function(req, res){
	var errors     = [],
		password   = req.body.password,
		confirm    = req.body.confirm,
		memberInfo = {
			username  : req.body.username,
			firstname : req.body.firstname,
			lastname  : req.body.lastname,
			location  : req.body.location,
			pwsalt    : new Date().getTime().toString(36)
		};

	if ( memberInfo.username.length === 0 ) { errors.push('Username is required'); }
	if ( password.length === 0 ) { errors.push('Password is required'); }
	if ( confirm.length === 0 ) { errors.push('Confirm Password is required'); }
	if ( password != confirm ) { errors.push('Password and Confirm Password must match'); }
	if ( memberInfo.firstname.length === 0 ) { errors.push('First Name is required'); }
	if ( memberInfo.lastname.length === 0 ) { errors.push('Last Name is required'); }
	if ( memberInfo.location.length === 0 ) { errors.push('Location is required'); }
	
	Member.findOne({'username': memberInfo.username}).exec(function(err, result){
		var usernameUsed = ( memberInfo.username.length > 0 && result );
		if ( usernameUsed ) { errors.push('Requested Username has already been taken'); }

		if ( errors.length === 0 ) {
			var hash = crypto.createHmac('sha512', memberInfo.pwsalt);
			hash.update(password);
			memberInfo.pwhash = hash.digest('hex');

			var member = new Member(memberInfo).save(function(err, doc, rowsaffected){
				req.session.username   = memberInfo.username;
				req.session.firstname  = memberInfo.firstname;
				req.session.lastname   = memberInfo.lastname;
				req.session.location   = memberInfo.location;
				res.redirect("/bars");
			});
		} else {
			res.render("account_register", {
				title     : "Member Registration",
				sess      : req.session,
				errors    : errors,
				username  : ( usernameUsed ) ? "" : memberInfo.username,
				password  : ( usernameUsed ) ? password : "",
				firstname : memberInfo.firstname,
				lastname  : memberInfo.lastname,
				location  : memberInfo.location
			});
		}
	});
});

module.exports = router;