var supertest = require("supertest");
var expect = require("chai").expect;
var assert = require("chai").assert;
var app = require('../bin/www');
var url = supertest("http://localhost:8080");
var projecturl = supertest("http://localhost:8080/project/?id=57026055772a712a164d70bb");
var sprinturl = supertest("http://localhost:8080/sprint/?id=5711f517be7cf90d2b5a137f");
var storyurl = supertest("http://localhost:8080/story/?id=570f0da5c7de01da21078e69");

describe("Define the project route of frAgile application: ",function(){
  it("should be able to serve json from project route",function(done){
    url.get("/project/?id=57026064772a712a164d70bd")
    .expect("Content-Type",/json/)
    .expect(200) // THis is HTTP response
    .end(function(err,res){
      done();
    });
  });
});
describe("Define the sprint route of frAgile application:",function(){
  it("should be able to serve json from sprint route",function(done){
    storyurl.get("/")
    .expect("Content-Type",/json/)
    .expect(200) // THis is HTTP response
    .end(function(err,res){
      done();
    });
  });
});
describe("Define the story route of frAgile application:",function(){
  it("should be able to serve json from story route",function(done){
    url.get("/")
    .expect("Content-Type",/json/)
    .expect(200) // THis is HTTP response
    .end(function(err,res){
      done();
    });
  });
});
describe("Define the project route of frAgile application4:",function(){
  it("should be able to check if _id of project matches with testing parameter ",function(done){
    url.get("/project?id=5711f4a9be7cf90d2b5a1377")
    .expect("Content-Type",/json/)
    .expect(200) // THis is HTTP response
    .end(function(err,res){
      console.log(res.body);
      //expect(res.body._id).to.be.equal("57026055772a712a164d70bb");
      done();
    });
  });
});
describe("Define the sprint route of frAgile application:",function(){
  it("should be able to check if name of project matches with testing parameter ",function(done){
    sprinturl.get("/")
    .expect("Content-Type",/json/)
    .expect(200) // THis is HTTP response
    .end(function(err,res){
      expect(res.body.name).to.be.equal("Sprint 1");
      done();
    });
  });
});
