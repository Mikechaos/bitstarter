var express = require('express');
var fs = require('fs');
var app = express();
var sys = require('util'),
    rest = require('restler');

rest.get('http://google.com').on('complete', function(result) {
  if (result instanceof Error) {
    sys.puts('Error: ' + result.message);
    this.retry(5000); // try again after 5 sec
  } else {
    sys.puts(result);
  }
});

app.use(express.logger());

app.get('/', function(request, response) {
  response.send(fs.readFileSync('index.html', {encoding:'utf-8'}));
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
