// var express = require('express'),
var		mongoose = require('mongoose')
		// app = express();

// var server = require('http').createServer(app);
//
// server.listen(3000);


//schema beginnings
//call mongoose -> connect to -> 'mongodb://'->'localhost'-> nameOf: (db) 'chat'
mongoose.connect('mongodb://localhost/chat', function(err){
	if(err){
		console.log(err);
		console.log('Problem connecting to mongodb.')
	}else{
		console.log('Connected.');
	}
});

// module.exports = chatConnect;
