
var request=require('request');
var api_calls={};
api_calls.getIssues=function(options, cb){
  request.get(options, cb);
}

api_calls.getRepos=function(options,cb){
  request.get(options,cb);

    }
api_calls.postIssue=function(options,cb){
  request.post(options,cb);
}

module.exports = api_calls;
