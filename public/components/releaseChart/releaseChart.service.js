//TODO : Should I use $stateProvider
 angular.module('fragileApp').factory('releaseGraphService', ['$http', function($http) {
   return{

    getReleaseGraph: function(projectID) {
      var url = '/graph/release?id=' + projectID;
      return $http.get(url);
    },
    // TODO: Remove Hardcode
    getUserProjectsAndReleases: function() {

      var url = '/graph/home';
      return $http.get(url);
    }
  }
}]);
