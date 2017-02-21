var supertest = require("supertest");
var expect = require("chai").expect;
var assert = require("chai").assert;
var app = require('../bin/www');
var url = supertest("http://localhost:8080");
var releaseurl = supertest("http://localhost:8080/graph/release/?id=571212d1a8e0fa1a213d39aa");
var sprinturl = supertest("http://localhost:8080/graph/cfd/?id=571212d1a8e0fa1a213d39a6");
// var storyurl = supertest("http://localhost:8080/graph/sprint/?id=570f0da5c7de01da21078e69");
var userurl = supertest("http://localhost:8080/graph/sprint/?id=571212d1a8e0fa1a213d39a2");


describe("Define the graph route with home API of frAgile app",function(){
it("Should be able to serve json from graph route",function(done){

// var id = '571319b7140baed727ec0cf9';
url.get("/home")
    .expect("Content-Type",/json/)
    .expect(200) // HTTP status should be 200
    .end(function(err,res){
      //console.log(res);
      done();
    });
});
});

describe("Define the graph route with Release API of frAgile app",function(){
it("Should be able to serve json when we pass id for graph and release route",function(done){

url.get("/graph/release")
    .expect("Content-Type",/json/)
    .expect(200) // HTTP status should be 200
    .end(function(err,res){
      // console.log(res.body);
      console.log(err);
      done();
    });
});
});

describe("Define the graph route with Release API of frAgile app",function(){
it("Should be able to serve json with graph and cfd route",function(done){

url.get("/graph/cfd")
    .expect("Content-Type",/json/)
    .expect(200) // HTTP status should be 200
    .end(function(err,res){
      //console.log(res);
      done();
    });
});
});

describe("Define the graph route with Sprint API of frAgile app",function(){
it("Should be able to serve json with graph and release route",function(done){

url.get("/graph/sprint")
    .expect("Content-Type",/json/)
    .expect(200) // HTTP status should be 200
    .end(function(err,res){
      //console.log(res);
      done();
    });
});
});

describe("Define the graph route with User API of frAgile app",function(){
it("Should be able to serve json with graph and user route",function(done){

url.get("/graph/user")
    .expect("Content-Type",/json/)
    .expect(200) // HTTP status should be 200
    .end(function(err,res){
      //console.log(res);
      done();
    });
});
});


describe("Define the project route of frAgile application: ",function(){
 it("should be able to serve json from project route",function(done){
   releaseurl.get("/graph/release")
   .expect("Content-Type",/json/)
   .expect(200) // THis is HTTP response
   .end(function(err,res){
    //  console.log(res.body);
     done();
   });
 });
});

describe("Define the project route of frAgile application: ",function(){
 it("should be able to serve json from project route",function(done){
   sprinturl.get("/graph/cfd")
   .expect("Content-Type",/json/)
   .expect(200) // THis is HTTP response
   .end(function(err,res){
    //  console.log(res.body);
     done();
   });
 });
});

describe("Define the project route of frAgile application: ",function(){
 it("should be able to serve json from project route",function(done){
   sprinturl.get("/graph/sprint")
   .expect("Content-Type",/json/)
   .expect(200) // THis is HTTP response
   .end(function(err,res){
    //  console.log(res.body);
     done();
   });
 });
});

describe("Define the project route of frAgile application: ",function(){
 it("should be able to serve json from project route",function(done){
   userurl.get("/graph/user")
   .expect("Content-Type",/json/)
   .expect(200) // THis is HTTP response
   .end(function(err,res){
     console.log(res.body);
     done();
   });
 });
});
