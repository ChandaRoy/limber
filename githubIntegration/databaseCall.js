var Activity = require('../models/activity.js');
var User = require('../models/user.js');
var Project = require('../models/project.js');
var Sprint = require('../models/sprint.js');
var Story = require('../models/story.js');
var BackLogsBugList = require('../models/backlogBuglist.js');
var Template = require('../models/template.js');
var queue= require('../redis/queue.js');
var GithubRepo = require('../models/githubRepo.js');
var io= require("../io/io.js");

module.exports=
{

addMember:function(data)
{
  Story.addMembers(data.storyid, data.memberid, function(err, doc) {

    //edited for cards page

    if (!err) {

      Story.findById(data.storyid).exec(function(err, storyData) {
        if (!err) {
          var members = {
            _id: storyData._id,
            memberList: doc.memberList
          }

          io.to(data.room).emit('story:membersModified',members);
          io.to(data.room).emit('story:membersModifiedOnItem',{"storyId":storyData._id,"memberList":storyData.memberList});

          io.to(data.room).emit('story:dataModified', storyData);


          var actData = {
            room: "activity:" + data.projectID,
            action: "added",
            projectID: data.projectID,
            user: data.user,
            object: {
              name: data.fullName,
              type: "User",
              _id: data.memberid
            },
            target: {
              name: storyData.heading,
              type: "Story",
              _id: storyData._id
            }
          }
          Activity.addEvent(actData, function(data) {
            io.to(actData.room).emit('activityAdded', data);
          });
        }
      });
    }
  })

  User.addAssignedStories(data, function(err, doc) {
    io.to(data.memberid).emit('story:memberAssigned',doc);
   })

},
removeMember: function(data){
  Story.removeMembers(data.storyid, data.memberid, function(err, storyData) {

        if (!err) {
          io.to(data.room).emit('story:dataModified', storyData);
          var members = {
            _id: storyData._id,
            memberList: storyData.memberList
          }
          io.to(data.room).emit('story:membersModified', members);

          var actData = {
            room: "activity:" + data.projectID,
            action: "removed",
            projectID: data.projectID,
            user: data.user,
            object: {
              name: data.fullName,
              type: "User",
              _id: data.memberid
            },
            target: {
              name: storyData.heading,
              type: "Story",
              _id: storyData._id
            }
          }
          Activity.addEvent(actData, function(data) {
            io.to(actData.room).emit('activityAdded', data);
          });
    }
  })

User.removeAssignedStories(data.memberid,data.storyid, function(err, doc) {
io.to(data.memberid).emit('story:memberRemoved',doc);
})
},


//Updating the user schema ehen a member is added for cards





moveStory: function(data){
  Sprint.addStory(data.sprintId, data.newListId, data.storyId, function(err, addStoryData) {
    if (addStoryData.nModified == 1) { //If add is succesful

      //Adding below line for moving card across release
      var sprintId = data.sprintId;

      if (data.isReleaseMove != undefined) {
        sprintId = data.oldSprintId;
      }

      Sprint.deleteStory(sprintId, data.oldListId, data.storyId, function(err, delStoryData) {
        if (delStoryData.nModified == 1) { //If delete is succesful
          Story.findById(data.storyId, function(err, storyData) {
            data.story = storyData;
            io.to(data.room).emit('sprint:storyMoved', data);
            //socket.emit('sprint:storyActivity', data)
            var actData = {
              room: 'activity:' + data.projectID,
              action: "moved",
              projectID: data.projectID,
              object: {
                name: data.story.heading,
                type: "Story",
                _id: data.story._id
              },
              target: {
                name: data.newListName,
                type: "List",
                _id: data.story._id
              },
              user:data.user
            }
            Activity.addEvent(actData, function(data) {
              io.to(actData.room).emit('activityAdded', data);
            });
          });
        } else { //reverting changes
          //console.log("Couldn't delete story", socket.id);
          Sprint.deleteStory(data.sprintId, data.newListId, data.storyId, function(err, delStoryData) {
            if (err) console.log("Duplicate story created ", data.storyId);
            else {
              //console.log("Deleted previously added story", socket.id);
            }

          });
        }
      })
    }
  });
},
moveFromBackbug: function(data){
  if (data.oldListId == "backlogs") {

    Sprint.addStory(data.sprintId, data.newListId, data.storyId, function(err, addStoryData) {
      if (addStoryData.nModified == 1) { //If add is succesful
        BackLogsBugList.deleteStoryBacklog(data.projectID, data.storyId, function(err, delStoryData) {
          if (delStoryData.nModified == 1) { //If delete is succesful
            if(data.newListName!=='')
            Story.updateList(data.storyId,data.newListName,function(err,updateStoryData){
              if(err) console.log("could not update");
              else console.log(updateStoryData);
            })
            Story.findById(data.storyId, function(err, storyData) {
              data.story = storyData;
              io.to(data.room).emit('sprint:backbugStoryMovedFrom', data);
              //socket.emit('sprint:storyActivity', data)
              var actData = {
                room: 'activity:' + data.projectID,
                action: "moved",
                projectID: data.projectID,
                object: {
                  name: data.story.heading,
                  type: "Story",
                  _id: data.story._id
                },
                target: {
                  name: data.newListName,
                  type: "List",
                  _id: data.story._id
                },
                user:data.user
              }
              Activity.addEvent(actData, function(data) {
                io.to(actData.room).emit('activityAdded', data);
              });

            });
          } else { //reverting changes
            console.log("Couldn't delete story");
            Sprint.deleteStory(data.sprintId, data.newListId, data.storyId, function(err, delStoryData) {
              // if (err) //console.log("Duplicate story created ", data.storyId);
              // else {
              //   //console.log("Deleted previously added story", socket.id);
              // }

            });
          }
        })
      }
    });
  } else if (data.oldListId == "buglists") {
    Sprint.addStory(data.sprintId, data.newListId, data.storyId, function(err, addStoryData) {
      if (addStoryData.nModified == 1) { //If add is succesful
        BackLogsBugList.deleteStoryBuglist(data.projectID, data.storyId, function(err, delStoryData) {
          if (delStoryData.nModified == 1) { //If delete is succesful
            if(data.newListName!=='')
            Story.updateList(data.storyId,data.newListName,function(err,updateStoryData){
              if(err) console.log("could not update");
              else console.log(updateStoryData);
            })
            Story.findById(data.storyId, function(err, storyData) {
              data.story = storyData;
              io.to(data.room).emit('sprint:backbugStoryMovedFrom', data);
              //socket.emit('sprint:storyActivity', data)
              var actData = {
                room: 'activity:' + data.projectID,
                action: "moved",
                projectID: data.projectID,
                object: {
                  name: data.story.heading,
                  type: "Story",
                  _id: data.story._id
                },
                target: {
                  name: data.newListName,
                  type: "List",
                  _id: data.story._id
                },
                user:data.user
              }
              Activity.addEvent(actData, function(data) {
                io.to(actData.room).emit('activityAdded', data);
              });

            });
          } else { //reverting changes
            console.log("Couldn't delete story");
            Sprint.deleteStory(data.sprintId, data.newListId, data.storyId, function(err, delStoryData) {
              // if (err) //console.log("Duplicate story created ", data.storyId);
              // else {
              //   //console.log("Deleted previously added story", socket.id);
              // }

            });
          }
        })
      }
    });
  }
},

moveToBackBug: function(data){
  if (data.newListId == "backlogs") {

    BackLogsBugList.addStoryBacklog(data.projectID, data.storyId, function(err, addStoryData) {
      if (addStoryData.nModified == 1) { //If add is succesful
        Sprint.deleteStory(data.sprintId, data.oldListId, data.storyId, function(err, delStoryData) {
          if (delStoryData.nModified == 1) { //If delete is succesful
            if(data.newListName!=='')
            Story.updateList(data.storyId,data.newListName,function(err,updateStoryData){
              if(err) console.log("could not update");
              else console.log(updateStoryData);
            })
            Story.findById(data.storyId, function(err, storyData) {
              data.story = storyData;
              io.to(data.room).emit('sprint:backbugStoryMovedTo', data);
              //socket.emit('sprint:storyActivity', data)
              var actData = {
                room: 'activity:' + data.projectID,
                action: "moved",
                projectID: data.projectID,
                object: {
                  name: data.story.heading,
                  type: "Story",
                  _id: data.story._id
                },
                target: {
                  name: data.newListName,
                  type: "List",
                  _id: data.story._id
                },
                user:data.user
              }
              Activity.addEvent(actData, function(data) {
                io.to(actData.room).emit('activityAdded', data);
              });

            });
          } else { //reverting changes
            console.log("Couldn't delete story");
            BackLogsBugList.deleteStoryBacklog(data.projectID, data.storyId, function(err, delStoryData) {
              // if (err) console.log("Duplicate story created ", data.storyId);
              // else {
              //   console.log("Deleted previously added story", socket.id);
              // }

            });
          }
        })
      }
    });


  } else if (data.newListId == "buglists") {

    BackLogsBugList.addStoryBuglist(data.projectID, data.storyId, function(err, addStoryData) {
      if (addStoryData.nModified == 1) { //If add is succesful
        Sprint.deleteStory(data.sprintId, data.oldListId, data.storyId, function(err, delStoryData) {
          if (delStoryData.nModified == 1) { //If delete is succesful
            if(data.newListName!=='')
            Story.updateList(data.storyId,data.newListName,function(err,updateStoryData){
              if(err) console.log("could not update");
              else console.log(updateStoryData);
            })
            Story.findById(data.storyId, function(err, storyData) {
              data.story = storyData;
              io.to(data.room).emit('sprint:backbugStoryMovedTo', data);
              //socket.emit('sprint:storyActivity', data)
              var actData = {
                room: 'activity:' + data.projectID,
                action: "moved",
                projectID: data.projectID,
                object: {
                  name: data.story.heading,
                  type: "Story",
                  _id: data.story._id
                },
                target: {
                  name: data.newListName,
                  type: "List",
                  _id: data.story._id
                },
                user:data.user
              }
              Activity.addEvent(actData, function(data) {
                io.to(actData.room).emit('activityAdded', data);
              });
            });
          } else { //reverting changes
            console.log("Couldn't delete story");
            BackLogsBugList.deleteStoryBuglist(data.projectID, data.storyId, function(err, delStoryData) {
              // if (err) console.log("Duplicate story created ", data.storyId);
              // else {
              //   console.log("Deleted previously added story", socket.id);
              // }

            });
          }
        })
      }
    });

  }
}

}
