var express = require('express'),
  http = require('http'),
  path = require('path'),
  app = express();

app.use(express.logger('dev'));
app.use(function (req, res, next) {
  var ip = req.connection.remoteAddress;
  if (ip === '127.0.0.1') {
    next();
  } else {
    console.log('invalid ip: ' + ip);
    res.end();
  }
});
app.use(express.static(path.join(__dirname, '../public')));
http.createServer(app).listen(3000);
