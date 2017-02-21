fragileApp.controller('homeController', ['$scope', '$state', '$rootScope', 'homeService', '$filter','Socket', function($scope, $state, $rootScope, homeService, $filter,Socket) {
var socket = Socket($scope);


  $scope.loadProjects = function() {
    homeService.getUserDetails().success(function(response) {
      //TODO: Use single userProfile variable everywhere
      $rootScope.user = response;
      $rootScope.currentUserID = response._id;
      $rootScope.user.fullName = $rootScope.user.firstName + " " + $rootScope.user.lastName;
      $rootScope.userProfile = {
        _id: response._id,
        fullName: $rootScope.user.firstName + " " + $rootScope.user.lastName,
        photo: response.photo
      };
      $rootScope.githubProfile=response.github;
socket.emit('authenticate',{'user':$rootScope.userProfile._id});
    });
    homeService.getUserProjects().success(function(response){

      $rootScope.projects = response.projects
      if($rootScope.githubProfile.length!==0){
        $rootScope.projects.forEach(function (project){
          if(project.githubStatus ){
      socket.emit("github:integrateGit",{projectId:project._id,userId:$rootScope.userProfile._id,githubProfile:$rootScope.githubProfile,atTheTimeOfIntegration:true});
}
})
      }
    });

    $rootScope.refreshProjects = false;
    $rootScope.defaultDate = $filter('date')(Date.now(), "yyyy-MM-dd");
  };
  $scope.setUserDetails = function() {
    $scope.firstName = $rootScope.user.firstName;
    $scope.lastName = $rootScope.user.lastName;
    $rootScope.email = $rootScope.user.email;
  }
  $scope.updateProfile = function() {
    homeService.updateProfile($scope.firstName, $scope.lastName, $scope.email).success(function(response) {
      $rootScope.user.firstName = $scope.firstName;
      $rootScope.user.lastName = $scope.lastName;
      $rootScope.user.email = $rootScope.email;
      $rootScope.user.fullName = $rootScope.user.firstName + " " + $rootScope.user.lastName;
    })
  }
  $rootScope.list = [{
    "group": "inProgress",
    "listName": "Picked",
    "stories": []
  }, {
    "group": "inProgress",
    "listName": "In progress",
    "stories": []
  }, {
    "group": "inProgress",
    "listName": "For Review",
    "stories": []
  }, {
    "group": "inProgress",
    "listName": "Approved",
    "stories": []
  }, {
    "group": "Releasable",
    "listName": "Releasable",
    "stories": []
  }];
  $scope.goToProject = function() {
    $state.go('project');
  }
  $state.go('project');
  //To check user logged in or not  business logic goes here....
  $scope.goToCards = function() {
    $state.go('cards');  //defined in cards.routes.js
  }
  $scope.goToCardsPage = function() {
    $state.go('cardsPage');  //defined in cards.routes.js
  }

}]);
