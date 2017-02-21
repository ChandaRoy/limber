var expect = require('chai').expect,
sinon = require('sinon'),
request = require('supertest'),
app = require('../bin/www'),
address = request("http://localhost:8080"),
Projectspy=require("../models/project");

describe.skip('Find a number of Count http//localhost:8080 has hit', function(){
  it('Should console the number of count ', function(done){
    var spy = sinon.spy(Projectspy, 'find');
    address
    .get('/project/?id=570cda09d18c07d249956ef6')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res){
      if (err) return done(err);
      var Count=spy.callCount,Countargs=spy.args, CountreturnValues=spy.returnValues;
      console.log(Countargs);
      console.log(CountreturnValues);
      console.log(Count);
      done();
    });
  });
});
