 angular.module('fragileApp').factory('rgService', ['$http', function($http) {
return{
        getReleaseGraph : function(projectID) {
         var url = '/graph/cfd?id=' + projectID;
         console.log(url);
          return $http.get(url);
        }
      }
  }]);
