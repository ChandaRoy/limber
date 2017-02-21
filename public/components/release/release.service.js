angular.module('fragileApp').factory('releaseService', ['$http', function($http) {

    return {
      getSprints: function(releaseID) {
        var url = '/project/sprints?releaseID=' + releaseID;
        return $http.get(url);
      },

      addSprint: function(name, desc) {
        var req = {
          method: 'POST',
          url: '/project',
          data: {
            name: name,
            desc: desc
          }
        }
        return $http(req);
      },

      addSprint2: function(projectId, releaseId, name, desc){
        var req = {
          method: 'POST',
          url: '/sprint',
          data: {
            projectId: projectId,
            releaseId: releaseId,
            name: name,
            desc: desc
          }
        }
        return $http(req);
      }

    }
  }]);
