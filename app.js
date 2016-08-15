console.log('starting up');
var mode = process.argv[2] || 'development';
if ( mode == 'development' ) {
	require('dotenv').config();
}
var express      = require('express'),
	path         = require('path'),
	app          = express(),
	fs           = require('fs'),
	session      = require('express-session'),
	bodyParser   = require('body-parser'),
	pug          = require('pug'),
	bootstrapSvc = require('express-bootstrap-service');

// database connection
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

// some environment variables
app.set('view engine', 'pug');
app.use(bootstrapSvc.serve);
app.use(session({
	secret: 'Fr33C0d3C4mp##b4r5t00|',
	resave: false,
	saveUninitialized: false
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/ng', express.static(__dirname + '/node_modules/angular/'));

// dynamically include routes (Controller)
fs.readdirSync('./controllers').forEach(function (file) {
	if(file.substr(-3) == '.js') {
		var fc = file.replace('.js', '');
		app.use('/'+fc, require('./controllers/' + file));
	}
});

app.get('/', function(req, res){
	res.redirect("/bars");
});

if ( mode == 'development' ) {
	//app.use(require('nodebuilder'));
}

app.listen(process.env.PORT, function(){
  console.log('Express server listening on port ' + process.env.PORT);
});