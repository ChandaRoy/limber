var express = require('express');
var router = express.Router();
var user = require('../models/user.js');
var project = require('../models/project.js');
var sprint = require('../models/sprint.js');
var story = require('../models/story.js');
var user = require('../models/user.js');

var mongoose = require('mongoose');

router.get('/home', function(req, res) {
var userId = req.user._id;
    user.findOne({'_id': userId },'projects')
    .populate("projects","_id name release._id release.name release.sprints")
    .exec(function(err , doc) {
      if (err) {
        res.send(err);
      } else {
        res.send(doc);
      }
    });
});

router.get('/project', function(req, res) {
  var userId = req.query.id;
    user.findOne({'_id': userId },'projects')
    .populate("projects","_id name release._id release.name")
    .exec(function(err , doc) {
      if (err) {
        res.send(err);
      } else {
        res.send(doc);
      }
    });
});

// Route to get release chart data
router.get('/release', function(req, res) {
  var projectId = req.query.id;
  // console.log(id);
  project.findOne({'_id': projectId},'release._id release.creationDate release.releaseDate release.name release.sprints')
  .populate("release.sprints", "endDate startDate list.group list.stories")
  .exec(function(err , doc) {
    if (err) {
      res.send(err);
    } else {
      res.send(doc);
    }
  });

});


// Route to get Cumulative Flow Diagram chart data
// TODO: Need to get the maximum count among the sprints inside a single release.
router.get('/cfd', function(req, res) {
  var projectId = req.query.id;
  project.findOne({'_id': projectId},'release._id release.sprints')
  .populate("release.sprints", "name list.group list.stories")
  .exec(function(err , doc) {
    if (err) {
      res.send(err);
    } else {
      res.send(doc);
    }
  });

});

// Route to get sprints chart data
router.get('/sprint', function(req, res) {
  var sprintId = req.query.id;
  sprint.findOne({'_id': sprintId },'list')
  .exec(function(err , doc) {
    if (err) {
      res.send(err);
    } else {
      res.send(doc);
    }
  });
});

//Route for getting user details
router.get('/user', function(req, res) {
  var userId = req.query.id;
  user.findOne({'_id': id },'initials firstName createdDate projects')
  .populate("projects", "name date")
  .exec(function(err , doc) {
    if (err) {
      res.send(err);
    } else {
      res.send(doc);
    }
  });
});

module.exports = router;
