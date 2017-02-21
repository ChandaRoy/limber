var Activity = require('../models/activity.js');
var User = require('../models/user.js');
var Project = require('../models/project.js');
var Sprint = require('../models/sprint.js');
var Story = require('../models/story.js');
var BackLogsBugList = require('../models/backlogBuglist.js');

module.exports = function(socket, io) {
  socket.on('project:addRelease', function(data) {
    release = {
      name: data.name,
      description: data.desc,
      creationDate: Date.now(),
      releaseDate: data.dt
    };
    Project.addRelease(data.projectID, release, function(err, doc) {
      if (!err) {

        //Emit to all the users in the project.
        doc.memberList.forEach(function(userID){
          var room = "user:"+ userID;
          io.to(room).emit('project:releaseAdded', doc);
        })

        var actData = {
          room: "activity:" + data.projectID,
          action: "added",
          projectID: data.projectID,
          user: data.user,
          object: {
            name: data.name,
            type: "Release",
            _id: doc._id
          },
          target: {
            name: doc.name,
            type: "Project",
            _id: doc._id
          }
        }
        Activity.addEvent(actData, function(data) {
          io.to(actData.room).emit('activityAdded', data);
        });
      }
    });

  });

  socket.on('project:editProject', function(data) {
    newProject = {
      name:data.name,
      description:data.description,
    };
    Project.updateProject(data.prId, newProject, function (err, doc) {
      if (!err) {
        newProject._id = data.prId;
        doc.memberList.forEach(function(userID){
          var room = "user:"+ userID;
          io.to(room).emit('project:projectEdited', newProject);
        });
      }
    });
  });
  socket.on('project:editRelease', function(data) {
    release = {
      name: data.name,
      description: data.description,
      creationDate: data.creationDate,
      releaseDate: data.releaseDate
    };

    Project.updateRelease(data.projectId, data.releaseId, release, function(err, doc) {
      if (!err) {
        release._id = data.releaseId;
        release.prId = data.projectId;

        doc.memberList.forEach(function(userID){
          var room = "user:"+ userID;
          io.to(room).emit('project:releaseEdited', release);
        })

        var actData = {
          room: "activity:" + data.projectId,
          action: "changed",
          projectID: data.projectId,
          user: data.user,
          object: {
            name: data.oldReleaseName,
            type: "Release",
            _id: data.releaseId
          },
          target: {
            name: release.name,
            type: "Release",
            _id: data.releaseId
          }
        }
        Activity.addEvent(actData, function(data) {
          io.to(actData.room).emit('activityAdded', data);
        });
      }
    });

  });

  socket.on('deleteRelease', function(data) {
    Project.deleteRelease(data.projectId, data.releaseId, function(err, doc) {
      if (!err) {

        doc.memberList.forEach(function(userID){
          var room = "user:"+ userID;
          io.to(room).emit('releaseDeleted', {
            projectId: data.projectId,
            releaseId: data.releaseId
          });
        })

        var actData = {
          room: data.activityRoom,
          action: "deleted",
          projectID: data.projectId,
          user: data.user,
          object: {
            name: data.releaseName,
            type: "Release",
            _id: data.releaseId
          },
          target: {
            name: data.projectName,
            type: "Project",
            _id: data.projectId
          }
        }
        Activity.addEvent(actData, function(data) {
          io.to(actData.room).emit('activityAdded', data);
        });
      }

    });

  });
}
