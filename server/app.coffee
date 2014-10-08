express = require 'express'
http = require 'http'
path = require 'path'
app = express()

app.use express.logger 'dev'
app.use '/static', express.static 'public'
app.get '*', (req, res) ->
  res.sendfile 'public/index.html'

http.createServer(app).listen 3000
