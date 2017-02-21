var Activity = require('../models/activity.js');
var User = require('../models/user.js');
var Project = require('../models/project.js');
var Sprint = require('../models/sprint.js');
var Story = require('../models/story.js');
var BackLogsBugList = require('../models/backlogBuglist.js');
var Template = require('../models/template.js');
var queue= require('../redis/queue.js');
var GithubRepo = require('../models/githubRepo.js');
var request=require('request');
var githubCall=require('./githubCall.js');


function makeUserAsAStoryMember(data)
{

    if(data.story.memberList.indexOf(data.userDoc._id)==-1){
      data.story.memberList.push(data.userDoc._id);
      data.story.pendingMemberFromGithub.splice(data.story.pendingMemberFromGithub.indexOf(data.userDoc.github.id),1)
      data.story.save(function(err,subDoc){
      })
    }

}

function pushToGithub(data){
    var issue={};
    issue.message={
      'title':data.story.heading,
      'assignees':data.assignees,
      'body':data.story.description,
      'storyId':data.story._id
      }
      if(data.story.listId==="Releasable"){
        issue.message.state="closed"
      }
      else{
        issue.message.state="open"
      }
    issue.repo_details=data.repoData;
    issue.github_profile=data.github_profile;

    Project.findOneProject(data.projectId,function(err,projectData)
  {
    if(!err)
      {
        if(projectData.gitStories.indexOf(data.story._id)==-1)
          {
            queue.storyPost.add(issue);
            Project.addGitStory({projectId:data.projectId,storyId:data.story._id});
          }
      }
  })
  }
  /////////////


  function checkCollaborators(data)
  {
  if(data.assignees.length==0)
      {
        pushToGithub(data);
      }
else {
    var index=0;
    var flag=true;
    data.assigneesIds.forEach(function(assigneeId)
      {
        if(data.collaboratorsList.indexOf(assigneeId)==-1)
        {
          flag=false;
        }
          index++;
          if(index==data.assigneesIds.length)
            {
              if(flag==true){
              pushToGithub(data);
            }
          else
          {
          }
        }

      })

}
  }

////////////////////////

function personsHaveGitIds(data)
{
  var assignees=[];
  var assigneesIds=[];
  if(data.memberList.length==0)
  {
  data.assignees=assignees;
  pushToGithub(data);
  }
  else
  {
  var index=0;
  data.memberList.forEach(function(memberId)
  {
    User.getUserMember(memberId,function(err,userData)
  {
    if(!err)
      {
        if(userData.github.name!==undefined)
        {
          assignees.push(userData.github.name);
          assigneesIds.push(userData._id);
        }
        index++;
        if(index==data.memberList.length)
        {
          data.assignees=assignees;
          data.assigneesIds=assigneesIds;
          data.collaboratorsList=data.collaboratorsList;
          checkCollaborators(data);
        }
      }
  })
})
  }
}

///////////////////
function editStory(data)
{
  Story.findIssue(data.storyid,function(err,storyData){

    if(!err){
      var assignees=[];
      var issue={};
    GithubRepo.getRepo(storyData.projectId,function(err,repoData){
      if(!err && repoData){
        if(storyData.issueNumber){
          User.getUserMember(data.memberid,function(error,memberData){
            if(!error){
              storyData.memberList.forEach(function(member){

                if(member.github.name!==undefined){
                  assignees.push(member.github.name)
                }
                else{
                  storyData.pendingMemberToGithub.push(member._id);
                  storyData.save(function(err,res){
                  //send message here if one person doesn't provide git details but he is added to a project.
                })
                }
              })
              if(data.atTheTimeOfIntegration==false && memberData.github.name!==undefined)
              {
              assignees.push(memberData.github.name);
            }
            else {
              //send message here if one person doesn't provide git details but he is added to a project.
            }
            if(assignees){
            issue.message={
              'assignees':assignees
            }
            issue.repo_details=repoData;
            issue.github_profile=data.github_profile;
            issue.issueNumber=storyData.issueNumber;
            queue.editStory.add(issue);
          }
          }
          })
    }
  }
})
  }
  })

}


module.exports={

//---------making a person as an assignee to a story.
//---------end of making a person as an assignee to a story.

pushToGithub: pushToGithub,
///////////////////////////
editStory:editStory,

makeUserAsCollaborator:function(data)
{
Project.findOneProject(data.projectId,function(err,projectData)
{
    if(projectData.githubStatus)
          {
          User.getUserMember(data.userId,function(err,userData)
          {
            if(!err)
            {
            if(userData.github.name!==undefined)
                {
                  GithubRepo.getRepo(data.projectId,function(err,repoDetails)
                  {
                    if(!err)
                        {
                          var collaboratorOptions={
                            url:"https://api.github.com/repos/"+repoDetails.owner+"/"+repoDetails.name+"/collaborators/"+userData.github.name+"?access_token="+repoDetails.admin.token,
                            //qs:{access_token:data.token},
                            headers:{
                              "User-Agent":'Limber'
                                    }
                                                }
                              var pushData={};
                              pushData.urlOptions=collaboratorOptions;
                              pushData.projectId=data.projectId;
                              pushData.userId=data.userId;
                              pushData.atTheTimeOfIntegration=data.atTheTimeOfIntegration;
                              pushData.addingOneMember=data.addingOneMember;
                              queue.collaboratorPost.add(pushData);
                        }
                  })
                }
              }
          })
          }
})

},

//-------------pushing stories to the github ----------------------
pushStories:function(data)
{
  GithubRepo.getRepo(data.projectId,function(err,repoData){
    //console.log("Repository Details",repoData);
    if(!err && repoData){
      Story.updateGithubSync(data.projectId,data.userId,repoData._id,function(err,storyData){
        //console.log("Stories All Project",storyData);
        storyData.forEach(function(story){

            Story.getStory(story._id,function(err,doc)
            {
            //console.log("got the story---------------------");
            if(!err)
            {
              if(data.atTheTimeOfIntegration==true)
              {
                if(doc.memberList.indexOf(data.userId)!==-1 && story.issueNumber!=undefined){
                //  console.log("insdie if condition----------------->");
                  editStory({'storyid':story._id,'memberid':data.userId,'atTheTimeOfIntegration':data.atTheTimeOfIntegration})
                }
                User.getUserMember(data.userId,function(err,userDoc){
                  //console.log("getting userDetails",userDoc);
                  if(userDoc.github.id===story.issueCreatorId){
                    story.storyCreatorId=userDoc._id;
                    story.issueCreatorId=null;
                    story.save(function(err,subDoc){
                      //console.log("Saved Story in creatorNam",subDoc);
                    })
                  }
                  if(story.pendingMemberFromGithub)
                    if(story.pendingMemberFromGithub.indexOf(userDoc.github.id)!=-1){
                      makeUserAsAStoryMember({"story":story,"userDoc":userDoc});
                    }
                })
              }


              //console.log("story.storyCreatorId._id----->",story.storyCreatorId._id,"data userId --->",data.userId,"story.issueNumber-------",story.issueNumber,"compare-->",story.issueNumber==undefined);
            if(story.storyCreatorId)
            {
          if((story.storyCreatorId._id==data.userId && story.issueNumber===undefined) || (doc.memberList.indexOf(data.userId)!==-1 && !data.atTheTimeOfIntegration && story.issueNumber===undefined)){
              personsHaveGitIds({"collaboratorsList":data.collaboratorsList,"memberList":doc.memberList,"projectId":data.projectId,"story":story,"repoData":repoData,"github_profile":story.storyCreatorId.github});
              }
            }
              else {
                if((doc.memberList.indexOf(data.userId)!==-1 && !data.atTheTimeOfIntegration && story.issueNumber===undefined)){
                personsHaveGitIds({"collaboratorsList":data.collaboratorsList,"memberList":doc.memberList,"projectId":data.projectId,"story":story,"repoData":repoData,"github_profile":story.storyCreatorId.github});
              }

            }
          }
          })

              })
        })
        }
      })
    }
  }




// var personsHaveIds=doc.memberList.filter(function(memberId)
// {
//   User.getUserMember(memberId,function(err,userData)
// {
//   userObject=userData;
//   console.log("user object----------------------------------------------------------------------",userObject);
//   if(!err)
//     {
//       console.log("userData.github--------------",userData.github);
//       if(userData.github!==undefined)
//       {
//         return memberId;
//           //making sure that user is a collaborator...............
//           console.log("data.collaboratorsList----------------------------------------------------------------",data.collaboratorsList,data.collaboratorsList.indexOf(memberId));
//           console.log("memberid------------------------------------------------------------------------------------",memberId);
//           if(data.collaboratorsList.indexOf(memberId)!=-1)
//             {
//               assignees.push(userData.github.name);
//               console.log("assignee is added------------------------------",userData.github.name,assignees,"index--",index);
//             }
//             else
//             {
//               flag=false;
//               console.log("found some one who is not a collaborator-------------");
//               var collaboratorOptions={
//                 url:"https://api.github.com/repos/"+repoData.owner+"/"+repoData.name+"/collaborators/"+userData.github.name+"?access_token="+repoData.admin.token,
//                 //qs:{access_token:data.token},
//                 headers:{
//                   "User-Agent":'Limber'
//                         }
//                                     }
//                                     //console.log("repoDetails----------------- ----------",repoDetails);
//                   var pushData={};
//                   pushData.urlOptions=collaboratorOptions;
//                   pushData.projectId=data.projectId;
//                   pushData.userId=data.userId;
//                   pushData.atTheTimeOfIntegration=data.atTheTimeOfIntegration;
//                   pushData.addingOneMember=data.addingOneMember;
//                   console.log("adding collaborator------------------------");
//                   //queue.collaboratorPost.add(pushData);
//             }
//       }
//     }
// })
// index++;
// if(index==doc.memberList.length)
// {
//   if(flag===true)
//   {
//   pushToGithub({"projectId":data.projectId,"story":story,"assignees":assignees,"repoData":repoData,"github_profile":story.storyCreatorId.github});
//   console.log("calling a function to push the story-------------------",assignees,userObject.firstName);
// }
// }
// })
