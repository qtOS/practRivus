
var	mongoose = require('mongoose');

var logSchema = mongoose.Schema({
	prevUsers: Array
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
