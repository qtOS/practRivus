
// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = ['room1','room2','room3'];

io.sockets.on('connection', function (socket) {

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// store the username in the socket session for this client
		socket.username = username;
		// store the room name in the socket session for this client

		socket.room = username + '000';
		// add the client's username to the global list
		usernames[username] = username;
		// send client to room 1
		socket.join('room1');
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected to room1');
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, 'room1');
	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});

	socket.on('switchRoom', function(newroom){
		// leave the current room (stored in session)
		socket.leave(socket.room);
		// join new room, received as function parameter
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});


// var express = require('express'),
// 		app = express(),
// 		server = require('http').Server(app).listen(3000),
//  		io = require('socket.io')(server),
// 		mongoose = require('mongoose'),
// 		path = require('path'),
// 		sass = require('node-sass'),
// 		_ = require('backbone/node_modules/underscore'),
// 		backbone = require('backbone'),
// 		users = {},
// 	  savedUsers = [],
// 		sentMsgs = [],
// 		model = require('./models/Chat'),
// 		routes = require('./routes/chat');
//
// require('./db/database');
//
//
//
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');
// app.use(express.static(path.join(__dirname, 'public')));
//
//
// app.use('/', routes);
//
//
//
// app.use(function(req, res) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   res.render('fourOhFour', err);
// 	console.log(err);
// });
//
// //user connected to /chat
// io.on('connection', function(socket) {
// 	console.log('A user connected');
// })
// //on connection to socket
// io.sockets.on('connection', function(socket){
//   //query finds messages
// 	//must use model.find() to search the premade model --- no need for a new CHAT model. It wouldn't exist.
// 	var query = model.find();
//   //sort the query in descending order with a limit of 8 messages back from the latest
// 	query.sort('-created').limit(4).exec(function(err, docs){
//     //if errors out throw error
// 		if(err) throw err;
//     //otherwise load the old messages
// 		socket.emit('load old msgs', docs);
// 		//~~~~~~~~
// 		//important
// 		//console.log(docs[0].msg);
// 		//this grabs messages
// 		//~~~~~~~~
// 	});
//
//   //creates new user
// 	socket.on('new user', function(data, callback){
// 		function throwUser(something){
// 			data = data.toLowerCase();//ensuring lowercase in database
// 			if (data in users || data == 0 || data.length > 13 || _.contains(savedUsers, data)){
// 	      //returns false if user exists
// 				callback(false);
// 			} else{
// 	      //returns true allowing connections to be made
//
// 				callback(true);
// 	      //calls the socket nickname
// 				socket.nickname = data;
// 				//inputting logs to correct arrays
// 				var userCount = savedUsers.push(data);
// 				//names taken
// 				console.log(savedUsers);
// 				//count
// 				console.log(userCount);
// 				users[socket.nickname] = socket;
//
// 				//console.log(users[socket.nickname]);
// 				updateNicknames();
// 			}
// 		}
// 		throwUser(data);
// 	});
//
// 	function updateNicknames(){
// 		io.sockets.emit('usernames', Object.keys(users));
// 	}
// 	// function blockEmpty(msg){
// 	// 	if(msg.length == null){
// 	//
// 	// 	}
// 	// }
// 	socket.on('send message', function(data, callback){
// 		if( data == 0 || socket.nickname == null){
// 			callback(false);
// 		}else{
// 			var msg = data;
// 			console.log(data +': data')
// 			console.log(msg);
// 			msg = data.trim();
// 			console.log('after trimming message is: ' + msg);
// 			// if(msg.substr(0) === '/'){
// 			// 	var someData = {
// 			// 		msg: "need help?",
// 			// 		stuff: 'more stuff'
// 			// 	}
// 			//
// 					//need to use backbone and underscore here
// 				// io.emit('whisper', {msg: someData, nick: "the logger"});
// 				//~~~~ cant forget this
// 			//}
// 			console.log('hi')
// 			//whisper logic
// 			if(msg.substr(0,3) === '/w ' || msg.substr(0,2) === '/w'){
// 				msg = msg.substr(3);
// 				var ind = msg.indexOf(' ');
// 				console.log('whisper was not made, fool');
// 				if(ind !== -1){
// 					var name = msg.substring(0, ind).toLowerCase();
// 					var msg = msg.substring(ind + 1);
// 					console.log(msg + ' ::: ' +ind +' : '+':: test')
// 					if(name in users){
// 						users[name].emit('whisper', {msg: msg, nick: socket.nickname});
// 						console.log('message sent is: ' + msg);
// 						console.log('Whisper!');
// 					} else{
// 						callback('Error!  Enter a valid user.');
// 						console.log('errrororeoroero');
// 					}
// 				} else{
// 					callback('Error!  Please enter a message for your whisper.');
// 				}
// 			} else{
// 				var msgCount = sentMsgs.push(data);
// 				console.log(msgCount + ' : counted msg');
// 				var newMsg = new model({msg: msg, nick: socket.nickname});
// 				newMsg.save(function(err){
// 					if(err) throw err;
// 					io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
// 				});
// 			}
// 		}
// 	});
//
//   //when a user disconnects from the server
// 	socket.on('disconnect', function(data){
// 		if(!socket.nickname) return;
//     //deletes the user who left
// 		delete users[socket.nickname];
//     //updateNicknames when a user disconnects
// 		updateNicknames();
// 	});
// });
//
// module.exports = app;
