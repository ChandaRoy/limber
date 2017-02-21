// Prepositions to add to activity based on the action
var prepositionsMap = {
  "added": " to ",
  "created": " the ",
  "commented": " on ",
  "moved": " to ",
  "changed": " to ",
  "deleted": " from ",
  "changed" : " to ",
  "removed" : " from ",
  "completed" : " in ",
  "unchecked" : " in ",
  "attached" : " to "
};

angular
  .module('fragileApp')
  .factory('activityService', ['$http', function($http) {

    return {
      getProjectData: function(projectID) {
        // Retrieves the activity for the given projectID
        var url = '/activity?project=' + projectID;
        // Returns a promise
        return $http.get(url);
      },
      getStoryData :  function(storyID){
        var url = '/activity?story=' + storyID;
        // Returns a promise
        return $http.get(url);
      },
      parseData: function(data) {
        // Adds a preposition
        data.preposition = prepositionsMap[data.action];
        // FIXME: Time not coming properly.
        activityDate = new Date(data.date)
        activityDate.setMinutes(activityDate.getMinutes() - 1);
        // Adds activity corresponding time from now
        data.timeAgo = moment(activityDate).fromNow();

        // Adds a class based on target type
        switch (data.target.kind) {
          case "Story":
            data.targetClass = "activity-object-link";
            break;
          default:
            data.targetClass = "activity-object-link-disabled";
            break;
        }

        // Adds a class to object if object exists
        if (data.object) {
          switch (data.object.kind) {
            case "Story":
              data.objectClass = "activity-object-link";
              break;
            case "User":
              data.objectClass = "activity-username activity-object-link-disabled";
              break;
            case "Comment":
              data.objectClass = "activity-comment";
              break;
            default:
              data.objectClass = "activity-object-link-disabled";
              break;
          }
        }
      },

      moreActivity: function(projectID, page){
        // Retrieves top 10 activity for the given projectID
        var url = '/activity?project=' + projectID + '&page=' + page;
        // Returns a promise
        return $http.get(url);

      },

      getMembers: function(projectID){

        var url = '/project/memberList?id=' + projectID

        return $http.get(url);
      },

      getUserId: function(userEmailId){
        var url = "/user/getUserId?email=" + userEmailId;
        return $http.get(url);
      },

      getUsers: function(searchText){
        var url = "/user/getUsers?email=" + searchText;
        return $http.get(url);
      },
      getAllUsers:function(){
        var url = "/user/all";
        return $http.get(url);
      }
    }


  }])
