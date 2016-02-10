var express = require('express'),
		app = express(),
		server = require('http').Server(app).listen(3000),
 		io = require('socket.io')(server),
		mongoose = require('mongoose'),
		path = require('path'),
		sass = require('node-sass'),
		_ = require('underscore'),
		backbone = require('backbone'),
		rooms = [],
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
// catch 404 and forward to error handler
app.use(function(req, res) {
  var err = new Error('Not Found');
  err.status = 404;
  res.render('fourOhFour', err);
	console.log(err);
});

//on connection to socket
io.sockets.on('connection', function(socket){

	//~~~~~~
	// var rm = io.of('/');
	// rm.on('connection', function(socket){
	// 	console.log('rm is declared');
	// })
	//~~~~~~

  //query finds messages
	//must use model.find() to search the premade model --- no need for a new CHAT model. It wouldn't exist.
	var query = model.find();
  //sort the query in descending order with a limit of 8 messages back from the latest
	query.sort('-created').limit(4).exec(function(err, docs){
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
var patt1 = /\s/g;
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

	socket.on('send message', function(data, callback){
		if( data == 0 || socket.nickname == null){
			callback(false);
		}else{
			var msg = data;
			//handle mutliple messages with a data hydrate system ~~~ arrays and empty the array.. so on and so forth
			console.log(data +': data')
			console.log(msg);
			msg = data.trim();
			console.log('after trimming message is: ' + msg);
			// if(msg.substr(0) === '/'){
			// 	var someData = {
			// 		msg: "need help?",
			// 		stuff: 'more stuff'
			// 	}
			//
					//need to use backbone and underscore here
				// io.emit('whisper', {msg: someData, nick: "the logger"});
				//~~~~ cant forget this
			//}
			//whisper logic
			if(msg.substr(0,3) == '/w ' || msg.substr(0,2) == '/w' || msg.substr(0) == '/'){
				msg = msg.substr(3);
				var ind = msg.indexOf(' ');
				console.log('whisper was not made, fool');
				if(ind !== -1){
					var name = msg.substring(0, ind).toLowerCase();
					var msg = msg.substring(ind + 1);
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
				var msgCount = sentMsgs.push(socket.msgCount);
				console.log(msgCount + ' : counted msg');
				var newMsg = new model({msg: msg, nick: socket.nickname});
				newMsg.save(function(err){
					if(err) throw err;

					console.log();

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
