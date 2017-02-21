var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var personalSchema = new Schema({
subject:[String],
relation:String,
object:String,
projectId:String
});

personalSchema.statics.findMatchedSubject = function(projectId,memberList, callback) {
  this.findOne({
      "projectId": projectId,
      "subject": {"$size":2,"$all":memberList}
    })
    .exec(function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
}

personalSchema.statics.getChannelMembers = function(channelId, callback) {
  this.findOne({
      "object": channelId,
    })
    .exec(function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
}

var Personal = mongoose.model('Personal', personalSchema, 'Personal');
module.exports = Personal;
