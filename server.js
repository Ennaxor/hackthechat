var express = require('express');
var app = express();
var http = require('http').Server(app);

//Declaracion de rutas
app.use("/public", express.static(__dirname + '/public'));

app.get('/', function(req, res){
 res.sendfile('index.html',{ root: 'public/' }); 
});

app.get('/helloworld', function(req, res){
  res.send('<h1>Hello world</h1>');
});

http.listen(8000, function(){
  console.log('listening on *:8000');
});