var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var channelSchema = new Schema({
groupId:String  //groupId
relation:String,
subject:[String] //array of members
});


var Channel = mongoose.model('Channel', channelSchema, 'Channels');
module.exports = Channel;
