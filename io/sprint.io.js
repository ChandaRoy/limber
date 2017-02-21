var Activity = require('../models/activity.js');
var User = require('../models/user.js');
var Project = require('../models/project.js');
var Sprint = require('../models/sprint.js');
var Story = require('../models/story.js');
var BackLogsBugList = require('../models/backlogBuglist.js');
var queue= require('../redis/queue.js');
var GithubRepo = require('../models/githubRepo.js');
var api_calls = require('../routes/github-api.js');

module.exports = function(socket, io) {

  socket.on('sprint:moveStory', function(data) {
    Story.findIssue(data.storyId,function(err,storyData){

      if(!err){
        var issue={};
        GithubRepo.getRepo(data.projectID,function(err,repoData){
          if(!err && repoData){
            if(storyData.issueNumber){
              if(data.newListName==="Releasable"){
                issue.message={

                  'state':"closed"
                }
              }
              else
              if(data.newListName==="buglists"){
                issue.message={

                  'state': "open"
                }
              }
              else
              {
                issue.message={

                  'state': "open"
                }
              }
              issue.repo_details=repoData;
              issue.github_profile=data.github_profile;
              issue.issueNumber=storyData.issueNumber;
              queue.editStory.add(issue);
            }
          }
        })
      }
    })
    //Adding story in new list, then deleting from old list

    Sprint.addStory(data.sprintId, data.newListId, data.storyId, function(err, addStoryData) {
      if (addStoryData.nModified == 1) { //If add is succesful

        //Adding below line for moving card across release
        var sprintId = data.sprintId;

        if (data.isReleaseMove != undefined) {
          sprintId = data.oldSprintId;
        }

        Sprint.deleteStory(sprintId, data.oldListId, data.storyId, function(err, delStoryData) {
          if (delStoryData.nModified == 1) { //If delete is succesful
            if(data.newListName!=='')
            Story.updateList(data.storyId,data.newListName,function(err,updateStoryData){
              if(err) console.log("could not update");
              else console.log(updateStoryData);
            })
            Story.findById(data.storyId, function(err, storyData) {
              data.story = storyData;
              io.to(data.room).emit('sprint:storyMoved', data);
              socket.emit('sprint:storyActivity', data)
            });
          } else { //reverting changes
            Sprint.deleteStory(data.sprintId, data.newListId, data.storyId, function(err, delStoryData) {
              if (err) console.log("Duplicate story created ", data.storyId);
              else {
              }

            });
          }
        })
      }
    });


  });

  // TODO:  Write a better unified logic for moving story across back-bug lists

  socket.on('sprint:moveToBackbugStory', function(data) {
    //Adding story in new list, then deleting from old list
    Story.findIssue(data.storyId,function(err,storyData){

      if(!err){
        var issue={};
        GithubRepo.getRepo(data.projectID,function(err,repoData){
          if(!err && repoData){
            if(storyData.issueNumber){
              if(data.newListName==="Releasable"){
                issue.message={

                  'state':"closed"
                }
              }
              else
              if(data.newListName==="buglists"){
                issue.message={

                  'state': "open"
                }
              }
              else
              {
                issue.message={

                  'state': "open"
                }
              }
              issue.repo_details=repoData;
              issue.github_profile=data.github_profile;
              issue.issueNumber=storyData.issueNumber;
              queue.editStory.add(issue);
            }
          }
        })
      }
    })
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
                socket.emit('sprint:storyActivity', data)

              });
            } else { //reverting changes
              BackLogsBugList.deleteStoryBacklog(data.projectID, data.storyId, function(err, delStoryData) {
                if (err) console.log("Duplicate story created ", data.storyId);
                else {
                  console.log("Deleted previously added story", socket.id);
                }

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
                socket.emit('sprint:storyActivity', data)

              });
            } else { //reverting changes
              BackLogsBugList.deleteStoryBuglist(data.projectID, data.storyId, function(err, delStoryData) {
                if (err) console.log("Duplicate story created ", data.storyId);
                else {
                  console.log("Deleted previously added story", socket.id);
                }

              });
            }
          })
        }
      });

    }
  });

  socket.on('sprint:moveFromBackbugStory', function(data) {
    Story.findIssue(data.storyId,function(err,storyData){

      if(!err){
        var issue={};
        GithubRepo.getRepo(data.projectID,function(err,repoData){
          if(!err && repoData){
            if(storyData.issueNumber){
              if(data.newListName==="Releasable"){
                issue.message={

                  'state':"closed"
                }
              }
              else
              if(data.newListName==="buglists"){
                issue.message={

                  'state': "open"
                }
              }
              else
              {
                issue.message={

                  'state': "open"
                }
              }
              issue.repo_details=repoData;
              issue.github_profile=data.github_profile;
              issue.issueNumber=storyData.issueNumber;
              queue.editStory.add(issue);
            }
          }
        })
      }
    })
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
                socket.emit('sprint:storyActivity', data)

              });
            } else { //reverting changes
              Sprint.deleteStory(data.sprintId, data.newListId, data.storyId, function(err, delStoryData) {
                if (err) console.log("Duplicate story created ", data.storyId);
                else {
                  console.log("Deleted previously added story", socket.id);
                }

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
                socket.emit('sprint:storyActivity', data)

              });
            } else { //reverting changes
              Sprint.deleteStory(data.sprintId, data.newListId, data.storyId, function(err, delStoryData) {
                if (err) console.log("Duplicate story created ", data.storyId);
                else {
                  console.log("Deleted previously added story", socket.id);
                }

              });
            }
          })
        }
      });
    }
  })

  socket.on('sprint:deleteStory', function(data) {
    Story.deleteStory(data.storyId, function(err, delData) {
      if (!err) {
        var error = false;
        if (data.deleteFrom == 'Backlog') {
          BackLogsBugList.deleteStoryBacklog(data.projectId, data.storyId, function(err, delDataFrom) {
            error = err;
          });
        } else if (data.deleteFrom == 'Buglist') {
          BackLogsBugList.deleteStoryBuglist(data.projectId, data.storyId, function(err, delDataFrom) {
            error = err;
          });
        } else {
          Sprint.deleteStory(data.sprintId, data.Listid, data.storyId, function(err, delDataFrom) {
            error = err;
          });
        }

        if (!error) {
          var storyData = {
            'deleteFrom': data.deleteFrom,
            'storyId': data.storyId,
            'projectId': data.projectId,
            'Listid': data.Listid,
            'sprintId': data.sprintId
          };
          io.to(data.room).emit('sprint:storyDeleted', storyData);

          var actData = {
            room: "activity:" + data.projectId,
            action: "removed",
            projectID: data.projectId,
            user: data.user,
            object: {
              name: data.storyName,
              type: "Story",
              _id: data.storyId
            },
            target: {
              name: data.deleteFrom,
              type: "List",
              _id: data.storyId
            }
          }
          Activity.addEvent(actData, function(data) {
            io.to(actData.room).emit('activityAdded', data);
          });
        }
      }
    });

  });

  socket.on('sprint:addStory', function(data) {
    console.log(data);
    var story = {
      heading: data.heading,
      addTo: data.addTo,
      storyStatus: data.storyStatus,
      heading: data.heading,
      description: data.description,
      listId: data.listId,
      storyCreatorId:data.user,
      projectId:data.projectId
    }
    GithubRepo.getRepo(data.projectId,function(err,repoData){
      if(!err && repoData){
        story.githubSync=repoData._id;
        if(data.github_profile.id){
          var issue={}
          issue.message={
            'title': data.heading,

          }
          issue.github_profile=data.github_profile;
          issue.repo_details=repoData;
          var options={
            url:"https://api.github.com/repos/"+repoData.owner+"/"+repoData.name+"/issues?access_token="+data.github_profile.token,
            headers:{
              "content-type":'application/json',
              "User-Agent":'Limber'
            },
            json:issue.message
          };
          api_calls.postIssue(options,function(error,response,body){
            if(!error && response.statusCode===201 ){
              console.log(body);
              story.issueNumber=body.number;
              saveStory(data,story);
            }

          })
        }
        else {
          saveStory(data,story);
        }
      }
      else saveStory(data,story);
    })

  })




  function saveStory(data,story){
    Story.addStory(story, function(err, storyData) {
      if (!err) {
        var actData = {
          room: data.activityRoom,
          action: "added",
          projectID: data.projectId,
          user: data.user,
          object: {
            name: data.heading,
            type: "Story",
            _id: ""
          },
          target: {
            name: data.listName,
            type: "List",
            _id: data.id
          }
        }

        if (data.addTo == "Backlogs") {
          BackLogsBugList.addStoryBacklog(data.projectId, storyData._id, function(err, subDoc) {
            if (!err) {
              io.to(data.room).emit('sprint:storyAdded', storyData);
              actData.object._id = storyData._id;
              Activity.addEvent(actData, function(data) {
                io.to(data.activityRoom).emit('activityAdded', data);
              });

            } else
            console.log(err);
          })
        } else if (data.addTo == "BugLists") {
          BackLogsBugList.addStoryBuglist(data.projectId, storyData._id, function(err, subDoc) {
            if (!err) {
              io.to(data.room).emit('sprint:storyAdded', storyData);
              actData.object._id = storyData._id
              Activity.addEvent(actData, function(data) {
                io.to(data.activityRoom).emit('activityAdded', data);
              });
            } else

            console.log(err);
          })
        } else {
          Sprint.addStory(data.sprintId, data.id, storyData._id, function(err, subDoc) {
            if (!err) {

              actData.object._id = storyData._id

              //FIXME: Not able to add new property to storyData :(
              //storyData.listIdAdded = data.id;
              //console.log(storyData);
              storyData.listId = data.id

              io.to(data.room).emit('sprint:storyAdded', storyData);

              Activity.addEvent(actData, function(data) {
                io.to(actData.room).emit('activityAdded', data);
              });

            } else
            console.log(err);
          })
        }


      } else
      console.log(err);
    });

  }
}
