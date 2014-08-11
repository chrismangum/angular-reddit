app = angular.module 'app', ['ngRoute', 'ngSanitize']

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

app.controller 'mainCtrl', ['$scope', '$routeParams'
  ($scope, $routeParams) ->

    $scope.parseComments = (data, level = 1) ->
      for c in data.data.children
        if c.kind is 'more'
          continue
        c = c.data
        c.score = c.ups - c.downs
        if c.replies
          if level is 9
            c.more = true
          c.replies = $scope.parseComments c.replies, level + 1
        c

    $scope.unescape = _.unescape

    $scope.parsePosts = (data) ->
      _.pluck data.data.children, 'data'

    $scope.buildUrl = ->
      params = _.assign limit: 500, $routeParams
      url = "http://www.reddit.com/r/#{ params.subreddit }/"
      if params.thread
        url += "comments/#{ params.thread }/"
      if params.sort
        url += params.sort
      params = _.omit params, ['subreddit', 'thread']
      url + '.json?' + (for key, val of params
        "#{ key }=#{ val }"
      ).join('&')

    $scope.subreddits = ['r/commandline', 'r/linux', 'r/programming']
    $scope.themes = ['Amelia', 'Cyborg', 'Default', 'Flatly', 'Slate', 'Yeti']

    $scope.setTheme = (index = 1) ->
      localStorage.theme = index
      $scope.themeName = $scope.themes[index]

    $scope.setTheme localStorage.theme
]

app.controller 'tmpCtrl', ['$scope', '$http', '$routeParams', '$document'
  ($scope, $http, $routeParams, $document) ->
    $document[0].title = $routeParams.subreddit
    $http.get $scope.buildUrl()
      .then (res) ->
        data = res.data
        if $routeParams.thread
          $scope.posts = $scope.parsePosts data[0]
          $scope.comments = $scope.parseComments data[1]
        else
          $scope.posts = $scope.parsePosts data
]

app.filter 'timeago', -> (timestamp) ->
  moment(timestamp * 1000).fromNow()
