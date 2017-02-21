fragileApp.controller('projectController', ['$scope', '$state', '$rootScope', '$stateParams', '$uibModal','$http','$window','cardsService','projectService', 'Socket', '$filter', 'graphModalFactory','homeService','githubService',
function($scope, $state, $rootScope, $stateParams, $uibModal,$http,$window,cardsService,projectService, Socket, $filter, graphModalFactory,homeService,githubService) {
  // $scope.loadProjects = function() {
  //
  //   projectService.getUserProjects().success(function(response) {
  //     $rootScope.projects = response.projects
  //   });
  //
  //   $rootScope.defaultDate =  $filter('date')(Date.now(), "yyyy-MM-dd");
  // }
  var socket = Socket($scope);
  //Temporary fix, make a better logic
  if ($scope.refreshProjects) {
    homeService.getUserProjects().success(function(response) {
      $rootScope.projects = response.projects
      // if($rootScope.githubProfile.length!==0){
      //   $rootScope.projects.forEach(function (project){
      //     socket.emit("github:pushStories",{projectId:project._id,userId:$rootScope.userProfile._id,githubProfile:$rootScope.githubProfile});
      // console.log("Emitting pushStories event");
      // })
      // }
    });
  }
  $scope.syncing=false;

  var syncArray=[];
  socket.on("startSync",function(projectId)
  {
    syncArray.push(projectId);
  });
  $scope.syncValue=function(projectId)
  {
    if(syncArray.indexOf(projectId)!=-1)
    return true;
    else
    return false;
  }
  socket.on("stopSync",function(projectId)
  {
    if(syncArray.indexOf(projectId)!=-1)
    syncArray.splice(syncArray.indexOf(projectId),1);
    socket.emit("SyncIsStopped",true);
  })
  projectService.getCurrentUser().success(function(response) {
    socket.emit('join:room', {
      'room': "user:" + response._id
    });
  })
  socket.on("syncing event",function(msg){
    $scope.msg=msg;
  })

  socket.on('releaseDeleted', function(releaseData) {
    $rootScope.projects.forEach(function(project) {
      if (project._id == releaseData.projectId) {
        project.release.forEach(function(release, index) {
          if (release._id == releaseData.releaseId) {
            var releaseName = release.name; //For activity
            project.release.splice(index, 1);
          }
        })
      }
    })
  })

  $rootScope.inprojectRoom=true;
  // Opening Modal window for Release Chart
  $scope.openReleaseChart = function() {
    graphModalFactory.open('lg', './components/releaseChart/releaseChart.html', "Release Chart");
  };

  // Opening Modal window for Overview Chart
  $scope.showOverGraph = function() {
    graphModalFactory.open('lg', './components/releaseChart/overViewChart.html', "Overview Graph");
  };

  $scope.longDescLimit = 38;
  $scope.longPrjDescLimit = 120;
  $scope.setDefaultForRelease = function(projectId) {

    $scope.addWhat = "Release";
    $scope.projectId = projectId;
    projectService.setData($scope.addWhat, projectId);
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: '/components/project/project.modal.html',
      controller: 'modalController',
      controllerAs: 'modalContr'
    });
  }
  $scope.setDefaultForProject = function(projectId) {
    $scope.dismissThis = "none";
    $scope.addWhat = "Project";
    $scope.warningModalDesc = true;
    $scope.warningModalName = true;
    $scope.warningModalDate = true;
    projectService.setData($scope.addWhat);
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: '/components/project/project.modal.html',
      controller: 'modalController',
      controllerAs: 'modalContr'
    });
  }
  $scope.closeThis = function() {
    $uibModalInstance.dismiss('cancel');
  }
  $scope.linkDropbox=function (projectId){
    localStorage.projectToLinkWithDropbox=projectId;
    $window.location.href="/auth/dropbox";
  }
  $scope.editProject = function(newProjectName, newProjectDetails, prId) {
    if (newProjectName != "") {
      socket.emit('project:editProject', {
        'room': 'projectRoom',
        'name': newProjectName,
        'description': newProjectDetails,
        "prId": prId,
        'user':$rootScope.userProfile
      });
      return true;
    } else {
      return false;
    }
  };
  $scope.editRelease = function(newReleaseName, newReleaseDetails, newReleaseDate, creationDate, prId, relId, oldName) {
    if (newReleaseDate != null && creationDate != null && newReleaseName != "") {
      var dt = new Date(newReleaseDate);
      var crDt = new Date(creationDate);
      socket.emit('project:editRelease', {
        'room': 'projectRoom',
        'projectId': prId,
        'releaseId': relId,
        "name": newReleaseName,
        "description": newReleaseDetails,
        "creationDate": crDt,
        "releaseDate": dt,
        "oldReleaseName": oldName,
        'user':$rootScope.userProfile
      });
      return true;
    } else {
      return false;
    }
  }
  $scope.setReleaseToDelete = function(projectId, releaseId, projectName, releaseName) {
    $scope.toDeleteProjectId = projectId;
    $scope.toDeleteReleaseId = releaseId;
    $scope.toDeleteProjectName = projectName;
    $scope.toDeleteReleaseName = releaseName;
  }
  $scope.archiveFun = function() {
    // console.log("archiveFun" + rel)
    socket.emit('deleteRelease', {
      'room': 'projectRoom',
      'activityRoom': 'activity:' + $scope.toDeleteProjectId,
      'projectId': $scope.toDeleteProjectId,
      'releaseId': $scope.toDeleteReleaseId,
      'releaseName': $scope.toDeleteReleaseName,
      'projectName': $scope.toDeleteProjectName,
      'user':$rootScope.userProfile
    });
  };
  $scope.editFun = function(rel) {

  };
  $scope.starFun = function(rel) {
  };

  $scope.setProject = function(projectId, projectName, releaseId, releaseName, releaseDesc) {
    $rootScope.projectName = projectName,
    $rootScope.release = {};
    $rootScope.releaseName = releaseName;
    $rootScope.release.description = releaseDesc;
  }

  socket.on('project:releaseEdited', function(releaseData) {
    $rootScope.projects.forEach(function(item, itmIndex) {
      if (item._id == releaseData.prId) {
        item.release.forEach(function(rel, relIndex) {
          if (rel._id == releaseData._id) {
            $rootScope.projects[itmIndex].release[relIndex].name = releaseData.name;
            $rootScope.projects[itmIndex].release[relIndex].description = releaseData.description;
            $rootScope.projects[itmIndex].release[relIndex].releaseDate = releaseData.releaseDate;
          }
        });
      }
    });
    //console.log(releaseData);
  });

  socket.on('project:releaseAdded', function(releaseData) {
    // Returns entire project document
    $rootScope.projects.forEach(function(item, index) {
      if (item._id == releaseData._id) { //Comparing  Scope Projects ID with Updated Project ID
        $rootScope.projects[index] = releaseData;

      }
    });
  });

  socket.on('project:projectAdded', function(data) {
    $rootScope.projects.push(data);
  });

  socket.on('project:projectEdited', function(newProject) {
    $rootScope.projects.forEach(function(project, projectIndex) {
      if (project._id == newProject._id) {
        $rootScope.projects[projectIndex].name = newProject.name;
        $rootScope.projects[projectIndex].description = newProject.description;
      }
    });
  });

  socket.on('github:changeGithubStatus', function(githubRepo) {
    $rootScope.projects.forEach(function(project, projectIndex) {
      if (project._id == githubRepo.projectId) {
        $rootScope.projects[projectIndex].githubStatus = githubRepo.githubStatus;
        //$scope.msg.syncing=false;
        // socket.emit("github:pushStories",{projectId:project._id,userId:$rootScope.userProfile._id,githubProfile:$rootScope.githubProfile});
  //$scope.pushMember();
  }
    });


    });


$scope.syncAgain=function(projectId)
{
  socket.emit("github:syncAgain",projectId);
}

    socket.on('project:releaseEdited', function(releaseData) {
      $rootScope.projects.forEach(function(item, itmIndex) {
        if (item._id == releaseData.prId) {
          item.release.forEach(function(rel, relIndex) {
            if (rel._id == releaseData._id) {
              $rootScope.projects[itmIndex].release[relIndex].name = releaseData.name;
              $rootScope.projects[itmIndex].release[relIndex].description = releaseData.description;
              $rootScope.projects[itmIndex].release[relIndex].releaseDate = releaseData.releaseDate;
            }
          });
        }

      });
    });
    // FIXME: Code duplicated in Menu controller. Can be fixed
    var dbIds;
    $scope.getAllUsers = function(projectID, projectName,githubStatus) {
      $scope.selectedProject = projectID;
      $scope.selectedProjectName = projectName;
      $scope.selectedProjectGithubStatus=githubStatus;
      projectService.getMembers($scope.selectedProject).success(function(response) {
        response.memberList.forEach(function(data) {
          data.fullName = data.firstName + " " + data.lastName;
        })
        $scope.projMemberList = response.memberList;
      });

      $scope.dbUsers = [];
      dbIds = [];
      projectService.getAllUsers().success(function(response) {
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
          'room': 'activity:' + $scope.selectedProject,
          'projectId': $scope.selectedProject,
          'memberList': [addedUserId],
          'projectName': $scope.selectedProjectName,
          'user':$rootScope.userProfile,
          'githubStatus':$scope.selectedProjectGithubStatus
        });

      }
    }

    socket.on("notify:memberNotAdded",function(msg)
    {
      alert(msg.toUpperCase()+" has not shared his github details with Limber, So we can't add him to your git repository");
    })
    socket.on('project:memberAdded', function(data) {
      data.fullName = data.firstName + " " + data.lastName;
      $scope.projMemberList.push(data);
    });

    socket.on('project:addMemberFailed', function(data) {
      alert(data);
    });
    $scope.getRepo= function(prId){
      githubService.getAllRepos().success(function(response){

        modalInstance=$uibModal.open({
          animation: true,
          templateUrl: "/components/github/github.modal.view.html",
          controller: "githubRepoController",
          //controllerAs:"githubCntrl",
          size: 'lg',
          resolve: {
            param: function() {
              return {
                response : response,
                projectId : prId
              }

            }
          }
        });
        modalInstance.result.then(function (){
          $state.go('project');
        },function(){
        })

      })
    }

    $scope.getIssues=function(prId){
      githubService.getIssues(prId).success(function(response){

        modalInstance=$uibModal.open({
          animation: true,
          templateUrl: "/components/github/github.issues.view.html",
          controller: "githubIssueController",
          //controllerAs: "githubCntrl",
          size: 'lg',
          resolve: {
            param: function() {
              return {
                response : response,
                projectId : prId
              }

            }
          }
        });
        modalInstance.result.then(function (){
          console.log("in first closing");
          //$state.go('project');
        },function(){
        })

      })

    }


    // $scope.pushStories=function(projectId){
    //   console.log($rootScope.githubProfile);
    //   if($rootScope.githubProfile){
    //
    //   //  socket.emit("github:pushStories",{projectId:projectId,userId:$rootScope.userProfile._id,githubProfile:$rootScope.githubProfile});
    //   }
    // }





  }
]);
