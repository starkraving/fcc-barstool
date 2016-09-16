module.exports = function(role, sessKeyToCheck, loginRedirect) {
	return function(req, res, next) {
		var sess = req.session;
		if ( sess[sessKeyToCheck] && sess[sessKeyToCheck] == role ){
			next();
		} else {
			res.redirect(loginRedirect);
		}
	}
}