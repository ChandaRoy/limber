angular.module('fragileApp').controller('graphModalController',['$scope','$rootScope','graphModalFactory','componentTemplate','title','$uibModalInstance','$compile',function($scope,$rootScope,graphModalFactory,componentTemplate,title,$uibModalInstance,$compile){

  $scope.template = componentTemplate;
  $scope.title = title;
  $scope.closeGraph = function() {
    $uibModalInstance.dismiss('cancel');
  }
}]);
