var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/***label schema is required so that we can give the
reference for sub document in sprint schema***/
var labelSchema = new Schema({
  text: String,
  colorCode: String,
  colorName:String
});

var labelTemplateSchema = new Schema({
  text: String,
  colorCode: String,
  colorName:String
});
var sprintSchema = new Schema({
  name: String,
  endDate: Date,
  startDate: Date,
  description: String,
  labelsData: [labelSchema],//Renamed this from labelTemplate.. change it in corressponding codes
  labelTemplate:[labelTemplateSchema], //This it to store the stagnant data of the label templates and show it in sub modal
  list: [{
    group: String,
    listName: String,
    stories: [{type : Schema.Types.ObjectId, ref : 'Story'}]
  }]
});

//TODO:update the functionality of deleteList properly
sprintSchema.statics.deleteList = function(sprintId, listId, callback) {
  this.remove({
      "_id": sprintId,
      "release._id": releaseId
    })
    .exec(function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
}

// Adds a new sprint in the SprintsCollection
sprintSchema.statics.addSprint = function(sprint, callback) {
   this.create({
      'name': sprint.name,
      'endDate': sprint.endDate,
      'startDate': sprint.startDate,
      'description': sprint.desc,
      'list': sprint.list
        // TODO MORE
    },
    function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
}

sprintSchema.statics.updateSprint = function(sprintId, newSprint, callback) {
  this.update({
      "_id": sprintId
    }, {
      $set: {
        name: newSprint.name,
        endDate: newSprint.endDate,
        startDate: newSprint.startDate,
        description: newSprint.description,
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

sprintSchema.statics.findSprint = function(sprintId, callback) {
  this.findOne({
      "_id": sprintId
    })
    .populate("list.stories")
    .exec(function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
}

sprintSchema.statics.addStory = function(sprintId, listId, storyId, callback) {
  this.update({
      "_id": sprintId,
      "list._id": listId
    }, {
      $push: {
        "list.$.stories": storyId
      }
    }, {
      upsert: true
    })
    .exec(function(err, doc) {
      console.log("in adding story",err,doc);
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
}

sprintSchema.statics.deleteStory = function(sprintId, listId, storyId, callback) {
  this.update({
      "_id": sprintId,
      "list._id": listId
    }, {
      $pull: {
        "list.$.stories": storyId
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

sprintSchema.statics.findSprintForStory = function(storyId, callback) {
  this.findOne({

      "list.stories": storyId
    })
    .select("list.$")
    .exec(function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
}

sprintSchema.statics.findReleasableListId = function(sprintId,group, callback) {
  this.findOne({

      "_id": sprintId,
      "list.group":group
    })
    .select("list.$")
    .exec(function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
}


sprintSchema.statics.findCurrentSprint = function(sprintIds, callback) {
  this.aggregate({
    "$match":{
      "_id":{$in:sprintIds}
    }
  },{
    "$match":{
      "startDate":{$lte: new Date()},
      "endDate":{$gte:new Date()}
    }
  })

    .exec(function(err, doc) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, doc);
      }
    });
}

var release = mongoose.model('Sprint', sprintSchema, "Sprints");
module.exports = release;
