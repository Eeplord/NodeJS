// public/javascripts/filesystem.js

var app = angular.module('fileBrowserApp', ['ngRoute', 'jsTree.directive']);

app.config([
'$routeProvider',
function($routeProvider) {
    
    $routeProvider
    
	.when('/', {
	    templateUrl: '../partials/filesystem.html',
	    controller: 'MainCtrl'
	})

	.otherwise({
	    redirectTo: '/'
	});
}]);

app.factory('FetchFileFactory', ['$http', 'auth', function($http, auth) {
    var _factory = {};

    _factory.fetchFile = function(file) {
	return $http.get('/filesystem/api/resource?resource=' + encodeURIComponent(file), {
	    headers: {Authorization: 'Bearer ' + auth.getToken()}});
    };

    return _factory;
}]);

app.controller('MainCtrl', ['$scope', 'FetchFileFactory', 'auth', function($scope, FetchFileFactory, auth) {
    $scope.fileViewer = 'Please select a file to view its contents';
    $scope.isLoggedIn = auth.isLoggedIn;

    $scope.nodeSelected = function(e, data) {
	var _l = data.node.li_attr;
	if (_l.isLeaf) {
	    FetchFileFactory.fetchFile(_l.base).then(function(data) {
		var _d = data.data;
		if (typeof _d == 'object') {
		    _d = JSON.stringify(_d, undefined, 2);
		}
		$scope.fileViewer = _d;
	    });
	} else {
	    $scope.$apply(function() {
		$scope.fileViewer = 'Please select a file to view its contents';
	    });
	}
    };
}]);
