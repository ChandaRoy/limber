fragileApp.controller('releaseChartController', ['$scope','$uibModal','$http','$timeout','releaseGraphService','graphModalFactory','$log',//'$uibModalInstance',
function($scope, $uibModal,$http,$timeout,releaseGraphService,graphModalFactory,$log) {//$uibModalInstance

  //TODO :Need to verified
  $scope.showProjectsAndReleasesGraph = function(){
    $scope.getProjectAndReleaseData();
  };
  // $scope.showInitialReleaseChart = function(){
  //   $scope.releaseChartData($scope.firstId);
  // }

  $scope.loadData = function(aModalInstance) {
    $log.info("starts loading");
  };
  var ModalInstanceCtrl = function($scope, $modalInstance, mydata) {
    $scope.mydata = mydata;

    $modalInstance.setMyData = function(theData) {
      $scope.mydata = theData;
    };

    $scope.ok = function() {
      $modalInstance.close('close');
    };
    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  };
  //// modal window dismiss

  // Release Chart Data and Sunburst Data
  $scope.getProjectAndReleaseData = function(){
    releaseGraphService.getUserProjectsAndReleases().success(function(projDetails){
      var len=projDetails.projects.length;

      $scope.sunBurstOptions = {
        chart: {
          type: 'sunburstChart',
          height: 450,
          color: d3.scale.category20c(),
          duration: 250
        },
        title: {
          enable: true,
          text: "",
          className: "h4",
          css: {
            "width": "nullpx",
            "textAlign": "center"
          }
        },
        subtitle: {
          enable: true,
          color : "black",
          text: 'This graph displays project and releases. Hover on the graphs to see which project you are working on and its associated release.',
          css: {
            'margin': '10px 13px 0px 7px'
          }
        }
      };

      //Error Handeling
      if(projDetails === null || len <= 0){
        $scope.sunBurstdata = [];
        $scope.dataNo = true;
        return;
      }

      var jdata = [];
      var s_data = [];
      var s_dataBegin = {};
      s_dataBegin['name'] = "Projects";
      s_dataBegin['text'] = "Home"
      s_dataBegin['children'] = [];

      for(var i=0;i<len;i++){
        var dataJson = {};
        var temp = projDetails.projects[i];

        var s_Json = {};
        // s_Json['name'] = "Project";
        s_Json['name'] = temp.name;
        s_Json['children'] = [];//Add Releases here

        dataJson['projName'] = temp.name;
        dataJson['projId'] = temp._id;
        dataJson['release'] = [];

        for(var j=0,relLen = temp.release.length;j<relLen;j++){
          var obj = {};
          obj['relName'] = temp.release[j].name;
          obj['relId'] = temp.release[j]._id;

          var s_obj = {};
          // s_obj['name'] = "Release";
          s_obj['name'] = temp.release[j].name;
          s_obj['size'] = relLen;

          dataJson['release'].push(obj);
          s_Json['children'].push(s_obj);
        }
        jdata.push(dataJson);
        s_dataBegin['children'].push(s_Json);
      }
      s_data.push(s_dataBegin);// Sunburst data

      $scope.projRelData = jdata;
      // Save the Sunburst Data.
      $scope.sunBurstdata = s_data;

      $scope.firstId = projDetails.projects[0]._id;
      // Default display the first project Release Deatails
      $scope.releaseChartData($scope.firstId);
    });
  };

  $scope.releaseChartData = function(projectID) {
    // console.log(projectID);
    releaseGraphService.getReleaseGraph(projectID).success(function(graphDetails) {

      $scope.noReleaseData = false;
      var len = graphDetails.release.length;
      if(graphDetails === null || len <= 0){
        $scope.noReleaseData = true;
        return;
      }
      // console.log(""+JSON.stringify(graphDetails) );
      var jdata = [];
      for(var i = 0 ; i < len ; i++) {
        var dataJson = {};
        //// Computation Code ----------->
        var testTime = new Date(graphDetails.release[i].releaseDate)
        var time = new Date(Date.now());
        var status, progress, inProgressCount =0 ,completedCount = 0,percentage = 0;
        status = (time > testTime ) ? "Released" : 'UnReleased';
        for(var j=0,sprLen = graphDetails.release[i].sprints.length; j < sprLen ; j++){
          for(var k=0,lstLen = graphDetails.release[i].sprints[j].list.length; k < lstLen ; k++){
            var temp = graphDetails.release[i].sprints[j].list[k];
            if(temp.group === 'Releasable'){
              completedCount += temp.stories.length;
            }
            else if(temp.group === 'inProgress'){
              inProgressCount += temp.stories.length;
            }
          }
        }
        percentage = completedCount/(inProgressCount+completedCount)*100;
        if(isNaN(percentage)){
          percentage = 0;
        }
        //// Computation Code End----------->

        // dataJson['id'] = (graphDetails.data.release[i]._id) == null ? "nil" : (graphDetails.data.release[i]._id);
        dataJson['Release name'] = graphDetails.release[i].name == null ? "nil" :  graphDetails.release[i].name;
        dataJson['Status'] = status == null ? "nil" : status;
        dataJson['Progress'] = (Math.round(percentage)+'%') == null ? "nil" : (Math.round(percentage)+'%');
        dataJson['Start Date'] = graphDetails.release[i].creationDate == null ? "nil" : new Date(graphDetails.release[i].creationDate).toUTCString().slice(0, 17);
        dataJson['Release Date'] = graphDetails.release[i].releaseDate == null ? "nil" : new Date (graphDetails.release[i].releaseDate).toUTCString().slice(0, 17);
        jdata.push(dataJson);
      }
      $scope.rows = jdata;
      $scope.cols = Object.keys($scope.rows[0]);
    });
  };

  $scope.closeGraph = function() {
  }

}]);//End
