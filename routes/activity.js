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

    if (req.query.story)
      Activity.findEventsbyStory(req.query.story, function(data) {
        res.send(data);
      });
    else if (req.query.project)
    {
      var page = req.query.page || '1';
      Activity.findEventsbyProject(req.query.project, page, function(data) {
        res.send(data);
      });
    }
    else
      res.end();

});
module.exports = router;
