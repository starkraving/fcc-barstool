var barsTool = angular.module('barsTool', []);
barsTool.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);
barsTool.controller('init', function($scope, $sce, $compile, $http){
	$scope.location = 'location';
	$scope.bars = [];
	$scope.loadBars = function(location) {
		if ( !isNaN(location) && arguments.length > 1 ) {
			// use lat/long
			$scope.location = [location, arguments[1]].join(',');
			var uri = '/bars/latlong/'+escape(location)+'/'+escape(arguments[1]);
		} else {
			// use text location
			$scope.location = escape(location);
			var uri = '/bars/'+escape(location);
		}
		$http.get(uri+'?json')
			.then(function(result){
				$scope.bars = result.data.businesses;
			});
	};
	$scope.toggleGoing = function(barId) {
		alert(barId);
	};
	if ( typeof bar_location == 'undefined' ) {
		var loadLatLong = function(position) {
			$scope.loadBars(position.coords.latitude, position.coords.longitude);
		};
		if ( navigator.geolocation ) {
			navigator.geolocation.getCurrentPosition(loadLatLong);
		}
	} else {
		$scope.loadBars(bar_location);
	}
});