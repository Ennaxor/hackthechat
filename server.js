var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Declaracion de rutas
app.use("/public", express.static(__dirname + '/public'));

app.get('/', function(req, res){
 res.sendfile('index.html',{ root: 'public/' }); 
});

app.get('/helloworld', function(req, res){
  res.send('<h1>Hello world</h1>');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
  socket.on('error', function (err) {
    console.log(err);
	});

});




http.listen(8000, function(){
  console.log('listening on *:8000');
});