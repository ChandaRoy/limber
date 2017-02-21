fragileApp.factory('sprintService',['$http',function($http) {

this.currentRoom={};

  this.getStory = function(storyID) {
      return  $http.get('/story?id='+storyID);//pass pass parameter in post
    };

  this.getSprints = function(sprintId) {
    return  $http.get('/sprint?id='+sprintId);
  };

  this.getBackBug = function(prId) {
    return  $http.get('/project/backLogsBugList/?projId='+prId);
  };

  this.getLabelMasterData=function(){
    return $http.get('/template');
  }
/***
author:sharan & Shrinivas
function: getProjectMembers
description:Added by sharan to fetch the project members from the Project schema and pass to story Modal.
parameter:projectid
**/
//
  this.getProjectMembers = function(projectId) {
   return $http.post('/project/getProjectMembers?id='+projectId);
 };

 this.getProject  = function(sprintID){
   return $http.get('/project?sprintID='+ sprintID);
 }

  return this;

}]);
