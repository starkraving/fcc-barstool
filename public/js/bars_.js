var barsTool = angular.module('barsTool', []);
barsTool.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);
barsTool.controller('init', function($scope, $sce, $compile, $http){
	$scope.location = 'location';
	$scope.bars = [];
	$scope.going = [];
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
				$scope.going = result.data.going;
			});
	};
	$scope.showGoing = function(barId) {
		if ( $scope.going.length === 0 )return 'Not going';
		var going = $scope.going.filter(function(bar){
			return ( bar.barId == barId );
		});
		return ( going.length === 0 ) ? 'Not going' : 'Going';
	};
	$scope.toggleGoing = function(barId) {
		var uri = '/bars/'+$scope.location+'/'+escape(barId)+'/register';
		$http.post(uri+'?json')
			.then(function(result){
				if ( result.data.success ) {
					if ( result.data.going ) {
						$scope.going.push({barId: barId});
					} else {
						$scope.going = $scope.going.filter(function(bar){
							return ( bar.barId != barId );
						})
					}
				}
			});
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