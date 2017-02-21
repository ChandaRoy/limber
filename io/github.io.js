var User = require('../models/user.js');
var GithubRepo = require('../models/githubRepo.js');
var Project = require('../models/project.js');
var Story = require('../models/story.js');
var request=require('request');
var github_api = require("../routes/github-api.js");
var BackLogsBugList = require('../models/backlogBuglist.js');
var queue= require('../redis/queue.js');
var githubCall=require('../githubIntegration/githubCall.js');
var User=require('../models/user.js');

module.exports = function(socket, io) {
  socket.on('github:addRepo', function(data) {

    io.to("user:"+data.userId).emit("startSync",data.projectId);
    var message={
      "name": "web",
      "active": true,
      "events": [
        "issues",
        "issue_comment",
        "member"
      ],
      "config": {
        "url": "http://limber.stackroute.in:8080/issueEvents",
        "content_type": "json"
      }
    }

    var options={
      url:"https://api.github.com/repos/"+data.owner+"/"+data.name+"/hooks?access_token="+data.githubProfile.token,
      headers:{
        "content-type":'application/json',
        "User-Agent":'Limber'
      },
      json:message
    };

    //console.log("url---------",collaboratorOptions.url);
    request.post(options,function(err,response,body){
      if(!err){
        var githubRepo= new GithubRepo();
        githubRepo.name=data.name;
        githubRepo.owner=data.owner;
        githubRepo.projectId=data.projectId;
        githubRepo.admin.id=data.githubProfile.id;
        githubRepo.admin.token=data.githubProfile.token;
        githubRepo.admin.name=data.githubProfile.name;
        var memberList=[];
        githubRepo.save(function(err){
          if(!err){
            Project.updateGithubStatus(data.projectId,function(error,statusDoc){
              if(!error){
                //  console.log(doc);
                var githubRepo={
                  'githubStatus':true,
                  'projectId':data.projectId
                };
                memberList=statusDoc.memberList;

                memberList.filter(function(userId)
                {
                githubCall.makeUserAsCollaborator({"projectId":data.projectId,"userId":userId,"atTheTimeOfIntegration":false,addingOneMember:false});
                })
                //  console.log(doc);
                memberList.forEach(function(userID){
                  var room = "user:"+ userID;
                  io.to(room).emit('github:changeGithubStatus', githubRepo);
                });

              }
            })
            //end of collaborators api call


          }
        });
      }
    })

  })

  socket.on("github:syncAgain",function(projectId)
{
  Project.findOneProject(projectId,function(err,projectData)
{
  if(!err)
    {
      projectData.memberList.forEach(function(userId)
      {
        githubCall.makeUserAsCollaborator({"projectId":projectData.projectId,"userId":userId,"atTheTimeOfIntegration":false,addingOneMember:false});

      })
    }
})
})

  socket.on("github:convertToStory",function(data){
    data.issues.forEach(function(obj){
      var story=new Story();
      story.listId="Backlogs";
      story.heading=obj.title;
      story.projectId=data.projectId;
      story.description=obj.body;
      story.createdTimeStamp=Date.now();
      story.lastUpdated=Date.now();

      //story.memberList=obj.assignees;
      story.issueNumber=obj.number;
      GithubRepo.getRepo(data.projectId,function(err,repoDetails){
        story.githubSync=repoDetails._id;
        story.storyCreatorId=data.userProfile._id;
        story.memberList=[];
        story['indicators']={
          'descriptionStatus': false,
          "chklstItmsCnt": 0,
          "chklstItmsChkdCnt": 0,
          'attachmentsCount': 0,
          'commentCount': 0
        }
        if(obj.assignees.length!==0){
          var index=0;
          obj.assignees.forEach(function(assignee){

             User.findOne({'github.id':assignee.id},function(error,user){

               if(!error && user){
                 Project.findOneProject(data.projectId,function(err,project){

                   if(project.memberList.indexOf(user._id)!=-1){
                     story.memberList.push(user._id);

                     index++;

             }
             else{
               index++;
               if(story.pendingMemberFromGithub){
               if(story.pendingMemberFromGithub.indexOf(assignee.id)==-1){
               story.pendingMemberFromGithub.push(assignee.id);
             }}}

             if(index==obj.assignees.length)
                {
                  Story.convertToStory(story,function(err,storyData){
                    if(!err){
                      BackLogsBugList.addStoryBacklog(data.projectId, storyData._id, function(err, subDoc) {
                        if(!err){
                    //      console.log("Updated Backlog bUg list",subDoc);
                      //    console.log("BacklogBuglist:"+data.projectId);
                          io.to("BacklogBuglist:"+data.projectId).emit("sprint:storyAdded",storyData);
                        }

                      })
                    }
                  })
                }
           })
         }
            })

          })

        }
        else {
          Story.convertToStory(story,function(err,storyData){
            if(!err){
              BackLogsBugList.addStoryBacklog(data.projectId, storyData._id, function(err, subDoc) {
                if(!err){
            //      console.log("Updated Backlog bUg list",subDoc);
              //    console.log("BacklogBuglist:"+data.projectId);
                  io.to("BacklogBuglist:"+data.projectId).emit("sprint:storyAdded",storyData);
                }

              })
            }
          })
        }


      })

    })

  })

  socket.on("github:integrateGit",function(data){
      githubCall.makeUserAsCollaborator({projectId:data.projectId,userId:data.userId,atTheTimeOfIntegration:true,addingOneMember:false});

})

}
