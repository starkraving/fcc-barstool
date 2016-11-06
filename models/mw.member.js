var express    = require('express');
var Member     = require('./member.js');
var crypto      = require('crypto');

module.exports = {
	getByLogin: function(req, res, next) {
		Member.findOne({'username': req.body.username}).exec(function(err, result){
			if ( !err && result && 'pwsalt' in result ) { 
				var hash = crypto.createHmac('sha512', result.pwsalt);
				hash.update(req.body.password);
				if ( result.pwhash == hash.digest('hex') ) {
					authenticated = true;
					res.member = result;
					return next();
				}
			}
			res.member = null;
			next();
		});
	},
	getByUsername: function(req, res, next) {
		Member.findOne({'username': req.session.username}).exec(function(err, result){
			res.member = ( err ) ? null : result;
			next();
		});
	}
}