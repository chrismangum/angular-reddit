app = angular.module 'app', ['ngRoute']

app.config ['$routeProvider', '$locationProvider'
  ($routeProvider, $locationProvider) ->
    $routeProvider.when '/r/:subreddit',
      templateUrl: '/static/template.html'
      controller: 'tmpCtrl'
    $routeProvider.when '/r/:subreddit/comments/:thread/:title',
      templateUrl: '/static/template.html'
      controller: 'tmpCtrl'
    $locationProvider.html5Mode true
]

app.controller 'mainCtrl', ['$scope', '_', 'jQuery', 'localStorage', '$sce'
  ($scope, _, $, storage, $sce) ->
    $theme = $ '.theme'
    $body = $ document.body

    $scope.parseHtml = (bodyHtml) ->
      $sce.trustAsHtml _.unescape bodyHtml

    $scope.subreddits = ['r/commandline', 'r/linux', 'r/programming']

    $scope.themes = ['Amelia', 'Cyborg', 'Default', 'Flatly', 'Slate', 'Yeti']

    $scope.setTheme = (index) ->
      storage.theme = index
      $scope.themeName = $scope.themes[index]

    unless storage.theme
      storage.theme = 1

    $scope.setTheme storage.theme

    $(window).on 'scroll', ->
      if $(document).height() == $(this).scrollTop() + this.innerHeight
        console.log 'bottom'
]

app.controller 'tmpCtrl', ['$scope', 'http', '$routeParams', 'parse'
  ($scope, http, $routeParams, parse) ->
    $scope.posts = []
    $scope.comments = []
    http.get (data) ->
      if $routeParams.thread
        $scope.posts = parse.posts data[0]
        $scope.comments = parse.comments data[1]
      else
        $scope.posts = parse.posts data
      document.title = $routeParams.subreddit
]

app.factory 'parse', ->
  parse = {}
  parse.comments = (data, level) ->
    level = level or 1
    _.compact data.data.children.map (comment) ->
      if comment.kind != 'more'
        comment = comment.data
        comment.score = comment.ups - comment.downs
        if comment.replies
          if level == 9
            comment.more = true
          comment.replies = parse.comments comment.replies, level + 1
        comment
  parse.posts = (data) ->
    _.pluck data.data.children, 'data'
  parse

app.filter 'timeago', ['moment', (moment) ->
  (timestamp) ->
    moment(timestamp * 1000).fromNow()
]

app.factory 'http', ['$http', '$routeParams', 'jQuery', '_'
  ($http, $routeParams, $, _) ->
    buildUrl = ->
      url = 'http://www.reddit.com/r/'
      params = _.extend {}, $routeParams
      url += params.subreddit
      url += if params.thread then '/comments/' + params.thread else ''
      url += if params.sort then '/' + params.sort else ''
      params = _.omit params, 'subreddit', 'thread'
      params.limit = 500
      url += '.json?'
      url + $.param params
    get: (callback) ->
      $http.get(buildUrl()).success (data) ->
        callback data
]

_.each ['moment', '_', 'jQuery', 'localStorage'], (item) ->
  app.factory item, () ->
    window[item]
