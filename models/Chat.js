var express = require('express'),
		mongoose = require('mongoose'),
		app = express();

var logSchema = mongoose.Schema({
	email: String,
	password: String
})
//create the schema: var 'nameSchema' => 'mongoose' -> Schema
var chatSchema = mongoose.Schema({
	//nick is name of user
	nick: String,
	//msg from the user
	msg: String,
	//time stamp
	created: {type: Date, default: Date.now},

  chatLogs: [logSchema]

});

module.exports = mongoose.model('Chat', chatSchema);
