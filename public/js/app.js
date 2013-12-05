var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/r/:subreddit', {
    templateUrl: 'layouts/posts.html',
    controller: 'rbCtrl'
  });
}]);

app.controller('rbCtrl', ['$scope', '$httpBackend', '$routeParams', 'jQuery', function ($scope, $httpBackend, $routeParams, $) {
  $scope.data = '';

  function parseData(data) {
    var i, max;
    data = angular.fromJson(data).data.children;
    for (i = 0, max = data.length; i < max; i += 1) {
      data[i] = data[i].data;
    }
    return data;
  }

  function buildUrl(params) {
    var url = 'http://www.reddit.com/r/';
    url += params.subreddit;
    url += params.thread ? '/' + params.thread : '';
    url += params.sort ? '/' + params.sort : '';

    delete params.subreddit;
    delete params.thread

    params.limit = 1000;
    url += '.json?';
    return url + $.param(params);
  }

  function getData(params) {
    var url = buildUrl(params);
    $httpBackend('GET', url, null, function (status, data) {
      $scope.data = parseData(data);
      $scope.$apply();
    });
  }
  getData($routeParams);
}]);

app.factory('jQuery', function() {
  return jQuery;
});
