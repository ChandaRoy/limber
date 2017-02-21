var Activity = require('../models/activity.js');
var User = require('../models/user.js');
var Project = require('../models/project.js');
var Sprint = require('../models/sprint.js');
var Story = require('../models/story.js');
var BackLogsBugList = require('../models/backlogBuglist.js');
var Template = require('../models/template.js');
var queue= require('../redis/queue.js');
var GithubRepo = require('../models/githubRepo.js');
var githubCall=require('../githubIntegration/githubCall.js');
var databaseCall=require('../githubIntegration/databaseCall.js');
module.exports = function(socket, io) {
  socket.on('story:removeLabel', function(data) {
    Story.removeLabel(data.storyid, data.labelid, function(err, storyData) {
      if (!err) {
        io.to(data.room).emit('story:dataModified', storyData);

        var actData = {
          room: "activity:" + data.projectID,
          action: "removed",
          projectID: data.projectID,
          user: data.user,
          object: {
            name: data.colorName,
            type: "Sprint",
            _id: data.storyid
          },
          target: {
            name: storyData.heading,
            type: "Story",
            _id: data.storyid
          }
        }
        Activity.addEvent(actData, function(data) {
          io.to(actData.room).emit('activityAdded', data);
        });
      }
    });
  })
  socket.on('story:addLabel', function(data) {
    Story.addLabel(data.storyid, data.labelid, function(err, storyData) {
      if (!err) {
        io.to(data.room).emit('story:dataModified', storyData);

        var actData = {
          room: "activity:" + data.projectID,
          action: "marked",
          projectID: data.projectID,
          user: data.user,
          target: {
            name: data.colorName,
            type: "Sprint",
            _id: data.storyid
          },
          object: {
            name: storyData.heading,
            type: "Story",
            _id: data.storyid
          }
        }
        Activity.addEvent(actData, function(data) {
          io.to(actData.room).emit('activityAdded', data);
        });

      }
    });
  })
  socket.on('story:addNewLabel', function(data) {
    Template.addNewLabel(data.labelid, data.labelObj, function(err, doc) {
      if (!err) {
        data.labelObj._id = data.storyID
        io.to(data.room).emit('story:labelsModified',data.labelObj);
      }
    });
  })

  /***
  description:listner to add members to story
  ****/
  socket.on('story:addMembers', function(data) {
    var atTheTimeOfIntegration=data.atTheTimeOfIntegration;
    githubCall.editStory(data);

  databaseCall.addMember(data);
  })

  /****
  description:listner to remove members from story
  ****/
  socket.on('story:removeMembers', function(data) {

    Story.findIssue(data.storyid,function(err,storyData){

      if(!err){
        var assignees=[];
        var issue={};
      GithubRepo.getRepo(storyData.projectId,function(err,repoData){
        if(!err && repoData){
          if(storyData.issueNumber){
            User.getUserMember(data.memberid,function(error,memberData){
              if(!error){
                  if(memberData.github){
                storyData.memberList.forEach(function(member){
                  if(member.github){
                    assignees.push(member.github.name)
                  }
                  else{
                    console.log("Not having github profile",member);
                  }
                })
                //assignees.push(memberData.github.name);
              }
              if(assignees){
                var index=assignees.indexOf(memberData.github.name);
                if(index>-1){
                  assignees.splice(index,1);

              issue.message={
                'assignees':assignees
              }
              issue.repo_details=repoData;
              issue.github_profile=data.github_profile;
              issue.issueNumber=storyData.issueNumber;
              queue.editStory.add(issue);
            }
          }
            }
            })


      }
    }
  })
    }
    })

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
  })

  /****
  description:listner to addnew checklist group to story
  ****/
  socket.on('story:addChecklistGroup', function(data) {
    Story.addChecklistGroup(data.storyid, data.checklistGrp, function(err, doc) {
      if (!err) {
        Story.findById(data.storyid).populate("memberList").exec(function(err, storyData) {
          if (!err) {
            io.to(data.room).emit('story:dataModified', storyData);

            var actData = {
              room: "activity:" + data.projectID,
              action: "added",
              projectID: data.projectID,
              user: data.user,
              object: {
                name: data.checklistGrp.checklistHeading,
                type: "Story",
                _id: data.storyid
              },
              target: {
                name: storyData.heading,
                type: "Story",
                _id: data.storyid
              }
            }
            Activity.addEvent(actData, function(data) {
              io.to(actData.room).emit('activityAdded', data);
            });
          }
        });
      }
    })
  })

  /****
  description:listner to addnew item to checklist group in a story
  ****/


  socket.on('story:addChecklistItem', function(data) {
      data.itemObj.creatorName = data.user.fullName;
      data.itemObj.createdBy = data.user._id;
      Story.addChecklistItem(data.storyid, data.checklistGrpId, data.itemObj, function(err, doc) {
        if (!err) {
          Story.findById(data.storyid).populate("memberList").exec(function(err, storyData) {
            if (!err) {
              io.to(data.room).emit('story:dataModified', storyData);

              var actData = {
                room: "activity:" + data.projectID,
                action: "added",
                projectID: data.projectID,
                user: data.user,
                object: {
                  name: data.text,
                  type: "Story",
                  _id: data.checklistGrpId
                },
                target: {
                  name: storyData.heading,
                  type: "Story",
                  _id: data.storyid
                }

              }
            }
            Activity.addEvent(actData, function(data) {


              io.to(actData.room).emit('activityAdded', data);
            });

        });
      }
    })
})
  /****
  description:listner to remove item to checklist group in a story
  ****/
/****
    description:listner to remove item to checklist group in a story
    ****/
    // socket.on('story:removeChecklistItem', function(data) {
    //     Story.removeItem(data.storyid, data.checklistGrpId, data.itemid, data.checked, function(err, doc) {
    //       if (!err) {
    //         //user.userID
    //         Story.findById(data.storyid).populate("memberList").exec(function(err, storyData) {
    //           if (!err) {
    //             io.to(data.room).emit('story:dataModified', storyData);
    //
    //             var actData = {
    //               room: "activity:" + data.projectID,
    //               action: "added",
    //               projectID: data.projectID,
    //               user: data.user,
    //               object: {
    //                 name: data.text,
    //                 type: "Story",
    //                 _id: data.checklistGrpId
    //               },
    //               target: {
    //                 name: storyData.heading,
    //                 type: "Story",
    //                 _id: data.storyid
    //               }
    //             }
    //             Activity.addEvent(actData, function(data) {
    //               io.to(actData.room).emit('activityAdded', data);
    //             });
    //           }
    //         });
    //       }
    //     })
    //   })



  socket.on('story:removeChecklistItem', function(data) {
    Story.removeChecklistItem(data.storyid, data.checklistGrpId, data.itemid, data.checked, function(err, doc) {
      if (!err) {
        //user.userID
        Story.findById(data.storyid).populate("memberList").exec(function(err, storyData) {
          if (!err) {
            io.to(data.room).emit('story:dataModified', storyData);

            var actData = {
              room: "activity:" + data.projectID,
              action: "added",
              projectID: data.projectID,
              user: data.user,
              object: {
                name: data.text,
                type: "Story",
                _id: data.checklistGrpId
              },
              target: {
                name: storyData.heading,
                type: "Story",
                _id: data.storyid
              }
            }
            Activity.addEvent(actData, function(data) {
              io.to(actData.room).emit('activityAdded', data);
            });
          }
        });
      }
    })
  })
    /****
    description:listner to remove item to checklist group in a story
    ****/
  socket.on('story:removeChecklistGroup', function(data) {
      Story.removeChecklistGroup(data.storyid, data.checklistGrpId,data.checkedCount,data.itemsLength,function(err, doc) {
        if (!err) {
          //user.userID
          Story.findById(data.storyid).populate("memberList").exec(function(err, storyData) {
            if (!err) {
              io.to(data.room).emit('story:dataModified', storyData);

              var actData = {
                room: "activity:" + data.projectID,
                action: data.checked == true ? "completed" : "unchecked",
                projectID: data.projectID,
                user: data.user,
                object: {
                  name: data.text,
                  type: "Story",
                  _id: data.checklistGrpId
                },
                target: {
                  name: storyData.heading,
                  type: "Story",
                  _id: data.storyid
                }
              }
              Activity.addEvent(actData, function(data) {
                io.to(actData.room).emit('activityAdded', data);
              });
            }
          });
        }
      })
    })


//get a story based on storyid after an item added or removed in checklist to update the memberarray in storyController
  socket.on("story:findStory",function(data)
  {
    Story.findStory(data.storyId,function(err,doc)
  {
    io.to(data.roomName).emit('story:getStory',doc);
  });
  });


    //start new
    socket.on('story:addRemoveMembersListItem',function(data){
    io.to(data.roomName).emit('memberAdded',data);
     Story.addMemberToChecklist(data,function(err,doc)
   {
    io.to(data.roomName).emit("story:getStory",doc);
      })
    });
    //end new
    //start
    //neo
    socket.on('story:addRemoveMembersList',function(data)
    {

      socket.emit('pushMemberToItem',data.assignedMember);
      //console.log("my data members: ",data.assignedMember);

    });
    //end
    /****
    description:listner to update item to checklist group in a story

    ****/

  socket.on('story:updateChecklistItem', function(data) {
        Story.updateChecklistItem(data.storyid, data.checklistGrpId,data.operation,data.itemid,data.checked,data.text,data.dueDate,function(err, doc) {
          if (!err) {
                io.to(data.room).emit('story:dataModified', doc);
                  if(data.operation=='check')
                    var action=data.checked == true ? "completed" : "unchecked";
                    else
                      var action="Edited";
                var actData = {
                  room: "activity:" + data.projectID,
                  action: action,
                  projectID: data.projectID,
                  user: data.user,
                  object: {
                    name: data.text,
                    type: "Story",
                    _id: data.checklistGrpId
                  },
                  target: {
                    name: doc.heading,
                    type: "Story",
                    _id: data.storyid
                  }
                }
                Activity.addEvent(actData, function(data) {
                  io.to(actData.room).emit('activityAdded', data);
                });
              }
    })

  })


  socket.on('story:addAttachment', function(data) {
    io.to(data.room).emit('story:attachmentAdded', data);

    var actData = {
      room: "activity:" + data.projectID,
      action: "attached",
      projectID: data.projectID,
      user: data.user,
      object: {
        name: data.type,
        type: "Story",
        _id: data._id
      },
      target: {
        name: data.heading,
        type: "Story",
        _id: data._id
      }
    }
    Activity.addEvent(actData, function(data) {
      io.to(actData.room).emit('activityAdded', data);
    });
  });

  socket.on('story:removeAttachment', function(data) {
    io.to(data.room).emit('story:attachmentRemoved', data);

    var actData = {
      room: "activity:" + data.projectID,
      action: "removed",
      projectID: data.projectID,
      user: data.user,
      object: {
        name: data.type,
        type: "Story",
        _id: data._id
      },
      target: {
        name: data.heading,
        type: "Story",
        _id: data._id
      }
    }


    Activity.addEvent(actData, function(data) {
      io.to(actData.room).emit('activityAdded', data);
    });
  });
  socket.on('story:addComment', function(data) {

    Story.findIssue(data.storyId,function(err,storyData){

      if(!err){
        var issue={};
      GithubRepo.getRepo(data.projectID,function(err,repoData){
        if(!err && repoData){
          if(storyData.issueNumber){
            issue.message={
              'body':data.text
            }
            issue.repo_details=repoData;
            issue.github_profile=data.github_profile;
            issue.issueNumber=storyData.issueNumber;
            queue.commentPost.add(issue);
          }
        }
      })
    }
  })

    var commentsObj = {};
    commentsObj['text'] = data.text;
    commentsObj['commentedBy'] = data.user._id;
    commentsObj['userName'] = data.user.fullName;

    commentsObj['commentedDate'] = Date.now();
    Story.addComment(data.storyId, commentsObj, function(err, storyData) {
      if (!err) {
        io.to(data.room).emit('story:dataModified', storyData);

        var actData = {
          room: "activity:" + data.projectID,
          action: "commented",
          projectID: data.projectID,
          user: data.user,
          target: {
            name: storyData.heading,
            type: "Story",
            _id: data.storyId
          }
        }
        Activity.addEvent(actData, function(data) {
          io.to(actData.room).emit('activityAdded', data);
        });
      }
    });
  });
  socket.on('story:deleteComment', function(data) {
    Story.deleteComment(data.storyId, data.commentId, index, function(err, storyData) {
      if (!err) {
        io.to(data.room).emit('story:dataModified', storyData);

        var actData = {
          room: "activity:" + data.projectID,
          action: "commented",
          projectID: data.projectID,
          user: data.user,
          target: {
            name: storyData.heading,
            type: "Story",
            _id: data.storyid
          }
        }
        Activity.addEvent(actData, function(data) {
          io.to(actData.room).emit('activityAdded', data);
        });
      }
    });
  });
}
