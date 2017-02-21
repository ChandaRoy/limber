var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var groupSchema = new Schema({
  groupName:String,
  createdBy:{
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  channelId:String,
  members:[{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  projectId:String
});
// groupSchema.statics.addGroup=function(projMembers,channelId,callback)
// {
// this.({
//   "_id":projectId
// }).exec(function(err,data)
// {
//   if(!err)
//   callback(null,data);
// })
//
// }


groupSchema.statics.getGroupDetails = function(channelIds, callback) {

  this.find({"channelId":{$in : channelIds}})
  .exec(function(err, doc) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, doc);
    }
  });
}

groupSchema.statics.addMemberToGroup=function(projectId,memberList,callback){
  this.findOneAndUpdate({"projectId":projectId},
  {
    $addToSet: {
      "members": {
        $each: memberList
      }
    }
  },{
    upsert: true
  })
  .exec(function(err, doc) {
    if (err) {
      callback(err, null);
    } else {

      callback(null, doc);
    }
  });
}


var Group = mongoose.model('Group', groupSchema, 'Groups');
module.exports = Group;
