var app = angular.module('app', ['ngRoute']);

app.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
  $routeProvider.when('/r/:subreddit', {
    templateUrl: 'layouts/posts.html',
    controller: 'rbCtrl'
  });
}]);

app.controller('rbCtrl', ['$scope', '$httpBackend', '$routeParams', 'jQuery', function ($scope, $httpBackend, $routeParams, $) {
  $scope.data = '';

  function parse(data) {
    var i, max;
    data = angular.fromJson(data).data.children;
    for (i = 0, max = data.length; i < max; i += 1) {
      data[i] = data[i].data;
    }
    return data;
  }

  function getData(params) {
    var url = 'http://www.reddit.com/r/';
    url += params.subreddit;
    url += params.thread ? '/' + params.thread : '';
    url += params.sort ? '/' + params.sort : '';

    delete params.subreddit;
    delete params.thread

    params.limit = 1000;
    url += '.json?';
    url += $.param(params);
    $httpBackend('GET', url, null, function (status, data) {
      $scope.data = parse(data);
      $scope.$apply();
    });
  }
  getData($routeParams);
}]);

app.factory('jQuery', function() {
  return jQuery;
});
