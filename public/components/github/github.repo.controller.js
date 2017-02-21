fragileApp.controller('githubRepoController',['$rootScope','$scope','$stateParams','$uibModalInstance','githubService','param','Socket',function($rootScope,$scope,$stateParams,$uibModalInstance,githubService,param,Socket){
  //var account=githubService.getGithubAccount();
  var socket = Socket($scope);
  $scope.selectedRepo={};
  $scope.githubRepos= param.response



  $scope.linkRepo=function(){
    var repo=JSON.parse($scope.selectedRepo);
    var repoDetails={
      projectId: param.projectId,
      name: repo.name,
      owner: repo.owner.login,
      githubProfile: $rootScope.githubProfile,
      userId:$rootScope.userProfile._id
    }
console.log("inside linke repo........");
    socket.emit("github:addRepo",repoDetails)
    $uibModalInstance.close();
  }
  $scope.ok = function() {
    $uibModalInstance.dismiss('cancel');
  };
  $scope.close = function() {
    $uibModalInstance.dismiss('cancel');
  };
  }])
