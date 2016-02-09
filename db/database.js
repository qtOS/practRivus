//require('dotenv').load();


var	mongoose = require('mongoose');
//call mongoose -> connect to -> 'mongodb://'->'localhost'-> nameOf: (db) 'chat'
//var connectionString = process.env.DATABASE_URL || process.env.MONGOLAB_URI;
var connectionString = 'mongodb://localhost/chat';
if (process.env.NODE_ENV === 'production') {
		connectionString = process.env.MONGOLAB_URI;
}

mongoose.connect(connectionString, function(err){
	if(err){
		console.log(err);
		console.log('Problem connecting to mongodb.')
	}else{
		console.log('Connected.');
	}
});

mongoose.connection.on('error', function(err) {
  console.log(err);
});

mongoose.connection.on('disconnected', function() {
  console.log('disconnection in database.js');
});

// module.exports = chatConnect;
