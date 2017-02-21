/***
Copyrights: StackRoute and Wipro Digital

Author:Sharan, Shrinivas and Soumitra
Date: 21-March-2016

This file is contains sub routes w.r.t the each
operation which can be performed on a story.
It internally call the static functions written in
Story\BacklogandBuglist\Release Models for different
operations.

****/

var express = require('express');
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var uploadfileService=require('./uploadFile.js');
var router = express.Router();
var story = require('../models/story.js');
var sprint = require('../models/sprint.js');
var backlogsBuglist = require('../models/backlogBuglist.js');
var Project = require('../models/project.js');
var fs = require('fs'),
    list;
var queue= require('../redis/queue.js');
var GithubRepo = require('../models/githubRepo.js')
/* GET home page. */
//Merged by Sharan Starts
router.post('/addmember', function(req, res, next) {
  var storyId= req.query.storyid;
  var memberId=req.query.memberid;

story.addMembers(storyId,memberId,function(err,data){
  if(err){
    res.send(err);
  }
  res.send(data);
})
});

router.post('/getMembersData',function(req,res,next){
  var storyId=req.query.id;
  story.getStory(storyId,function(err,data){
    if(err){
      res.send(err);
    }else{
      res.send(data.memberList);
    }
  })
})
router.post('/getLabelsData',function(req,res,next){
  var storyId=req.query.id;
  story.getStory(storyId,function(err,data){
    if(err){
      res.send(err);
    }else{
      res.send(data.labelList);
    }
  })
})
router.post('/removemember', function(req, res, next) {
  var storyId= req.query.storyid.replace("/","");
  var memberId=req.query.memberid.replace("/","");

story.removeMembers(storyId,memberId,function(err,data){
  if(err){
    res.send(err);
  }
res.send(data);
})
});

router.post('/addattachments', function(req, res, next) {
  //  var storyId= "5711f523be7cf90d2b5a138c";
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var storyId= fields.storyId;
    var attachmentObj;
    var old_path = files.file.path,
    file_size = files.file.size,
    file_ext = files.file.name.split('.').pop(),
    index = old_path.lastIndexOf('/') + 1,
    file_name = old_path.substr(index),
    newfile_name=files.file.name.substring(0, (files.file.name.lastIndexOf('.'))),
    folder_path=path.join(process.env.PWD+ '/public/uploadfile/'+storyId),
    new_path = path.join(process.env.PWD+ '/public/uploadfile/'+storyId +"/"+ file_name + '.' + file_ext);


    attachmentObj={
      fileName: files.file.name,
      timeStamp: Date.now(),
      attachmentType: file_ext,
      addedByUserName:"Sharan",
      addedByUserId:"56ebb688ee6b767262a7ed90",
      path : '/uploadfile/'+storyId+"/"+ file_name+"."+file_ext
    };
    if(!fs.existsSync(folder_path)){
      fs.mkdir(folder_path, function(err){

        fs.readFile(old_path, function(err, data) {

          fs.writeFile(new_path, data, function(err) {

            fs.unlink(old_path, function(err) {

              if (err) {
                res.status(500);
                res.json({'success': false});
              } else {
                story.addAttachments(storyId,attachmentObj,function(err,data){
                uploadfileService(storyId, file_name + '.' + file_ext, function(err, url) {
                    if(err) { res.send(500).json(err); }
                    res.send(data);
                  });
                })
              }
            });
          });
        });
      });
    }else{
      fs.readFile(old_path, function(err, data) {
        fs.writeFile(new_path, data, function(err) {

          fs.unlink(old_path, function(err) {
            if (err) {
              res.status(500);
              res.json({'success': false});
            } else {

              story.addAttachments(storyId,attachmentObj,function(err,data){
                  uploadfileService(storyId, file_name + '.' + file_ext, function(err, url) {
                    if(err) { res.send(500).json(err); }
                    res.send(data);
                  });
              })
              //res.status(200);
              //res.json({'success': true});
            }
          });
        });
      });

    }
  });
});

router.post('/removeattachement', function(req, res, next) {
  var storyId= req.query.storyId,
  attachmentId=req.query.attachmentId,
  npath="public"+req.query.file_name;
  // npath="/public/uploadfile/5711f523be7cf90d2b5a138c/upload_da97b709ce281af6771ed7ea0b2c120d.jpg";
  fs.unlink(npath, function(err) {
    story.removeAttachment(storyId,attachmentId,function(err,data){
      res.send(data);
    })
  })
});

router.get('/removechecklistgroup', function(req, res, next) {
  //TODO:Get the below obj dynamically from request. Update indicators dynamically

  var storyId= "56ea47bd28c0f3dd0446b660";
  var checklistId="56efc77c1b9bb26612567c04";
  // var storyId= req.query.storyid.replace("/","");
  // var checklistId=req.query.attachmentid.replace("/","");

story.removeChecklistGroup(storyId,checklistId,function(err,data){
res.send(data);
})
});


router.get('/addMemberToChecklist',function(req,res,next)
{
story.addMemberToChecklist(req,function(err,data)
{
});
});

router.get('/addchecklistgroup', function(req, res, next) {
  //TODO:Get the below obj dynamically from request. Update indicators dynamically

   var storyId= req.query.storyid;
  var checklistObj=req.query.checklistobj;
  //var storyId= "56ea47bd28c0f3dd0446b660";
  // var checklistObj={
  //   checklistHeading:"This is Heading of Checklist",
  //   checkedCount: 2,
  //   items: [{
  //     text: "First Check item",
  //     checked: false,
  //     createdBy:"56ebb688ee6b767262a7ed90",
  //     creationDate:Date.now(),
  //     creatorName:"Sharan"
  //   },{
  //     text: "Second Check item",
  //     checked: false,
  //     createdBy:"56ebb688ee6b767262a7ed90",
  //     creationDate:Date.now(),
  //     creatorName:"Sharan",
  //   }]
  //
  // }
story.addChecklistGroup(storyId,checklistObj,function(err,data){
res.send(data);
});
});

router.post('/updatelabellist', function(req, res, next) {
  //TODO:Get the below obj dynamically from request. Update indicators dynamically
  var storyId= req.query.storyid;
  var labelListId=req.query.labellistid;
  var operation=req.query.operation;

  // var storyId= "56ea47bd28c0f3dd0446b660";
  // var labelListId="56efe6fd6825b2ea15c45f27";
  // var operation= "delete";
story.updateLabelList(storyId,labelListId,operation,function(err,data){
res.send(data);
});
});


//ends
router.get('/', function(req, res, next) {
  var storyId= req.query.id;
  //var storyId = "56ea47bd28c0f3dd0446b660";

  story.findStory(storyId, function(err, doc) {
    if(err){
      return(err);
    }
    else {
      res.send(doc);
      return(doc);
    }
  });
});
router.post('/saveStoryDescription', function(req, res, next) {
  var storyId= req.query.id;
  var desc=req.query.desc;
  var github_profile=req.body;

  story.findIssue(storyId,function(err,storyData){
    if(!err){
    GithubRepo.getRepo(storyData.projectId,function(err,repoData){
      if(!err && repoData){
        if(storyData.issueNumber){
          var issue={}
          issue.message={
            'body':desc
          }
          issue.repo_details=repoData;
          issue.github_profile=github_profile;
          issue.issueNumber=storyData.issueNumber;
          queue.editStory.add(issue);
    }
  }
})
  }
  })


  story.saveDescription(storyId,desc, function(err,doc){
    if(err){
      return(err);
    }
    else {
      res.send(doc);
      return(doc);
    }
  });
  //res.send("doc");
});

router.post('/delete', function(req, res, next){
  projectId = "56ea78ea15eac2a96fedb5ee";
  sprintId = "56ea89de1d4b0a2572f25b9c";
  listId = "56ea89de1d4b0a2572f25ba0";
  storyId = "56eba38bf44831487912cbd5";
  //res.send(deleteFromSprint(sprintId, listId, storyId));
  //res.send(deleteFromBacklog(projectId, storyId));
  story.deleteStory(storyId, function(err, doc) {
    if(err){
      return(err);
    }
    else {
      res.send(deleteFromSprint(sprintId, listId, storyId));
      return(doc);
    }
  });
});

router.post('/', function(req, res, next){
//TODO: Need to get dynamic data... Structure of stories is updated.
//Please refer to new one and do the required changes.
   var newStory=new story(
     {
       listId:String,
       //storyCreatorId: {type:Schema.Types.ObjectId,ref:'User'},
       storyStatus:String,
       heading: String,
       description: String,
       createdTimeStamp: Date.now(),
       lastUpdated: Date,
       indicators:{
                 descriptionStatus: Boolean,
                 checklistGroupCount: Number,
                 attachmentsCount: Number,
                 commentCount: Number
      },
       attachmentList: [{
         fileName: String,
         timeStamp: Date,
         attachmentType:String,
         addedByUserName:String,
         addedByUserId:{type:Schema.Types.ObjectId,ref:'User'},
         path : String
       }],
       checklist: [
         {
           checklistHeading:String,
           checkedCount: Number,
           items: [{
             text: String,
             checked: Boolean,
             createdBy:{type:Schema.Types.ObjectId,ref:'User'},
             creationDate:Date,
             creatorName:String
           }]
         }
       ],
       memberList: [{type:Schema.Types.ObjectId,ref:'User'}],
       labelList:[{type:Schema.Types.ObjectId,ref:'Sprint.labelSchema'}]
     }
     );
     newStory.save(function(err,doc){
       if(err)
       res.send("ERROR-- "+err);
       else {
         projectId = "56ea78ea15eac2a96fedb5ee";//TODO: pass dynamicaly
         sprintId = "56ea89de1d4b0a2572f25b9c";
         listId = "56ea89de1d4b0a2572f25b9f";
         //res.send(loadToBuglist(projectId, doc));
         res.send(loadToSprint(sprintId, listId, doc));
       }
     });
});
function loadToBacklog(projectId, doc) {
  backlogsBuglist.addStoryBacklog(projectId, doc["_id"], function(err, doc) {
    if(err){
      return(err);
    }
    else {
      return(doc);
    }
  });
}
function deleteFromBacklog(projectId, storyId) {
  backlogsBuglist.deleteStoryBacklog(projectId, storyId, function(err, doc) {
    if(err){
      return(err);
    }
    else {
      return(doc);
    }
  });
}
function loadToBuglist(projectId, doc) {
  backlogsBuglist.addStoryBuglist(projectId, doc["_id"], function(err, doc) {
    if(err){
      return(err);
    }
    else {
      return(doc);
    }
  });
}
function deleteFromBuglist(projectId, storyId) {
  backlogsBuglist.deleteStoryBuglist(projectId, storyId, function(err, doc) {
    if(err){
      return(err);
    }
    else {
      return(doc);
    }
  });
}
function loadToSprint(sprintId, listId, doc) {
  sprint.addStory(sprintId, listId, doc["_id"], function(err, doc) {
    if(err){
      return(err);
    }
    else {
      return(doc);
    }
  });
}
function deleteFromSprint(sprintId, listId, storyId) {
  sprint.deleteStory(sprintId, listId, storyId, function(err, doc) {
    if(err){
      return(err);
    }
    else {
      return(doc);
    }
  });
}

router.get('/getStories',function(req,res,next){
  if (req.query.id) {

    story.getStories(req.query.id, function(err,data) {
      res.send(data);
    })
  } else {
    res.end()
  }
});
module.exports = router;
