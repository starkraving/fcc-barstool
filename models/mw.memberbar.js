var express    = require('express');
var MemberBar  = require('../models/memberbar.js');

module.exports = {
	getByMember: function(collectionName) {
		return function(req, res, next) {
			var username = ( typeof req.session.username != 'undefined' )
					? req.session.username : '';
			if ( username.length > 0 ) {
				MemberBar.find({username: req.session.username}).exec(function(err, result){
					res[collectionName] = ( err ) ? [] : result;
					next();
				});
			} else {
				res[collectionName] = [];
				next();
			}
		};
	},
	countByMember: function(collectionName) {
		return function(req, res, next) {
			var username = ( typeof req.session.username != 'undefined' )
					? req.session.username : '';
			if ( username.length > 0 ) {
				MemberBar.aggregate([
			        { $match: {
			            username: username
			        }},
			        { $group: {
			            _id: "$barId",
			            goingCount: { $sum: 1 }
			        }},
			        { $sort: {
			        	goingCount: -1
			        }}
			    ], function(err, results){
					res[collectionName] = ( err ) ? [] : results;
					next();
				});
			} else {
				res[collectionName] = [];
				next();
			}
		};
	},
	updateMember: function(memberBars, newUsername) {
		memberBars.forEach(function(entry){
			entry.username = newUsername;
			entry.save();
		});
	},
	going: function(req, res, next) {
		var datetime = new Date().getTime();
		MemberBar.find({ username : req.session.username })
			.where('goingTS').gte(datetime - (18*60*60*1000))
			.select('barId')
			.exec(function(err, result){
				res.going = ( err ) ? [] : result;
				next();
			});
	}
}