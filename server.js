var express = require('express');
var app = express();
//var http = require('http').Server(app);
//var socket = require('socket.io')(http);
var server = require('http').createServer(app)  
var io = require("socket.io").listen(server);

var people = {};

//Declaracion de rutas
app.use("/public", express.static(__dirname + '/public'));

app.get('/', function(req, res){
 res.sendfile('index.html',{ root: 'public/' }); 
});

app.get('/helloworld', function(req, res){
  res.send('<h1>Hello world</h1>');
});

io.sockets.on("connection", function (socket) {

	socket.on("join", function(name){
		people[socket.id] = name;
		socket.emit("update", "Te has conectado al servidor.");
		io.sockets.emit("update", name + " se ha conectado al chat.")
		io.sockets.emit("update-people", people);
	});

	socket.on("send", function(msg){
		//process.exit(1);
		var re = /^[w]:.*:/;
		var whisper = re.test(msg);
		var whisperStr = msg.split(":");
		var found = false;
		if (whisper) {
			var whisperTo = whisperStr[1];
			var keys = Object.keys(people);
			if (keys.length != 0) {
				for (var i = 0; i<keys.length; i++) {
					if (people[keys[i]] === whisperTo) {
						var whisperId = keys[i];
						found = true;
						if (socket.id === whisperId) { //can't whisper to ourselves
							socket.emit("update", "No puedes hablarte a ti mismo.");
						}
						break;
					} 
				}
			}
			if (found && socket.id !== whisperId) {
				var whisperTo = whisperStr[1];
				var whisperMsg = whisperStr[2];
				socket.emit("whisper", {name: "Tu"}, whisperMsg);
			    io.sockets.connected[whisperId].emit("whisper", people[socket.id], whisperMsg);
				//socket.emit("whisper", people[socket.id], whisperMsg);
			} else {
				socket.emit("update", "El usuario " + whisperTo + " no existe");
			}
		} else {
			io.sockets.emit("chat", people[socket.id], msg);
		}
	});

	socket.on("disconnect", function(){
		io.sockets.emit("update", people[socket.id] + " ha abandonado el chat.");
		delete people[socket.id];
		io.sockets.emit("update-people", people);
	});
});


server.listen(8000, function(){
  console.log('listening on *:8000');
});