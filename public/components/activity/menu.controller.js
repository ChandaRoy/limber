var fragileApp = angular.module('fragileApp');

fragileApp.controller('menuController', function($scope, $http, Socket, activityService, $rootScope,$state) {

  var socket = Socket($scope);

  //For members list
  $rootScope.projMemberList = [];
  activityService.getMembers($rootScope.projectID).success(function(response) {
    response.memberList.forEach(function(data) {
      data.fullName = data.firstName + " " + data.lastName;
    })
    $rootScope.projMemberList = response.memberList;
  });

  var dbIds;
  $scope.getAllUsers = function() {
    $scope.dbUsers = [];
    dbIds = [];
    activityService.getAllUsers().success(function(response) {
      response.forEach(function(data) {
        $scope.dbUsers.push(data.email);
        dbIds.push(data._id);
      });
    });
  }

  $scope.addMember = function() {
      var userFound = false;
      var addedUserId = "";
      $scope.dbUsers.forEach(function(value, index) {
        if (value == $scope.addedUserEmail) {
          addedUserId = dbIds[index];
          userFound = true;
        }
      });

      if (userFound == false) {
        alert('User Not Found!');
      } else {
        socket.emit('activity:addMember', {
          'room': 'activity:' + $rootScope.projectID,
          'projectId': $rootScope.projectID,
          'memberList': [addedUserId],
          'projectName': $scope.projectName,
          'user':$rootScope.userProfile
        });
      }

    }

  socket.on('activity:memberAdded', function(data) {
    data.fullName = data.firstName + " " + data.lastName;
    $rootScope.projMemberList.push(data);
  });

  socket.on('activity:addMemberFailed',function(data){
      alert(data);
  });

  socket.on('activity:memberRemoved', function(userData) {
    var fullName = userData.firstName + " " + userData.lastName;
    $rootScope.projMemberList.forEach(function(data, index) {
      if (userData._id == data._id)
        $rootScope.projMemberList.splice(index, 1);
    });


    //Kick user out if he has been removed
    if(userData._id == $scope.currentUserID){
      alert("You were removed from this project, redirecting to home page")
      $state.go('project');
    }
  })

  $scope.removeMember = function(memberId) {

    socket.emit('activity:removeMember', {
      'room': 'activity:' + $rootScope.projectID,
      'projectId': $rootScope.projectID,
      'memberId': memberId,
      'user':$rootScope.userProfile
    });

  }


});
