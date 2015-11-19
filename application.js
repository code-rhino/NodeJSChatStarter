
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

var user = require("./users.js");

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));

var messages = [];
var sockets = [];

io.on('connection', function (socket) {
    messages.forEach(function (data) {
      socket.emit('message', data);
      console.log("Number of sockets " + sockets.length);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
      console.log("Number of sockets " + sockets.length);
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      var data = {
      	name : socket.user.name,
      	text : text
      }

      broadcast('message', data);
      messages.push(data);
    });

    socket.on('identify', function (name) {
      socket.name = String(name || 'Anonymous');
      socket.user = user.create(String(name || 'Anonymous'));
      updateRoster();
    });
  });

function updateRoster(){
	async.map(
		sockets, 
		function(socket, callback){
		  var user = socket.user;
			callback(null, user.feet);
		},
		function(err, names){
			broadcast('roster', names);
		}
	);
}

function broadcast(event, data){
	sockets.forEach(function(socket){
		socket.emit(event, data);
	});
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
	var addr = server.address();
	console.log("Chat server listening at", addr.address + ":" + addr.port);
});