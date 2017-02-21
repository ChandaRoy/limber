var router = require('express').Router();
var mongoose = require('mongoose');

var Activity = require('../models/activity.js');
var User = require('../models/user.js');
var Project = require('../models/project.js');
var Sprint = require('../models/sprint.js');
var Story = require('../models/story.js');

router.get('/',function(req,res,next){
  user ={
    _id : req.user._id,
    email : req.user.email
  }
  res.send(user);
});

router.get('/all',function(req,res,next){
  User.find({},{email : 1},function(err,data){
    res.send(data);
  })
})
//to get projects of a userID
router.get('/projects', function(req, res, next) {// LOGINCHANGE
  if (req.user._id) {
    User.getProjects(req.user._id, function(data) {
      res.send(data);
    })
  } else {
    res.end()
  }
});

//to add project to a user
router.post('/addProject', function(req, res, next) {
  if (req.user._id && req.body.projectID) {// LOGINCHANGE
    User.addProjectToUser(req.user._id, req.body.projectID, function(err, data) {
      if (err)
        res.send("false");
      else {
        res.send(data);

      }
    })
  } else {
    res.send("false")
  }
});
router.post('/updateUser', function(req, res, next) {
  var newUserDetails = {};
  newUserDetails.firstName= req.body.firstName;
  newUserDetails.lastName= req.body.lastName;
  newUserDetails.email= req.body.email;
  User.updateUser(req.user._id, newUserDetails, function(err, data) {
    if (err)
      res.send("false");
    else {
      res.send(data);

    }
  })
});
router.get('/getUserDetails', function(req, res, next) {
  userDetails = {
    firstName : req.user.firstName,
    lastName : req.user.lastName,
    email : req.user.email,
    _id : req.user._id,
    photo: req.user.photo,
    github: req.user.github
  };
  res.send(userDetails);
});
router.get('/githubAccount', function(req, res, next) {
  if(req.user.github.id){
  accountDetails = {
    id: req.user.github.id,
    username:req.user.github.name,
    token:req.user.github.token
  };
res.send(accountDetails);
  }
  else{
  res.send(false);}
});
router.get('/getUserId', function(req, res, next) {
  if (req.query.email) {
    User.getUserId(req.query.email, function(err, data) {
      if (err)
        res.send("false");
      else
        res.send(data);
    })
  }
  else {
    res.end();
  }
})

router.get('/getUsers', function(req, res, next){
  if(req.query.email){
    User.getUserEmail(req.query.email, function(err, data){
      if(!err){
        res.send(data);}
    })
  }
})

router.get('/cards',function(req,res,next){  if (req.user._id) {
    User.getCards(req.user._id, function(data) {
      res.send(data);
    })
  } else {
    res.end()
  }
});

router.get('/assignedStories',function(req,res,next)
{
User.getUserMember(req.user._id,function(err,data)
{
  if(!err)
  res.send(data);
  else {
    res.end()
  }
})
})

module.exports = router;
