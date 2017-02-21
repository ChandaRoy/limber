var mongoose = require('mongoose'),
  teamSchema = new mongoose.Schema({
    teamName: String,
    userCount: Number,
    creteadBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdOn: Date,
    userList:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  });

  teamSchema.statics.createTeam = function(userIDs,teamName,createdBy,callback){
    this.create({
      teamName:teamName,
      userCount:userIDs.length,
      createdBy:createdBy,
      userList:userIDs,
      createdOn:Date.now()
    },function(err, data) {
      if (err) callback(err)
      else callback(data);
    });
  }

  teamSchema.statics.addUser = function(userID,teamID,callback){
    this.findByIdAndUpdate(userID, {
      $push: {
        'userID': userID
      },
      $inc: {
        'userCount' : 1
      }
    }, function(err, data) {
      if (err) callback(err)
      else callback(data);
    })
  }

  teamSchema.statics.removeUser = function(userID,teamID,callback){
    this.findByIdAndUpdate(userID, {
      $pull: {
        'userID': userID
      },
      $inc: {
        'userCount' : -1
      }
    }, function(err, data) {
      if (err) callback(err)
      else callback(data);
    })
  }

  module.exports = mongoose.model('Team', teamSchema, 'Team');;
