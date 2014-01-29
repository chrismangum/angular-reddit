var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider',
  function ($routeProvider, $locationProvider) {
    $routeProvider.when('/r/:subreddit', {
      templateUrl: '/static/template.html',
      controller: 'tmpCtrl'
    });
    $routeProvider.when('/r/:subreddit/comments/:thread/:title', {
      templateUrl: '/static/template.html',
      controller: 'tmpCtrl'
    });
    $locationProvider.html5Mode(true);
  }
]);

app.controller('mainCtrl', ['$scope', '_', 'jQuery', 'localStorage', '$sce',
  function ($scope, _, $, storage, $sce) {
    var $theme = $('.theme');
    var $body = $(document.body);
    var dummyEl = document.createElement('div');

    $scope.parseHtml = function (body_html) {
      return $sce.trustAsHtml(_.unescape(body_html));
    };
    $scope.themes = ['Amelia', 'Cyborg', 'Default', 'Slate', 'Yeti'];
    $scope.subreddits = ['r/commandline', 'r/linux', 'r/programming'];
    $scope.setTheme = function(name) {
      storage.theme = name;
      $theme.attr('href', '/static/css/bootstrap-themes/' + name.toLowerCase() + '.min.css');
      $body.attr('id', name);
    };
    if (!storage.theme) {
      storage.theme = 'Cyborg';
    }
    $scope.setTheme(storage.theme);

    $(window).on('scroll', function () {
      if ($(document).height() === $(this).scrollTop() + this.innerHeight) {
        console.log('bottom');
      }
    });
  }
]);

app.controller('tmpCtrl', ['$scope', 'http', '$routeParams', 'parse',
  function ($scope, http, $routeParams, parse) {
    $scope.posts = [];
    $scope.comments = [];

    http.get(function (data) {
      if ($routeParams.thread) {
        $scope.posts = parse.posts(data[0]);
        $scope.comments = parse.comments(data[1]);
      } else {
        $scope.posts = parse.posts(data);
      }
      document.title = $routeParams.subreddit;
      $scope.$apply();
    });
  }
]);

app.factory('parse', function () {
  var parse = {};
  parse.comments = function (data, level) {
    level = level || 1;
    return _.compact(_.map(data.data.children,
      function (comment) {
        if (comment.kind !== "more") {
          comment = comment.data;
          comment.score = comment.ups - comment.downs;
          if (comment.replies) {
            if (level === 9) {
              comment.more = true;
            }
            comment.replies = parse.comments(comment.replies, level + 1);
          }
          return comment;
        }
      }
    ));
  };
  parse.posts = function (data) {
    return _.pluck(data.data.children, 'data');
  };
  return parse;
});

app.filter('timeago', ['moment', function (moment) {
  return function (timestamp) {
    return moment(timestamp * 1000).fromNow();
  };
}]);

app.factory('http', ['$httpBackend', '$routeParams', 'jQuery', '_',
  function ($httpBackend, $routeParams, $, _) {
    function buildUrl() {
      var url = 'http://www.reddit.com/r/',
        params = _.extend({}, $routeParams);
      url += params.subreddit;
      url += params.thread ? '/comments/' + params.thread : '';
      url += params.sort ? '/' + params.sort : '';
      params = _.omit(params, 'subreddit', 'thread');
      params.limit = 1000;
      url += '.json?';
      return url + $.param(params);
    }
    return {
      get: function (callback) {
        $httpBackend('GET', buildUrl(), null, function (status, data) {
          callback(angular.fromJson(data));
        });
      }
    };
  }
]);

_.each(['moment', '_', 'jQuery', 'localStorage'], function (item) {
  app.factory(item, function () {
    return window[item];
  });
});
