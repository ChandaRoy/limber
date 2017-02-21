fragileApp.controller('githubIssueController',['$rootScope','$scope','$stateParams','$uibModalInstance','githubService','param','Socket',function($rootScope,$scope,$stateParams,$uibModalInstance,githubService,param,Socket){
  //var account=githubService.getGithubAccount();
  var socket = Socket($scope);
  $scope.githubissues= param.response.allIssues;
  $scope.selectedIssues=[];
  $scope.syncedissues=param.response.syncedIssueNumbers;
$scope.githubRepo=param.response.githubRepo;
  $scope.toggleSelection=function(issue){
    var flag=false;
    //$scope.selectedIssues=[];
    $scope.selectedIssues.forEach(function(obj){
      if(obj.id===issue.id){
        flag=true;
        var idx=$scope.selectedIssues.indexOf(obj);
        $scope.selectedIssues.splice(idx,1);

      }
    })
    if(!flag){
      $scope.selectedIssues.push(issue);
    }


  }
  $scope.createStory=function(){
    socket.emit("github:convertToStory",{'issues':$scope.selectedIssues,'projectId':param.projectId,'userProfile':$rootScope.userProfile});
    $uibModalInstance.close();

  }
  $scope.filterExistingIssue=function(currentIssue){
    return $scope.syncedissues.indexOf(currentIssue.number.toString())!==-1
  }
  $scope.ok = function() {
    $uibModalInstance.dismiss('cancel');
  };
  $scope.close = function() {
    $uibModalInstance.dismiss('cancel');
  };
  }])
