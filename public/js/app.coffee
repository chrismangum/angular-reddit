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

app.controller 'mainCtrl', ['$scope', '$sce', ($scope, $sce) ->
  $scope.parseComments = (data, level = 1) ->
    for comment in data.data.children
      if comment.kind is 'more'
        continue
      comment = comment.data
      comment.score = comment.ups - comment.downs
      if comment.replies
        if level is 9
          comment.more = true
        comment.replies = $scope.parseComments comment.replies, level + 1
      comment

  $scope.parseHtml = (bodyHtml) ->
    $sce.trustAsHtml _.unescape bodyHtml

  $scope.parsePosts = (data) ->
    _.pluck data.data.children, 'data'

  $scope.subreddits = ['r/commandline', 'r/linux', 'r/programming']

  $scope.themes = ['Amelia', 'Cyborg', 'Default', 'Flatly', 'Slate', 'Yeti']

  $scope.setTheme = (index = 1) ->
    localStorage.theme = index
    $scope.themeName = $scope.themes[index]

  $scope.setTheme localStorage.theme
]

app.controller 'tmpCtrl', ['$scope', 'http', '$routeParams'
  ($scope, http, $routeParams) ->
    http.get().then (response) ->
      data = response.data
      if $routeParams.thread
        $scope.posts = $scope.parsePosts data[0]
        $scope.comments = $scope.parseComments data[1]
      else
        $scope.posts = $scope.parsePosts data
      document.title = $routeParams.subreddit
]

app.filter 'timeago', ->
  (timestamp) ->
    moment(timestamp * 1000).fromNow()

app.factory 'http', ['$http', '$routeParams', ($http, $routeParams) ->
  buildQueryString = (params) ->
    string = []
    for key, val of params
      string.push "#{ key }=#{ val }"
    string.join '&'

  buildUrl = ->
    params = _.assign limit: 500, $routeParams
    url = "http://www.reddit.com/r/#{params.subreddit}/"
    if params.thread
      url += "comments/#{params.thread}/"
    if params.sort
      url += params.sort
    params = _.omit params, ['subreddit', 'thread']
    url + '.json?' + buildQueryString params

  get: ->
    $http.get buildUrl()
]
