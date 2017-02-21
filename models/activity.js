var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


var activitySchema = new mongoose.Schema({
  action: String,
  projectID: Schema.Types.ObjectId,
  date: {
    type: Date,
    default: Date.now
  },
  userCreator: {
    fullName: String,
    photo:String,
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  object: {
    name: String,
    kind: String,
    _id: {
      type: Schema.Types.ObjectId,
      refPath: 'object.kind'
    }
  },
  target: {
    name: String,
    kind: String,
    _id: {
      type: Schema.Types.ObjectId,
      refPath: 'target.kind'
    }
  }
});

activitySchema.statics.addEvent = function(event, callback) {
  if (event.object == undefined)
    event.object = {};
  return this.create({
    action: event.action,
    projectID: event.projectID,
    userCreator: {
      fullName: event.user.fullName,
      _id: event.user._id,
      photo: event.user.photo
    },
    target: {
      name: event.target.name,
      kind: event.target.type,
      _id: event.target._id
    },
    object: {
      name: event.object.name,
      kind: event.object.type,
      _id: event.object._id
    },
  }, function(err, data) {
    if (err) callback(err)
    else callback(data);
  });
}

activitySchema.statics.findEventsbyStory = function(storyID, callback) {
  return this.find({
    $or: [{
      'target._id': storyID
    }, {
      'object._id': storyID
    }]
  }).sort({
    'date': -1
  }).exec(function(err, data) {
    if (err) callback(err)
    else callback(data);
  });
}

activitySchema.statics.findEventsbyProject = function(projectID, page, callback) {
  var perPage = 10;
  return this.find({
      'projectID': projectID
    }).sort({
      'date': -1
    }).limit(perPage).skip(perPage * (page-1)).exec(function(err, data) {
      if (err) callback(err)
      else callback(data);
    });
}



module.exports = mongoose.model('Activity', activitySchema, 'Activity');
