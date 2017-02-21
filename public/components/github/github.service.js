angular.module('fragileApp').factory('githubService',['$http',function($http){
  return {
    getAllRepos:function(){
      return $http.get('/github/repos');
    },
    addRepo: function(repoDetails){
      return $http.post('/github/repos',JSON.stringify(repoDetails));
    },
    getIssues:function(prId){
      return $http.get('/github/issues?projectId='+prId);
    },
    addIssue:function(issue){

      return $http.post('/github/issues', issue);
    }
}}])
