angular.module('fragileApp').factory('sprFactory', function($uibModal) {
   return {
     open: function(size, template,subController, params) {
       return $uibModal.open({
         animation: true,
         templateUrl: template,
         controller: subController,
         size: size,
         resolve: {
           params: function() {
             return params;
           }
         }
       });
     }
   };
 });

 angular.module('fragileApp').factory('sprService', ['$http', function($http) {
 this.getSprintGraph = function(sprintID) {
   var url = '/graph/sprint?id=' + sprintID;
    return $http.get(url);
  };
  return this;
}]);


