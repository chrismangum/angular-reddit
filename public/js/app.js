var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/r/:subreddit', {
    templateUrl: 'layouts/posts.html',
    controller: 'rdtCtrl'
  });
  $routeProvider.when('/r/:subreddit/comments/:thread/:title', {
    templateUrl: 'layouts/posts.html',
    controller: 'rdtCtrl'
  });
}]);

app.controller('rdtCtrl', ['$scope', 'http', '$routeParams', function ($scope, http, $routeParams) {
    $scope.posts = [];
    $scope.comments = [];

    function stripLayers(unstripped) {
      var i, max, stripped = [];
      unstripped = unstripped.data.children;
      for (i = 0, max = unstripped.length; i < max; i += 1) {
        stripped[i] = unstripped[i].data;
        if (typeof stripped[i].replies === 'object') {
          stripped[i].replies = stripLayers(stripped[i].replies);
        }
      }
      return stripped;
    }

    function parseCData(data) {
      var i, max;
      data = angular.fromJson(data);
      $scope.posts = [data[0].data.children[0].data];
      $scope.comments = stripLayers(data[1]);
    }

    function parsePData(data) {
      var i, max;
      data = angular.fromJson(data).data.children;
      for (i = 0, max = data.length; i < max; i += 1) {
        data[i] = data[i].data;
      }
      $scope.posts = data;
    }

    http.get(function (data) {
      if ($routeParams.thread) {
        parseCData(data);
      } else {
        parsePData(data);
      }
      $scope.$apply();
    });
  }
]);

app.filter('timeago', ['moment', function (moment) {
  return function (timestamp) {
    return moment(timestamp * 1000).fromNow();
  };
}]);

app.factory('http', ['$httpBackend', '$routeParams', 'jQuery', function ($httpBackend, $routeParams, $) {
  function buildUrl() {
    var url = 'http://www.reddit.com/r/',
      params = $.extend({}, $routeParams);
    url += params.subreddit;
    url += params.thread ? '/comments/' + params.thread : '';
    url += params.sort ? '/' + params.sort : '';

    delete params.subreddit;
    delete params.thread

    params.limit = 1000;
    url += '.json?';
    return url + $.param(params);
  }
  return {
    get: function (callback) {
      $httpBackend('GET', buildUrl(), null, function (status, data) {
        callback(data);
      });
    }
  }
}]);

app.factory('moment', function () {
  return moment;
});

app.factory('jQuery', function () {
  return jQuery;
});
