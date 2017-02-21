var fragileApp = angular.module('fragileApp');

fragileApp.controller('activityController', function($scope, $http, Socket, activityService, $rootScope) {
  var socket = Socket($scope);

  $scope.storyID = $scope.$parent.storyID;

  if($scope.storyID) //Load story data, if storyID is present
  activityService.getStoryData($scope.storyID).success(function(response) {
    // For each activity, go to activityService and add the preposition, etc
    response.forEach(function(data) {
      activityService.parseData(data);
    });
    // Save the above parsed data into 'activities' model
    $scope.activities = response;
  });
  // Based on the project clicked, send its projectID to display its corresponding activity
  else
  activityService.getProjectData($rootScope.projectID).success(function(response) {
    // For each activity, go to activityService and add the preposition, etc
    $scope.page = 1;
    response.forEach(function(data) {
      activityService.parseData(data);
    });
    // Save the above parsed data into 'activities' model
    $scope.activities = response;
  });


  // Refresh the activity time every 45 sec
  setInterval(refreshTimeStamp, 45000);

  function refreshTimeStamp() {
    var response = $scope.activities;
    response.forEach(function(data) {
      data.timeAgo = moment(data.date).fromNow();
    });
    $scope.$apply();
  }

  // Click function for moreActivity
  $scope.moreActivity = function() {
    // Add +1 to page everytime moreActivity is clicked
    // Added before passing to service coz 1st time on page load it will show 1st page results
    $scope.page = parseInt($scope.page) + 1;
    activityService.moreActivity($rootScope.projectID, $scope.page).success(function(response) {
      // For each activity, go to activityService and add the preposition, etc
      if (response.length > 0) {
        response.forEach(function(data) {
          activityService.parseData(data);
          // Push the above parsed data into 'activities' model to show all existing activities as well
          $scope.activities.push(data);
        });
        $scope.moreData = false;
      } else {
        $scope.moreData = true;
      }

    });
  }


  socket.on('activityAdded', function(data) {
    activityService.parseData(data);
    if($scope.storyID){
      if( data.target._id == $scope.storyID || data.object._id == $scope.storyID )
      $scope.activities.unshift(data);
    }
    else
    $scope.activities.unshift(data);

  });

});
