var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Activity = require('../models/activity.js');
var User = require('../models/user.js');
var Project = require('../models/project.js');
var Sprint = require('../models/sprint.js');
var backLogsBugList = require('../models/backlogBuglist.js');
var Personal=require('../models/personal.js');
var Group=require('../models/group.js')

router.get('/backLogsBugList', function(req, res, next) {
  projectId = req.query.projId;
  backLogsBugList.findList(projectId, function(err, doc) {
    if(err){
      res.send(err);
    }
    else {
      res.send(doc);
    }
  });
});

//Get members in a projectID

router.get("/memberList", function(req, res, next) {

  if (req.query.id) {
    Project.getProjectMembers(req.query.id, function(err, doc) {
      if (err) {
        res.send(err);
      }else {
        res.send(doc);
      }
    });
  }
});



router.get('/', function(req, res, next) {
  //releaseId = req.query.id.replace("/","");
  if(req.query.sprintID){
    Project.find({"release.sprints":{$in: [req.query.sprintID]}},{"release" : 1,"name":1}).exec(function(err,data){
      res.send(data);
    })
  } else {
    projectId = req.query.id.replace("/", "");
    Project.findProj(projectId, function(err, doc) {
      if (err) {
        res.send(err);
      } else {
        res.send(doc);
      }
    });
  }

});

router.post('/', function(req, res, next) {
  Project.create({
    name: req.body.name,
    description: req.body.desc,
    //labelId:result._id,
    date: Date.now(),
    memberList :[req.user._id]
  }, function(err, data) {
    if(err){
      res.send(err);
    }

    else{

      var backBug = new backLogsBugList(
        {
          projectId : data._id,
          backlogs: {
            listName: "Backlogs"
          },
          buglist: {
            listName: "BugLists"
          }
        }
      );
      backBug.save(function(err, doc) {
        if(err){
          res.send(err);
        }
        else {
          res.send(data);//comment this
        }
      });


    }
  });
});

router.get('/sprints', function(req, res, next) {
  if (req.query.releaseID) {
    Project.getSprints(req.query.releaseID, function(data) {
      res.send(data);
    })
  } else {
    res.end();
  }
});

//TODO: Remove, once implementd using Sockets
router.post('/release', function(req, res, next) {
  projectId = req.body.projectID;
  release = {
    name: req.body.name,
    description: req.body.desc,
    creationDate: Date.now(),
    releaseDate: req.body.dt
  };
  Project.addRelease(projectId, release, function(err, doc) {
    if (err) {
      res.send(err);
    } else {
      res.send(doc);
    }
  });
});

router.post('/updateProject', function(req, res, next) {
  newProject = {};
  newProject.name = req.body.name;
  newProject.description = req.body.description;
  Project.updateProject(req.body.projectId, newProject, function(err, doc) {
    if (err) {
      res.send(err);
    } else {
      res.send(doc);
    }
  });
});

router.post('/addMember', function(req, res, next) {
  projectId = "56ea78dd15eac2a96fedb5ec"; // TODO: get dynamic data
  memberId = ["56efe4afb0d86f2b174916fe", "56efe48c52719111179e6de1"];
  project.addMember(projectId, memberId, function(err, doc) {
    if (err) {
      res.send(err);
    } else {

      user.addProjectToUser(memberId, projectId, function(data) {
        res.send(data);
      });
    }
  });
});

router.post('/removeMember', function(req, res, next) {
  projectId = "56ea78dd15eac2a96fedb5ec"; // TODO: get dynamic data
  memberId = "56efe48c52719111179e6de1";
  project.removeMember(projectId, memberId, function(err, doc) {
    if (err) {
      res.send(err);
    } else {

      user.removeProjectfromUser(memberId, projectId, function(data) {
        res.send(data);
      });
    }
  });
});


router.post('/updateRelease', function(req, res, next) {
  projectId = "56ea78ea15eac2a96fedb5ee";
  releaseId = "56ea796e924ce3c56f7d2e57"; // TODO: get dynamic data
  // newProject = {};
  // newProject.name = "Batman";
  // newProject.description = "I am awesome";
  // newProject.date = Date.now();
  newRelease = {};
  newRelease.name = "Deadpool";
  newRelease.description = "I am awesome";
  newRelease.creationDate = Date.now();
  newRelease.releaseDate = Date.now();
  project.updateRelease(projectId, releaseId, newRelease, function(err, doc) {
    if (err) {
      res.send(err);
    } else {
      res.send(doc);
    }
  });
});

router.post('/getstorymovedata',function(req,res,next){
  var projectId = req.query.id;
  Project.getStoryMoveData(projectId,function(err,doc){
    if (err) {
      res.send(err);
    }else{
      res.send(doc);
    }
  })
});

router.get('/channelId',function(req,res,next){

  Personal.findMatchedSubject(req.query.projectId,req.query.member,function(err,doc){
    if(!err){
      res.send(doc);
    }
    else {console.log(error);}
  }
)
});

router.get('/allChannels',function(req,res,next){
  Personal.find(
    {"projectId":req.query.projectId
  } ,function(err,doc){
    if(!err){
      res.send(doc);
    }
    else {console.log(error);}
  }
)
});

router.get('/groupDetails',function(req,res,next){
  Group.getGroupDetails(req.query.channelIds,function(err,doc){
    if(!err){
      res.send(doc);
    }
  })
});


module.exports = router ;
