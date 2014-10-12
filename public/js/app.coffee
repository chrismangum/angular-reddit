app = angular.module 'app', ['ngRoute', 'ngSanitize']

app.config ($routeProvider, $locationProvider) ->
  $routeProvider
    .when '/:subreddit',
      templateUrl: '/static/template.html'
      controller: 'subreddit'
    .when '/:subreddit/:id',
      templateUrl: '/static/template.html'
      controller: 'thread'
    .otherwise redirectTo: '/all'
  $locationProvider.html5Mode true


app.controller 'mainCtrl', ($scope, $document) ->
  $scope.updateTitle = (title) ->
    $document[0].title = title

  $scope.subreddits = ['r/commandline', 'r/linux', 'r/programming']
  $scope.themes = ['Amelia', 'Cyborg', 'Default', 'Flatly', 'Slate', 'Yeti']

  $scope.setTheme = (index = 1) ->
    localStorage.theme = index
    $scope.themeName = $scope.themes[index]

  $scope.setTheme localStorage.theme


app.controller 'subreddit', ($scope, $reddit) ->
  $reddit.getData().then ({posts, comments}) ->
    $scope.updateTitle posts[0].subreddit
    $scope.posts = posts
    $scope.comments = comments


app.controller 'thread', ($scope, $reddit) ->
  $reddit.getData().then ({posts, comments}) ->
    $scope.updateTitle posts[0].title
    $scope.posts = posts
    $scope.comments = comments


app.factory '$reddit', ($http, $routeParams) ->
  parseComments = (data, level = 1) ->
    for c in data.data.children
      if c.kind is 'more'
        continue
      c = c.data
      c.score = c.ups - c.downs
      c.body_html = _.unescape c.body_html
      if c.replies
        if level is 9
          c.more = true
        c.replies = parseComments c.replies, level + 1
      c

  parsePosts = (data) ->
    _.map _.pluck(data.data.children, 'data'), (post) ->
      post.title = _.unescape post.title
      post.selftext_html = _.unescape post.selftext_html
      post

  buildUrl = ->
    params = _.extend limit: 500, $routeParams
    url = "http://www.reddit.com/r/#{ params.subreddit }/"
    url += "comments/#{ params.id }/" if params.id
    url += params.sort if params.sort
    params = _.omit params, 'subreddit', 'id'
    url + '.json?' + $.param params

  getData: ->
    $http.get(buildUrl()).then (res) ->
      if $routeParams.id
        posts: parsePosts res.data[0]
        comments: parseComments res.data[1]
      else
        posts: parsePosts res.data
        comments: []


app.filter 'timeago', -> (timestamp) ->
  moment(timestamp * 1000).fromNow()
