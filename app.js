var express = require('express'),
		app = express(),
		server = require('http').Server(app).listen(3000),
 		io = require('socket.io')(server),
		mongoose = require('mongoose'),
		path = require('path'),
		sass = require('node-sass'),
		_ = require('backbone/node_modules/underscore'),
		backbone = require('backbone'),
		users = {},
	  savedUsers = [],
		sentMsgs = [],
		model = require('./models/Chat'),
		routes = require('./routes/chat');

require('./db/database');



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);


app.use(function(req, res) {
  var err = new Error('Not Found');
  err.status = 404;
  res.render('fourOhFour', err);
	console.log(err);
});

//user connected to /chat
io.on('connection', function(socket) {
	console.log('A user connected');
	//socket.emit('msg');
})
//on connection to socket
io.sockets.on('connection', function(socket){
  //query finds messages
	//must use model.find() to search the premade model --- no need for a new CHAT model. It wouldn't exist.
	var query = model.find();
  //sort the query in descending order with a limit of 8 messages back from the latest
	query.sort('-created').limit(8).exec(function(err, docs){
    //if errors out throw error
		if(err) throw err;
    //otherwise load the old messages
		socket.emit('load old msgs', docs);
		//~~~~~~~~
		//important
		//console.log(docs[0].msg);
		//this grabs messages
		//~~~~~~~~
	});

  //creates new user
	socket.on('new user', function(data, callback){
		function throwUser(something){
			data = data.toLowerCase();//ensuring lowercase in database
			if (data in users || data == 0 || data.length > 13 || _.contains(savedUsers, data)){
	      //returns false if user exists
				callback(false);
			} else{
	      //returns true allowing connections to be made

				callback(true);
	      //calls the socket nickname
				socket.nickname = data;
				//inputting logs to correct arrays
				var userCount = savedUsers.push(data);
				//names taken
				console.log(savedUsers);
				//count
				console.log(userCount);
				users[socket.nickname] = socket;

				//console.log(users[socket.nickname]);
				updateNicknames();
			}
		}
		throwUser(data);
	});

	function updateNicknames(){
		io.sockets.emit('usernames', Object.keys(users));
	}
	// function blockEmpty(msg){
	// 	if(msg.length == null){
	//
	// 	}
	// }
	socket.on('send message', function(data, callback){
		if( data == 0 || socket.nickname == null){
			callback(false);
		}else{
			var msg = data;
			console.log(data +': data')
			console.log(msg);
			msg = data.trim();
			console.log('after trimming message is: ' + msg);
			var msgCount = sentMsgs.push(data);
			console.log(msgCount + ' : counted msg');

			//whisper logic
			if(msg.substr(0,3) === '/w ' || msg.substr(0,2) === '/w'){
				msg = msg.substr(3);
				console.log(msg.indexOf(' ') + ' :::indexing');
				var ind = msg.indexOf(' ');
				console.log(ind + ' :: test');
				if(ind !== -1){
					var name = msg.substring(0, ind);
					var msg = msg.substring(ind + 1);
					console.log(msg + ' ::: ' +ind +' : '+':: test')
					if(name in users){
						users[name].emit('whisper', {msg: msg, nick: socket.nickname});
						console.log('message sent is: ' + msg);
						console.log('Whisper!');
					} else{
						callback('Error!  Enter a valid user.');
						console.log('errrororeoroero');
					}
				} else{
					callback('Error!  Please enter a message for your whisper.');
				}
			} else{
				var newMsg = new model({msg: msg, nick: socket.nickname});
				newMsg.save(function(err){
					if(err) throw err;
					io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
				});
			}
		}
	});

  //when a user disconnects from the server
	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
    //deletes the user who left
		delete users[socket.nickname];
    //updateNicknames when a user disconnects
		updateNicknames();
	});
});

module.exports = app;
