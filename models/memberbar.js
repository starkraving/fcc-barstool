var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var memberBarSchema = new Schema({
	username  : String,
	location  : String,
	barId     : String,
	barName   : String,
	goingTS   : Number
});

module.exports = mongoose.model('memberBar', memberBarSchema);