(function() {
  var app;

  app = angular.module('app', ['ngRoute']);

  app.config([
    '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
      $routeProvider.when('/r/:subreddit', {
        templateUrl: '/static/template.html',
        controller: 'tmpCtrl'
      });
      $routeProvider.when('/r/:subreddit/comments/:thread/:title', {
        templateUrl: '/static/template.html',
        controller: 'tmpCtrl'
      });
      return $locationProvider.html5Mode(true);
    }
  ]);

  app.controller('mainCtrl', [
    '$scope', '_', 'jQuery', 'localStorage', '$sce', function($scope, _, $, storage, $sce) {
      var $body, $theme;
      $theme = $('.theme');
      $body = $(document.body);
      $scope.parseHtml = function(bodyHtml) {
        return $sce.trustAsHtml(_.unescape(bodyHtml));
      };
      $scope.subreddits = ['r/commandline', 'r/linux', 'r/programming'];
      $scope.themes = ['Amelia', 'Cyborg', 'Default', 'Flatly', 'Slate', 'Yeti'];
      $scope.setTheme = function(index) {
        storage.theme = index;
        return $scope.themeName = $scope.themes[index];
      };
      if (!storage.theme) {
        storage.theme = 1;
      }
      $scope.setTheme(storage.theme);
      return $(window).on('scroll', function() {
        if ($(document).height() === $(this).scrollTop() + this.innerHeight) {
          return console.log('bottom');
        }
      });
    }
  ]);

  app.controller('tmpCtrl', [
    '$scope', 'http', '$routeParams', 'parse', function($scope, http, $routeParams, parse) {
      $scope.posts = [];
      $scope.comments = [];
      return http.get(function(data) {
        if ($routeParams.thread) {
          $scope.posts = parse.posts(data[0]);
          $scope.comments = parse.comments(data[1]);
        } else {
          $scope.posts = parse.posts(data);
        }
        return document.title = $routeParams.subreddit;
      });
    }
  ]);

  app.factory('parse', function() {
    var parse;
    parse = {};
    parse.comments = function(data, level) {
      level = level || 1;
      return _.compact(data.data.children.map(function(comment) {
        if (comment.kind !== 'more') {
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
      }));
    };
    parse.posts = function(data) {
      return _.pluck(data.data.children, 'data');
    };
    return parse;
  });

  app.filter('timeago', [
    'moment', function(moment) {
      return function(timestamp) {
        return moment(timestamp * 1000).fromNow();
      };
    }
  ]);

  app.factory('http', [
    '$http', '$routeParams', 'jQuery', '_', function($http, $routeParams, $, _) {
      var buildUrl;
      buildUrl = function() {
        var params, url;
        url = 'http://www.reddit.com/r/';
        params = _.extend({}, $routeParams);
        url += params.subreddit;
        url += params.thread ? '/comments/' + params.thread : '';
        url += params.sort ? '/' + params.sort : '';
        params = _.omit(params, 'subreddit', 'thread');
        params.limit = 500;
        url += '.json?';
        return url + $.param(params);
      };
      return {
        get: function(callback) {
          return $http.get(buildUrl()).success(function(data) {
            return callback(data);
          });
        }
      };
    }
  ]);

  _.each(['moment', '_', 'jQuery', 'localStorage'], function(item) {
    return app.factory(item, function() {
      return window[item];
    });
  });

}).call(this);
