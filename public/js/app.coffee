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

app.controller 'mainCtrl', ['$scope', '_', 'localStorage', '$sce'
  ($scope, _, storage, $sce) ->

    $scope.parseComments = (data, level) ->
      level = level or 1
      _.compact data.data.children.map (comment) ->
        if comment.kind != 'more'
          comment = comment.data
          comment.score = comment.ups - comment.downs
          if comment.replies
            if level == 9
              comment.more = true
            comment.replies = $scope.parseComments comment.replies, level + 1
          comment

    $scope.parseHtml = (bodyHtml) ->
      $sce.trustAsHtml _.unescape bodyHtml

    $scope.parsePosts = (data) ->
      _.pluck data.data.children, 'data'

    $scope.subreddits = ['r/commandline', 'r/linux', 'r/programming']

    $scope.themes = ['Amelia', 'Cyborg', 'Default', 'Flatly', 'Slate', 'Yeti']

    $scope.setTheme = (index) ->
      storage.theme = index
      $scope.themeName = $scope.themes[index]

    $scope.setTheme storage.theme or 1
]

app.controller 'tmpCtrl', ['$scope', 'http', '$routeParams'
  ($scope, http, $routeParams) ->
    $scope.posts = []
    $scope.comments = []

    http.get (data) ->
      if $routeParams.thread
        $scope.posts = $scope.parsePosts data[0]
        $scope.comments = $scope.parseComments data[1]
      else
        $scope.posts = $scope.parsePosts data
      document.title = $routeParams.subreddit
]

app.filter 'timeago', ['moment', (moment) ->
  (timestamp) ->
    moment(timestamp * 1000).fromNow()
]

app.factory 'http', ['$http', '$routeParams', '_'
  ($http, $routeParams, _) ->

    buildQueryString = (params) ->
      string = []
      for key, val of params
        string.push(key + '=' + val)
      string.join('&')

    buildUrl = ->
      url = 'http://www.reddit.com/r/'
      params = _.clone $routeParams
      url += params.subreddit
      url += if params.thread then '/comments/' + params.thread else ''
      url += if params.sort then '/' + params.sort else ''
      params = _.omit params, 'subreddit', 'thread'
      params.limit = 500
      url += '.json?'
      url + buildQueryString params
    get: (callback) ->
      $http.get(buildUrl()).success (data) ->
        callback data
]

['moment', '_', 'localStorage'].forEach (item) ->
  app.factory item, () ->
    window[item]
