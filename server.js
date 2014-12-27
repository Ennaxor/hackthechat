var express = require('express');
var app = express();
var http = require('http').Server(app);
var socket = require('socket.io')(http);
var people = {};

//Declaracion de rutas
app.use("/public", express.static(__dirname + '/public'));

app.get('/', function(req, res){
 res.sendfile('index.html',{ root: 'public/' }); 
});

app.get('/helloworld', function(req, res){
  res.send('<h1>Hello world</h1>');
});

socket.on("connection", function (client) {

	client.on("join", function(name){
		people[client.id] = name;
		client.emit("update", "Te has conectado al servidor.");
		socket.sockets.emit("update", name + " se ha conectado al chat.")
		socket.sockets.emit("update-people", people);
	});

	client.on("send", function(msg){
		socket.sockets.emit("chat", people[client.id], msg);
	});

	client.on("disconnect", function(){
		socket.sockets.emit("update", people[client.id] + " ha abandonado el chat.");
		delete people[client.id];
		socket.sockets.emit("update-people", people);
	});
});


http.listen(8000, function(){
  console.log('listening on *:8000');
});