var express = require('express'),
		app = express(),
		server = require('http').Server(app).listen(3000),
 		io = require('socket.io')(server),
		mongoose = require('mongoose'),
		path = require('path'),
		sass = require('node-sass'),
		users = {},
	  savedUsers = [],
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
    //checks to see if user exist
		console.log(data);
		data = data.toLowerCase();
		console.log(data);
		if (data in users || data == 0 || data.length > 15){
      //returns false if user exists
			callback(false);
		} else{
      //returns true
			callback(true);
      //calls the socket nickname
			socket.nickname = data;
			var userCount = savedUsers.push(data);
			console.log(savedUsers);
			console.log(userCount);
			users[socket.nickname] = socket;

			//console.log(users[socket.nickname]);
			updateNicknames();
		}
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
		if( data == 0){
			callback(data);
		}else{
			var msg = data;
			console.log(data +': data')
			console.log(msg);
			msg = data.trim();
			console.log('after trimming message is: ' + msg);
			if(msg.substr(0,3) === '/w '){
				msg = msg.substr(3);
				var ind = msg.indexOf(' ');
				if(ind !== -1){
					var name = msg.substring(0, ind);
					var msg = msg.substring(ind + 1);
					if(name in users){
						users[name].emit('whisper', {msg: msg, nick: socket.nickname});
						console.log('message sent is: ' + msg);
						console.log('Whisper!');
					} else{
						callback('Error!  Enter a valid user.');
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
