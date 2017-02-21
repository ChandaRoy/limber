var expect = require('chai').expect,
app = require('../bin/www'),
Projectstub=require("../models/project"),
Storystub=require("../models/story"),
Sprintstub=require("../models/sprint");


describe('angularjs homepage', function() {
  it('should have a title', function() {
    browser.get("http://localhost:8080");
    expect(browser.getTitle()).toContain('frAgile');
  });
});
