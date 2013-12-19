var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/r/:subreddit', {
    templateUrl: 'template.html',
    controller: 'tmpCtrl'
  });
  $routeProvider.when('/r/:subreddit/comments/:thread/:title', {
    templateUrl: 'template.html',
    controller: 'tmpCtrl'
  });
}]);

app.controller('mainCtrl', ['$scope', 'jQuery', 'localStorage', '$sce', function ($scope, $, storage, $sce) {
  var $theme = $('.theme');
  var $body = $(document.body);
  var dummyEl = document.createElement('div');

  $scope.parseHtml = function (body_html) {
    dummyEl.innerHTML = body_html;
    body_html = dummyEl.textContent;
    dummyEl.textContent = '';
    return $sce.trustAsHtml(body_html);
  };
  $scope.themes = {
    'Amelia': '/css/bootstrap-themes/amelia.min.css',
    'Cyborg': '/css/bootstrap-themes/cyborg.min.css',
    'Default': '/css/bootstrap-themes/default.min.css',
    'Slate': '/css/bootstrap-themes/slate.min.css',
    'Yeti': '/css/bootstrap-themes/yeti.min.css'
  };
  $scope.setTheme = function(name) {
    storage.theme = name;
    $theme.attr('href', $scope.themes[name]);
    $body.attr('id', name);
  };
  if (!storage.theme) {
    storage.theme = 'Cyborg';
  }
  $scope.setTheme(storage.theme);
}]);

app.controller('tmpCtrl', ['$scope', 'http', '$routeParams', 'parse', function ($scope, http, $routeParams, parse) {
  $scope.posts = [];
  $scope.comments = [];

  http.get(function (data) {
    if ($routeParams.thread) {
      $scope.posts = parse.posts(data[0]);
      $scope.comments = parse.comments(data[1]);
      document.title = $scope.posts[0].title;
    } else {
      $scope.posts = parse.posts(data);
      document.title = 'r/' + $scope.posts[0].subreddit;
    }
    $scope.$apply();
  });
}]);

app.factory('parse', function () {
  return {
    comments: function (data, level) {
      var i, max;
      level = level || 1;
      data = data.data.children;
      for (i = 0, max = data.length; i < max; i += 1) {
        //delete 'more' items
        if (data[i].kind === "more") {
          data.splice(i, i + 1);
          max -= 1;
          i -= 1;
          continue;
        }
        data[i] = data[i].data;
        //add score, since reddit omits it:
        data[i].score = data[i].ups - data[i].downs;
        if (typeof data[i].replies === 'object') {
          if (level === 9) {
            data[i].more = true;
          }
          data[i].replies = this.comments(data[i].replies, level + 1);
        }
      }
      return data;
    },
    posts: function (data) {
      var i, max;
      data = data.data.children;
      for (i = 0, max = data.length; i < max; i += 1) {
        data[i] = data[i].data;
      }
      return data;
    }
  };
});

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
    delete params.thread;

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
}]);

app.factory('moment', function () {
  return moment;
});

app.factory('jQuery', function () {
  return jQuery;
});

app.factory('localStorage', function () {
  return localStorage;
});
