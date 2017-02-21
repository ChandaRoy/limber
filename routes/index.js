var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Activity = require('../models/activity.js');
var User = require('../models/user.js');
var Project = require('../models/project.js');
var Sprint = require('../models/sprint.js');
var Story = require('../models/story.js');

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index2');
});

module.exports = router;
