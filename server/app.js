var express = require('express'),
  http = require('http'),
  path = require('path'),
  app = express();

app.use(express.logger('dev'));
app.use(function (req, res, next) {
  if (req.connection.remoteAddress === '127.0.0.1') {
    next();
  } else {
    console.log('invalid ip');
    res.end();
  }
});
app.use(express.static(path.join(__dirname, '../public')));
http.createServer(app).listen(3000);
