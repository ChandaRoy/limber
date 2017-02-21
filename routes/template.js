var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Template = require('../models/template.js');

/* This can be called during project setup only once */
router.get('/', function(req, res, next) {

  Template.findMasterTemplate('Master',function(err,data){
if(err){
  res.send(err);
}else {
  res.send(data);
}
});
});
module.exports = router;
