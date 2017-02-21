var redisHost = process.env.REDIS_HOST || '127.0.0.1';
var redisPort = process.env.REDIS_PORT || 6379;
var Queue = require('bull');
var request= require('request');
var storyPost=Queue("Server1",redisPort,redisHost);
var editStory=Queue("Server2",redisPort,redisHost);
var commentPost=Queue("Server3",redisPort,redisHost);
var Story=require("../models/story.js");
var BackLogsBugList=require("../models/backlogBuglist.js");
var GithubRepo=require("../models/githubRepo.js");
var collaboratorPost=Queue("Server4",redisPort,redisHost);
var addGitIssues=Queue("Server5",redisPort,redisHost);
var io=require("../io/io.js");
var User=require("../models/user.js");
var Sprint=require("../models/sprint.js");
var databaseCall =require("../githubIntegration/databaseCall.js");
var Project=require("../models/project.js");
var githubCall=require("../githubIntegration/githubCall.js")
storyPost.process(function(job,done){
 var options={
   url:"https://api.github.com/repos/"+job.data.repo_details.owner+"/"+job.data.repo_details.name+"/issues?access_token="+job.data.github_profile.token,
   headers:{
     "content-type":'application/json',
     "User-Agent":'Limber'
   },
   json:job.data.message
 };

 request.post(options,function(err,res,body){
   //console.log(res);
   if(!err && res.statusCode==201){
     Story.findOne({_id: job.data.message.storyId}, function (err, story) {
         story.issueNumber = body.number;
         story.save(function (err,storyData) {
             if(err) {

                 console.error('ERROR!');
             }
else{
  console.log("inside Sprint ",storyData);
  Sprint.findSprintForStory(storyData._id,function(err,sprintData)
  {
    if(!err && sprintData)
      {
        console.log("Sprint",sprintData);
        io.to("sprint:"+sprintData._id).emit("story:dataModified",storyData);
      }
  })
//emit socket with story Socket.emit
}


         });
     });
     //done(Error('some error'));
   }
   done(body,null);
 })

});

commentPost.process(function(job,done){
  var options={
    url:"https://api.github.com/repos/"+job.data.repo_details.owner+"/"+job.data.repo_details.name+"/issues/"+job.data.issueNumber+"/comments?access_token="+job.data.github_profile.token,
    headers:{
      "content-type":'application/json',
      "User-Agent":'Limber'
    },
    json:job.data.message,

  };
 request.post(options,function(err,res,body){
if(!err && res.statusCode==="201") done(null,body);
done(res,null);

})


})
//
editStory.process(function(job,done){
  var options={
    url:"https://api.github.com/repos/"+job.data.repo_details.owner+"/"+job.data.repo_details.name+"/issues/"+job.data.issueNumber+"?access_token="+job.data.github_profile.token,
    headers:{
      "content-type":'application/json',
      "User-Agent":'Limber'
    },
    json:job.data.message,
    method: "PATCH"
  };

  request.post(options,function(err,res,body){
    //console.log(res);
    //console.log(body);
    //console.log(res.statusCode);
    done(body,null)


});
});


//adding collaborator to git starts here
collaboratorPost.process(function(job,done)
{
 request.put(job.data.urlOptions,function(error,response,body)
{
 if(!error)
 {
   Project.updateCollaborators({projectId:job.data.projectId,collaboratorId:job.data.userId},function(err,projectData)
   {
     if(!err)
       {
       if(job.data.addingOneMember)
       {
         githubCall.pushStories({atTheTimeOfIntegration:true,projectId:job.data.projectId,userId:job.data.userId,collaboratorsList:projectData.collaboratorsList});

       }
       else {
         githubCall.pushStories({atTheTimeOfIntegration:job.data.atTheTimeOfIntegration,projectId:job.data.projectId,userId:job.data.userId,collaboratorsList:projectData.collaboratorsList});
       }
       done(body,null)
       }
   });
}
else {
 done(body,null)
}
});
});
//adding collaborator to git ends here

addGitIssues.process(function(job,done){
  var owner=job.data.repository.owner.login;
  var name=job.data.repository.name;
  var number=job.data.issue.number;

  if(job.data.action==="opened"){
  GithubRepo.getGitRepo(owner,name,function(err,doc){
    if(!err && doc){

      Story.findbyGithubId(doc._id,number,function(error,storyData){
        if(!error && !storyData){
          var story=new Story();
          User.findOne({'github.id': job.data.sender.id}, function(err, user){
            if(user){
              story.storyCreatorId=user._id
            }
            else{
              story.storyCreatorId=null;
              story.issueCreatorId=job.data.sender.id;
            }
          story.listId="Backlogs";
          story.heading=job.data.issue.title;
          story.projectId=doc.projectId;
          story.description=job.data.issue.body;
          story.createdTimeStamp=Date.now();
          story.lastUpdated=Date.now();
          //story.memberList=job.data.issue.assignees;
          story.issueNumber=job.data.issue.number;
          story.githubSync=doc._id;

          Story.addStory(story,function(err,storyData){
            if(!err){
              BackLogsBugList.addStoryBacklog(doc.projectId, storyData._id, function(err, subDoc) {
                if(!err){
                  io.to("BacklogBuglist:"+doc.projectId).emit("sprint:storyAdded",storyData);
                  done(null,null);
                }

              })
            }
          })
        })
        }
        else done()
      })
    }
    else done()

  })


  }
  else if(job.data.action==="assigned" || job.data.action==="unassigned"){
    GithubRepo.getGitRepo(owner,name,function(err,doc){
      if(!err && doc){

        Story.findbyGithubId(doc._id,number,function(error,storyData){
          if(!error && storyData){
            User.findOne({'github.id': job.data.assignee.id}, function(err, user){
              if(!err && user){
                Project.findOneProject(doc.projectId,function(err,project){
                  if(project.memberList.indexOf(user._id)!=-1){


                if(job.data.action==="assigned"){
                if(storyData.memberList.indexOf(user._id)==-1){
                  user.fullName=user.firstName + " " + user.lastName
                  var data={
                    'storyid':storyData._id,
                    'memberid':user._id,
                    'user':user,

                    'projectID':storyData.projectId,
                    'fullName': user.firstName + " " + user.lastName

                  };
                  if(storyData.listId==="inProgress" || storyData.listId==="Releasable"){
                  Sprint.findSprintForStory(storyData._id,function(err,sprint){
                    if(!err){
                      data.room="sprint:"+sprint._id;

                      databaseCall.addMember(data);
                      //storyData.memberList.push(user._id);
                    }
                  })
                }
                else if(storyData.listId==="Backlogs" || storyData.listId==="BugLists"){
                  data.room="BacklogBuglist:"+storyData.projectId;
                  databaseCall.addMember(data);
                }
                }

                }
                else if(job.data.action==="unassigned"){
                  var index=storyData.memberList.indexOf(user._id);
                  if(index!=-1){
                    user.fullName=user.firstName + " " + user.lastName
                    var data={
                      'storyid':storyData._id,
                      'memberid':user._id,
                      'user':user,

                      'projectID':storyData.projectId,
                      'fullName': user.firstName + " " + user.lastName

                    };
                    if(storyData.listId==="inProgress" || storyData.listId==="Releasable"){
                    Sprint.findSprintForStory(storyData._id,function(err,sprint){
                      if(!err){
                        data.room="sprint:"+sprint._id;

                        databaseCall.removeMember(data);
                        //storyData.memberList.push(user._id);
                      }
                    })
                  }
                  else if(storyData.listId==="Backlogs" || storyData.listId==="BugLists"){
                    data.room="BacklogBuglist:"+storyData.projectId;
                    databaseCall.removeMember(data);
                  }
                    //storyData.memberList.splice(index,1);

                  }
                  // storyData.save(function(err,res){
                  //   console.log(res);
                  //   done()
                  // })
                }

              }
              else{
                storyData.pendingMemberFromGithub.push(job.data.assignee.id);
                storyData.save(function(err,res){

                })
              }
            })
                }

              else{
                //code for not assignees not having github id in DB
                storyData.pendingMemberFromGithub.push(job.data.assignee.id);
                storyData.save(function(err,res){
                  done();
                })
              }
            })
          }
          done()
        })
      }
      done()
    })
  }
  else if(job.data.action==="closed"){
    GithubRepo.getGitRepo(owner,name,function(err,doc){
      if(!err && doc){

        Story.findbyGithubId(doc._id,number,function(error,storyData){
          if(!error && storyData){
            User.findOne({'github.id': job.data.sender.id}, function(err, user){
              if(user){
              user.fullName=user.firstName + " " + user.lastName;
            }
              else {
                user={};
                user.fullName=job.data.sender.login;
              }
              if(!err){
                 if(storyData.listId==="inProgress"){
                Sprint.findSprintForStory(storyData._id,function(err,sprint){
                  if(!err && sprint){
                    var group="Releasable";
                    Sprint.findReleasableListId(sprint._id,group,function(error,releasableListId){
                      if(!error){
                        var data={
                        'room': "sprint:"+sprint._id,
                        'activityRoom': 'activity:' + storyData.projectId,
                        'projectID': storyData.projectId,
                        'sprintId': sprint._id,
                        'oldListId': sprint.list[0]._id,
                        'newListId': releasableListId.list[0]._id,
                        'newListName':"Releasable",
                        'storyId': storyData._id,
                        'user':user
                      }
                      databaseCall.moveStory(data)
                        //'github_profile':$rootScope.githubProfile


          }


        })
        }
      })
    }
        else if(storyData.listId==="Backlogs"){
          Project.getRelease(storyData.projectId,function(err,release){
            if(!err && release){
            Sprint.findCurrentSprint(release[0].release.sprints,function(error,sprint){
              if(!error && sprint){
                var group="Releasable";
                Sprint.findReleasableListId(sprint[0]._id,group,function(error,releasableListId){

                    if(!error){
                      var data={
                      'room': "sprint:"+sprint[0]._id,
                      'activityRoom': 'activity:' + storyData.projectId,
                      'projectID': storyData.projectId,
                      'sprintId': sprint[0]._id,
                      'oldListId': "backlogs",
                      'newListId': releasableListId.list[0]._id,
                      'newListName':"Releasable",
                      'storyId': storyData._id,
                      'user':user
                    }
                    databaseCall.moveFromBackbug(data)
                      //'github_profile':$rootScope.githubProfile


        }


                })
              }

            })
          }
          })
        }
        else if(storyData.listId==="BugLists"){
          Project.getRelease(storyData.projectId,function(err,release){
            if(!err && release){
            Sprint.findCurrentSprint(release[0].release.sprints,function(error,sprint){
              if(!error && sprint[0]){
                var group="Releasable";
                Sprint.findReleasableListId(sprint[0]._id,group,function(error,releasableListId){

                    if(!error){
                      var data={
                      'room': "sprint:"+sprint[0]._id,
                      'activityRoom': 'activity:' + storyData.projectId,
                      'projectID': storyData.projectId,
                      'sprintId': sprint[0]._id,
                      'oldListId': "buglists",
                      'newListId': releasableListId.list[0]._id,
                      'newListName':"Releasable",
                      'storyId': storyData._id,
                      'user':user
                    }
                    databaseCall.moveFromBackbug(data)
                      //'github_profile':$rootScope.githubProfile


        }


                })
              }

            })
          }
          })
        }

        }
      })
    }
  })

        }
        })
      }

      else if(job.data.action==="reopened"){
        GithubRepo.getGitRepo(owner,name,function(err,doc){
          if(!err && doc){

            Story.findbyGithubId(doc._id,number,function(error,storyData){
              if(!error && storyData){
                User.findOne({'github.id': job.data.sender.id}, function(err, user){
                  if(user){
                  user.fullName=user.firstName + " " + user.lastName;
                }
                  else {
                    user={};
                    user.fullName=job.data.sender.login;
                  }
                  if(!err){
                    if(storyData.listId==="Releasable"){
                      Sprint.findSprintForStory(storyData._id,function(err,sprint){
                        if(!err && sprint){
                          var group="Releasable";
                          Sprint.findReleasableListId(sprint._id,group,function(error,releasableListId){
                            if(!error){
                              var data={
                              'room': "sprint:"+sprint._id,
                              'activityRoom': 'activity:' + storyData.projectId,
                              'projectID': storyData.projectId,
                              'sprintId': sprint._id,
                              'oldListId': releasableListId.list[0]._id,
                              'newListId': "backlogs",
                              'newListName':"Backlogs",
                              'storyId': storyData._id,
                              'user':user
                            }
                            databaseCall.moveToBackBug(data)
                              //'github_profile':$rootScope.githubProfile


                }


              })
              }
            })
                    }
                  }
                })
              }
            })
          }
        })

      }

//  done()

done()
})

module.exports.storyPost=storyPost;
module.exports.collaboratorPost=collaboratorPost;
module.exports.editStory=editStory;
module.exports.commentPost=commentPost;
module.exports.addGitIssues=addGitIssues;
