fragileApp.controller('modalController', ['$scope', '$rootScope', '$stateParams', 'projectService', '$uibModal', '$uibModalInstance', '$location','Socket' ,function($scope, $rootScope, $stateParams, projectService, $uibModal, $uibModalInstance, $location,Socket) {
  var socket = Socket($scope);

  $scope.dismissThis = "none";
  $scope.warningModalDesc = true;
  $scope.warningModalName = true;
  $scope.warningModalDate = true;

  $scope.sync={sync:false};
  socket.on("sync",function(obj)
  {
    $scope.sync=obj;
  })
  // var story = this;
  // story.items =boardFactory.storyData;
  var modalContr = this;
  modalContr.addWhat = projectService.addWhat;
  modalContr.addId = projectService.addId;
  $scope.AddNewProject = function() {
    if ($scope.newReleaseName == undefined || $scope.newReleaseName == "") {
      $scope.warningModalName = false;
    } else {
      $scope.warningModalName = true;
    }
    // if ($scope.newReleaseDesc == undefined || $scope.newReleaseDesc == "") {
    //   $scope.warningModalDesc = false;
    // } else {
    //   $scope.warningModalDesc = true;
    // }
    if ($scope.newReleaseName != undefined && $scope.newReleaseName != "") {
      var emitData={
        'message' : {'command':'generateUUID'},
        'details':{}
      }

      projectService.addProject($scope.newReleaseName, $scope.newReleaseDesc).success(function(response) {

        projectService.addProjectToUser( response._id).success(function(data) {
          emitData.details.projectId=response._id;
          socket.emit('subscribe',emitData);

          //Pushing added object into the scope to display
          $rootScope.projects.push(data[0]);

          //Emitting add activity event
          var data = {
            room: "projectRoom",
            action: "created",
            projectID: data[0]._id,
            target: {
              name: data[0].name,
              type: "Project",
              _id: data[0]._id
            },
            user:$rootScope.userProfile
          }
          socket.emit('addActivity', data);


        });
      });
      //  socket.on('generateUUID',function(data){
      //
      // })

      $scope.dismissThis = "modal";
      $scope.newReleaseName = "";
      $scope.newReleaseDesc = "";
      $uibModalInstance.dismiss('cancel');
    }
  }
  $scope.AddNewRelease = function() {
    if ($scope.newReleaseDate != undefined) {
      $scope.newReleaseDate = new Date($scope.newReleaseDate);
    }
    if ($scope.newReleaseName == undefined || $scope.newReleaseName == "") {
      $scope.warningModalName = false;
    } else {
      $scope.warningModalName = true;
    }
    // if ($scope.newReleaseDesc == undefined || $scope.newReleaseDesc == "") {
    //   $scope.warningModalDesc = false;
    // } else {
    //   $scope.warningModalDesc = true;
    // }
    if ($scope.newReleaseDate == undefined || $scope.newReleaseDate == "") {
      $scope.warningModalDate = false;
    } else {
      $scope.warningModalDate = true;
    }
    if ($scope.newReleaseName != undefined && $scope.newReleaseName != "" &&
    $scope.newReleaseDate != undefined && $scope.newReleaseDate != ""
  ) {

    //Emitting release data to be added
    data = {
      room:'projectRoom',
      projectID: modalContr.addId,
      name: $scope.newReleaseName,
      desc: $scope.newReleaseDesc,
      dt: $scope.newReleaseDate,
      userID:$scope.userID,
      fullName:$scope.fullName,
      'user':$rootScope.userProfile
    }
    socket.emit('project:addRelease', data);



    $scope.dismissThis = "modal";
    $scope.newReleaseName = "";
    $scope.newReleaseDesc = "";
    $scope.newReleaseDate = "";
    $uibModalInstance.dismiss('cancel');
  }
}
$scope.closeThis = function() {
  $uibModalInstance.dismiss('cancel');
}



}]);
