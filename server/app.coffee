express = require 'express'
http = require 'http'
path = require 'path'

app = express()
app.use '/static', express.static 'public'
app.get '*', (req, res) ->
  res.sendfile 'public/index.html'

http.createServer(app).listen process.env.PORT or 3000
