var expect = require('chai').expect,
sinon = require('sinon'),
app = require('../bin/www'),
request = require("supertest"),
address = request("http://localhost:8080"),
Projectstub=require("../models/project"),
Storystub=require("../models/story"),
Sprintstub=require("../models/sprint");

describe('Find a project id given the argument: ', function(){
  var projectStubfind = sinon.stub(Projectstub, 'find');
  beforeEach(function(done){
    var param0={"_id" : "xyz","name" : "Project_0",      "description" : "project 1 is a project. What else it can be!",      "date" : "2016-03-15T09:49:36.501Z",      "release" : [],      "memberList" : [],      "__v" : 0    };
    var projectmockFind = {
      exec : function(callback){
        callback(null,param0);
      },
      populate : function(){
        return this;
      }
    };
    projectStubfind.withArgs({ '_id' : {$in : ['xyz']}}).returns(projectmockFind);
    done();
  });
  afterEach(function() {
    projectStubfind.restore();
  });
  it('should attempt to find project whose id is xyz', function(done){
    address
    .get('/project/?id='+'xyz')
    .expect('Content-Type', /json/)
    .end(function(err, res){
      if (err) {
        return done(err);
      }
      expect(res.body.name).to.be.equal('Project_0');
      done();
    });
  });
});
describe('Finding a Story id given the argument', function(){
  var StoryStubfindOne = sinon.stub(Storystub, 'findOne');
  beforeEach(function(done){
    var param1={"_id" : "56ffaa09b69af9fa2be2daab","storyStatus" : "Completed","heading" : "This story has been created for a story testing purpose","description" : "This is Demo","descriptionStatus" : true,"lastUpdated" : "2016-03-17T18:14:43.109Z","checklistGroupCount" : 3,"attachmentsCount" : 3,"commentCount" : 3,"labelList" : [ ],"memberList" : [{"initials":'SK'}],"checklist" : [],"attachmentList" : [],"__v" : 0};
    var storymockFind = {
      exec : function(callback){
        callback(null,param1);
      },
      populate : function(){
        return this;
      }
    };
    StoryStubfindOne.withArgs({ '_id' : '56ffaa09b69af9fa2be2daab' }).returns(storymockFind);
    done();
  });
  afterEach(function() {
    StoryStubfindOne.restore();
  });
  it('should attempt to find story', function(done){
    address
    .get('/story/?id='+'56ffaa09b69af9fa2be2daab')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res){
      if (err) return done(err);
      expect(res.body.storyStatus).to.be.equal('Completed');
      done();
    });
  });
});
// describe.skip('Removing a Story id given the argument:', function(){
//   var StoryStubremove = sinon.stub(Storystub, 'remove');
//   beforeEach(function(done){
//     var param1={"_id" : "56ffaa09b69af9fa2be2daab","storyStatus" : "Completed","heading" : "This story has been created for a story testing purpose","description" : "This is Demo","descriptionStatus" : true,"lastUpdated" : "2016-03-17T18:14:43.109Z","checklistGroupCount" : 3,"attachmentsCount" : 3,"commentCount" : 3,"labelList" : [ ],"memberList" : [],"checklist" : [],"attachmentList" : [],"__v" : 0};
//     var storymockFind = {
//       exec : function(callback){
//         callback(null,param1);
//       }
//     };
//     StoryStubremove.withArgs({ '_id' : '56ffaa09b69af9fa2be2daab' }).returns(storymockFind);
//     done();
//   });
//   afterEach(function() {
//     StoryStubremove.restore();
//   });
//   it('should attempt to remove Story', function(done){
//     address
//     // .get('/story/delete/?id=56ffaa09b69af9fa2be2daab')
//     .post('/story/delete')
//     //.field('storyId','56ffaa09b69af9fa2be2daab')
//     .expect(200)
//     .expect('Content-Type', /json/)
//     .end(function(err, res){
//       if (err) return done(err);
//       expect(res.body.storyStatus).to.be.equal('Completed');
//       done();
//     });
//   });
// });
