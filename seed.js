var mongoose = require('mongoose');

var Project = require('./models/project');

Project.remove({}, function(err) {
  var project1 = new Project({
    name : 'SeedProject',
    description : 'Mt Seed Project',
    date : new Date()
  });

  project1.save(function(err, savedProject) {
    if(err) { console.error('Problem Seeding Project'); process.exit(-1); }
    console.log('Created Project with ID: ' + savedProject._id);
  });
});
