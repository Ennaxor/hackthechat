var express = require('express');
var app = express();
//var http = require('http').Server(app);
//var socket = require('socket.io')(http);
var server = require('http').createServer(app)  
var io = require("socket.io").listen(server);

var people = {};
var publickeys = {};
var public_keyA = '';
var A_id;
var public_keyB = '';
var port = process.env.PORT || 8000;

//Declaracion de rutas
app.use("/public", express.static(__dirname + '/public'));

app.get('/', function(req, res){
 res.sendfile('index.html',{ root: 'public/' }); 
});

app.get('/helloworld', function(req, res){
  res.send('<h1>Hello world</h1>');
});

io.sockets.on("connection", function (socket) {

	socket.on("join", function(name, key){
		people[socket.id] = name;
		publickeys[socket.id] = key;
		socket.emit("update", "Te has conectado al servidor.");

		io.sockets.emit("update", name + " se ha conectado al chat.")
		io.sockets.emit("update-people", people);
	});

	socket.on("check", function(user){

			var found = false;
			var whisperTo = user;
			
			var keys = Object.keys(people);

			if (keys.length != 0) {

				for (var i = 0; i<keys.length; i++) {

					if (people[keys[i]] === whisperTo) {

						whisperId = keys[i];
						found = true;

						if (socket.id === whisperId) { //can't whisper to ourselves
							socket.emit("update", "No puedes hablarte a ti mismo.");
							break;
						}
					}
				}
			}

			if (found && socket.id !== whisperId) {
				
				socket.emit("public_key", publickeys[whisperId]);
				io.sockets.connected[whisperId].emit("public_key", publickeys[socket.id]);

				io.sockets.connected[socket.id].emit("DH", whisperTo);

				return true;

			} else {
				socket.emit("update", "El usuario " + whisperTo + " no existe");
				return false;
			}
	});
	
	socket.on("send", function(msg, isCoded, whisperTo){

		if (isCoded) {

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
				socket.emit("whisper", {name: "Tu"}, whisperTo, msg);
			    io.sockets.connected[whisperId].emit("whisper", people[socket.id], whisperTo, msg);
				
				/////////////// Send global mesage coded to the user not in the whisper
				
				var keys = Object.keys(people);

				if (keys.length != 0) {

					for (var i = 0; i<keys.length; i++) {

						if (people[keys[i]] != whisperTo && socket.id != [keys[i]]) {

							io.sockets.connected[keys[i]].emit("chat", people[socket.id], msg);
							console.log("Mandar mensaje general a :" + people[keys[i]] + msg);
						}
						else {
							console.log(">>Usuario que participa en el whisper:" + people[keys[i]]);
						}
					}
				} 
				////////////////////////////////////////////////		
		}
		else {
		console.log("esta entrando aqui");
			io.sockets.emit("chat", people[socket.id], msg);
		}
	});

	socket.on("disconnect", function(){
		io.sockets.emit("update", people[socket.id] + " ha abandonado el chat.");
		delete people[socket.id];
		io.sockets.emit("update-people", people);
	});
});


server.listen(port, function(){
});