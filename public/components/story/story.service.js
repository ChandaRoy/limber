fragileApp.factory('storyService',['$http','$filter',function($http,$filter) {

    this.getStoryDetails = function() {
      return  $http.get('/story');
    };
      this.saveStoryDescription = function(storyId,desc,githubProfile) {
    //    console.log("inside story factory");
    var encodedDesc=this.encodedString = $filter('bcEncode')(desc);

        return  $http.post('/story/saveStoryDescription?id='+storyId+'&desc='+encodedDesc,githubProfile);
      };

      this.addChecklistGroup = function(storyId,checklistObj) {
    //    console.log("inside story factory");
        return  $http.post('/story/addchecklistgroup?storyId='+storyId+'&checklistObj='+checklistObj);
      };

      this.getMembersData = function(storyId){
        return $http.post('/story/getMembersData?id='+storyId);
      }
      this.getLabelsData = function(storyId){
        return $http.post('/story/getLabelsData?id='+storyId);
      }

/***
author:sharan
function:getStoryCopyMovementData
parameters:projectId
description: This function is used to get the whole set of data particular to a project to copy\move the story across the releases\sprints of  project
***/
      this.getStoryCopyMovementData = function(projectId){
        return $http.post('/project/getstorymovedata?id='+projectId);
      }

/***
author:srinivas
function:addattachments
parameters:storyId
description: This function is used add the attachments in the story
***/
  this.addattachments = function(storyId) {
    return  $http.post('/story/addattachments?storyId='+storyId);
  };
  this.removeAttachment = function(storyId,attachmentId,file_name) {
    return  $http.post('/story/removeattachement?storyId='+storyId+'&attachmentId='+attachmentId+'&file_name='+file_name);
  };

  return this;

}]);

fragileApp.factory('modalService', function($uibModal) {
    return {
      open: function(size, template,subController, params) {
        return $uibModal.open({
          animation: true,
          templateUrl: template,
          controller: subController,
          size: size,
          resolve: {
            param: function() {
              return params;
            }
          }
        });
      }
    };
  })
