var mongoose = require('mongoose');
var Schema = mongoose.Schema;
backlogBuglistSchema = new Schema({
  projectId: {
    type: Schema.ObjectId,
    ref: "Project"
  },
  backlogs: {
    listName: String,
    stories: [{
      type: Schema.ObjectId,
      ref: 'Story'
    }],
  },
  buglist: {
    listName: String,
    stories: [{
      type: Schema.ObjectId,
      ref: 'Story'
    }],
  }
});

backlogBuglistSchema.statics.addStoryBacklog = function(projectId, storyId, callback) {
  this.update({
      "projectId": projectId
    }, {
      $addToSet: {
        "backlogs.stories": storyId
      }
    }, {
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

backlogBuglistSchema.statics.findList = function(projectId, callback) {
  this.findOne({
      'projectId': projectId
    })
    .populate("backlogs.stories", "storyStatus heading indicators githubSync issueNumber")
    .populate("buglist.stories", "storyStatus heading indicators githubSync issueNumber")
    .exec(function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
}

backlogBuglistSchema.statics.deleteStoryBacklog = function(projectId, storyId, callback) {
  this.update({
      "projectId": projectId
    }, {
      $pull: {
        "backlogs.stories": storyId
      }
    }, {
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

backlogBuglistSchema.statics.deleteStoryBuglist = function(projectId, storyId, callback) {
  this.update({
      "projectId": projectId
    }, {
      $pull: {
        "buglist.stories": storyId
      }
    }, {
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

backlogBuglistSchema.statics.addStoryBuglist = function(projectId, storyId, callback) {
  this.update({
      "projectId": projectId
    }, {
      $addToSet: {
        "buglist.stories": storyId
      }
    }, {
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

backlogBuglist = mongoose.model('BacklogBuglist', backlogBuglistSchema, "backlogBuglist_collection");
module.exports = backlogBuglist;
