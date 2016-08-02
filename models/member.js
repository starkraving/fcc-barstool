var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var memberSchema = new Schema({
	username  : String,
	firstname : String,
	lastname  : String,
	location  : String,
	pwsalt    : String,
	pwhash    : String
});

module.exports = mongoose.model('member', memberSchema);