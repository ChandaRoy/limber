fragileApp.controller('modalReleaseController', ['$scope', '$rootScope', 'releaseService', '$uibModal', '$uibModalInstance','$stateParams', 'Socket', function($scope, $rootScope, releaseService, $uibModal, $uibModalInstance,$stateParams, Socket) {

  var socket = Socket($scope);


  $scope.closeThis = function() {
    $uibModalInstance.dismiss('cancel');
  };
  $scope.addItem = function() {
    if ($scope.addMe != undefined && $scope.addMe.trim().length > 0) {
      $scope.listArray.splice($scope.listArray.length - 1, 1);
      var list = {
        "group": "inProgress",
        "listName": $scope.addMe.trim(),
        "stories": []
      };
      var releasable = {
        "group": "Releasable",
        "listName": "Releasable",
        "stories": []
      };
      $scope.listArray.push(list);
      $scope.listArray.push(releasable);
      $scope.addMe = "";
    }

  };
  $scope.removeItem = function(listIndex) {
    if (listIndex == $scope.listArray.length - 1) {

    } else
      $scope.listArray.splice(listIndex, 1);
  };
  $scope.getList = function() {
    $scope.listArray = $rootScope.list;
  };
  $scope.roomName = "release:" + $stateParams.releaseID;
  $scope.addSprint = function() {
    // Emit to refresh all other clients
    if ($scope.newSprintName == undefined || $scope.newSprintName == "") {
      $scope.warningModalName = true;
    }
    if ($scope.startDate != undefined && $scope.startDate != "") {
      $scope.startDate = new Date($scope.startDate);
    }
    if ($scope.endDate != undefined && $scope.endDate != "") {
      $scope.endDate = new Date($scope.endDate);
    }
    if ($scope.newSprintName != undefined && $scope.newSprintName != "" && $scope.startDate != undefined && $scope.endDate != undefined && $scope.startDate != "" && $scope.endDate != "") {
      socket.emit('release:addSprint', {
        'room': $scope.roomName,
        'projectId': $stateParams.prId,
        'releaseId': $stateParams.releaseID,
        'releaseName': $rootScope.releaseName,
        'name': $scope.newSprintName,
        'endDate': $scope.endDate,
        'startDate': $scope.startDate,
        'desc': $scope.newSprintDesc,
        'list': $scope.listArray,
        'user':$rootScope.userProfile
      });
      $uibModalInstance.dismiss('cancel');
    }


  }

}]);
