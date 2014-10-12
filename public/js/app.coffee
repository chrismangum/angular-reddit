app = angular.module 'app', ['ngRoute', 'ngSanitize', 'firebase']

app.config ($routeProvider, $locationProvider) ->
  $routeProvider
    .when '/',
      templateUrl: '/static/hn-template.html'
      controller: ($scope, $hn) ->
        $scope.updateTitle 'Hacker News'
        $hn.getTopStories().then (stories) ->
          $scope.posts = stories
          $scope.comments = []
    .when '/:id',
      templateUrl: '/static/hn-template.html'
      controller: ($scope, $hn, $routeParams) ->
        $hn.getStory($routeParams.id).then (story) ->
          $scope.updateTitle story.title
          $scope.posts = [story]
          $scope.comments = story.kids
    .when '/r/:subreddit',
      templateUrl: '/static/rdt-template.html'
      controller: ($scope, $rdt) ->
        $rdt.getData().then ({posts, comments}) ->
          $scope.updateTitle posts[0].subreddit
          $scope.posts = posts
          $scope.comments = comments
    .when '/r/:subreddit/:id',
      templateUrl: '/static/rdt-template.html'
      controller: ($scope, $rdt) ->
        $rdt.getData().then ({posts, comments}) ->
          $scope.updateTitle posts[0].title
          $scope.posts = posts
          $scope.comments = comments
    .otherwise redirectTo: '/'
  $locationProvider.html5Mode true


app.controller 'rootCtrl', ($scope, $document) ->
  $scope.updateTitle = (title) ->
    $document[0].title = title

  $scope.places = [
    { name: 'Hacker News', path: '/' }
    { name: 'r/Commandline', path: '/r/commandline' }
    { name: 'r/Linux', path: '/r/linux' }
    { name: 'r/Programming', path: '/r/programming' }
  ]
  $scope.themes = ['Amelia', 'Cyborg', 'Default', 'Flatly', 'Slate', 'Yeti']

  $scope.setTheme = (index = 1) ->
    localStorage.theme = index
    $scope.themeName = $scope.themes[index]

  $scope.setTheme localStorage.theme


app.factory '$hn', ($firebase, $q) ->
  baseUrl = 'https://hacker-news.firebaseio.com/v0'
  getFb = (url) -> $firebase new Firebase url

  getItem = (id) ->
    getFb(baseUrl + '/item/' + id).$asObject().$loaded()

  getItemRecursive = (id) ->
    getItem(id).then (item) ->
      if item.kids
        $q.all(_.map item.kids, getItemRecursive).then (kids) ->
          item.kids = kids
          item
      else
        item

  getStory: getItemRecursive
  getTopStories: ->
    getFb(baseUrl + '/topstories').$asArray().$loaded().then (data) =>
      $q.all _.map _.pluck(data, '$value'), getItem


app.factory '$rdt', ($http, $routeParams) ->
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
    url = "http://www.reddit.com/r/#{params.subreddit}/"
    url += "comments/#{params.id}/" if params.id
    url += params.sort if params.sort
    "#{url}.json?#{$.param _.omit params, 'subreddit', 'id'}"

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
