var express = require('express'),
		app = express(),
		server = require('http').Server(app),
 		io = require('socket.io')(server),
		mongoose = require('mongoose'),
		path = require('path'),
		users = {},
	  savedUsers = [],
		model = require('./models/Chat'),
		routes = require('./routes/chat');

require('./db/database')

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
server.listen(3000);

io.on('connection', function(socket) {
	console.log('hello socket')
		socket.emit('msg', { message: 'hi buddy' });
})

//the collect inside of the data base /// first param is the collection name turns plural ///


app.use('/', routes);
// app.get('/', function(req,res){
//   res.render('home', someData);
// })
//getting index.html
// app.get('/chat', function(req, res){
// 	res.sendfile(__dirname + '/views/index.html');
// });
//end of routing
//on connection to socket
io.sockets.on('connection', function(socket){
  //query finds messages
	var query = model.find();
  //sort the query in descending order with a limit of 8 messages back from the latest
	query.sort('-created').limit(8).exec(function(err, docs){
    //if errors out throw error
		if(err) throw err;
    //otherwise load the old messages
		socket.emit('load old msgs', docs);
	});
  //creates new user
	socket.on('new user', function(data, callback){
    //checks to see if user exist
		if (data in users){
      //returns false if user exists
			callback(false);
		} else{
      //returns true
			callback(true);
      //calls the socket nickname
			socket.nickname = data;
			users[socket.nickname] = socket;
			updateNicknames();
		}
	});

	function updateNicknames(){
		io.sockets.emit('usernames', Object.keys(users));
	}

	socket.on('send message', function(data, callback){
		var msg = data.trim();
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
			var newMsg = new Chat({msg: msg, nick: socket.nickname});
			newMsg.save(function(err){
				if(err) throw err;
				io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
			});
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
