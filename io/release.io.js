var Activity = require('../models/activity.js');
var User = require('../models/user.js');
var Project = require('../models/project.js');
var Sprint = require('../models/sprint.js');
var Story = require('../models/story.js');
var BackLogsBugList = require('../models/backlogBuglist.js');

module.exports = function(socket, io) {

  socket.on('release:editSprint', function(data) {
    sprint = {
      name: data.name,
      endDate: data.endDate,
      startDate: data.startDate,
      description: data.description,
    };

    Sprint.updateSprint(data.sprintId, sprint, function(err, doc) {
      if (!err) {
        sprint._id = data.sprintId;
        io.to(data.room).emit('release:sprintEdited', sprint);

        var actData = {
          room: "activity:" + data.projectID,
          action: "changed",
          projectID: data.projectID,
          user: data.user,
          object: {
            name: data.oldName,
            type: "Sprint",
            _id: data.sprintId
          },
          target: {
            name: data.name,
            type: "Sprint",
            _id: data.sprintId
          }
        }
        Activity.addEvent(actData, function(data) {
          io.to(actData.room).emit('activityAdded', data);
        });
      }
    });

  });

  socket.on('release:addSprint', function(data) {
    var sprint = {
      name: data.name,
      endDate: data.endDate,
      startDate: data.startDate,
      desc: data.desc,
      list: data.list

    }
    Sprint.addSprint(sprint, function(err, doc) {
      if (!err) {
        Project.addSprint(data.projectId, data.releaseId, doc, function(err, subDoc) {
          if (!err) {
            io.to(data.room).emit('release:sprintAdded', doc);

            var actData = {
              room: 'activity:' + data.projectId,
              action: "added",
              projectID: data.projectId,
              user: data.user,
              object: {
                name: data.name,
                type: "Sprint",
                _id: doc._id
              },
              target: {
                name: data.releaseName,
                type: "Release",
                _id: subDoc._id
              }
            }
            Activity.addEvent(actData, function(data) {
              io.to(actData.room).emit('activityAdded', data);
            });
          } else
            console.log(err);
        });
      } else
        console.log(err);
    })
  });

  socket.on('deleteSprint', function(data) {
    Project.deleteSprint(data.projectId, data.releaseId, data.sprintId, function(err, doc) {
      if (!err)
        io.to(data.room).emit('sprintDeleted', {
          projectId: data.projectId,
          releaseId: data.releaseId,
          sprintId: data.sprintId
        });

      var actData = {
        room: "activity:" + data.projectId,
        action: "deleted",
        projectID: data.projectId,
        user: data.user,
        object: {
          name: data.sprintName,
          type: "Sprint",
          _id: data.sprintId
        },
        target: {
          name: data.releaseName,
          type: "Release",
          _id: data.releaseId
        }
      }
      Activity.addEvent(actData, function(data) {
        io.to(actData.room).emit('activityAdded', data);
      });
    })
  })

}
