fragileApp.controller('releaseGraphController', ['$scope','$rootScope','$uibModal','$http','$timeout','rgService','graphModalFactory','$stateParams',//'$uibModalInstance',
function($scope,$rootScope,$uibModal,$http,$timeout,rgService,graphModalFactory,$stateParams) {

  $scope.releaseChartData = function(projectID,releaseID) {
    rgService.getReleaseGraph(projectID).success(function(graphDetails) {

      if(graphDetails === null){
        console.log("no data recieved");
        return;
      }
      // console.log("----------"+JSON.stringify(graphDetails));

      // var jdata = [];
      var jdataInProgress = [];
      var jdataCompleted = [];
      var allData = [];

      for(var i = 0 ,len = graphDetails.release.length; i < len ; i++) {
        //// Computation Code ----------->
        if(graphDetails.release[i]._id === releaseID){
          for(var j=0,sprLen = graphDetails.release[i].sprints.length; j < sprLen ; j++){
            var inProgressCount =0 ,completedCount = 0;
            // var dataJson = {};
            var inProg ={};
            var compl={};
            for(var k=0,lstLen = graphDetails.release[i].sprints[j].list.length; k < lstLen ; k++){
              var temp = graphDetails.release[i].sprints[j].list[k];
              if(temp.group == 'Releasable'){
                completedCount += temp.stories.length;
              }
              else if(temp.group == 'inProgress'){
                inProgressCount += temp.stories.length;
              }
            }
            // dataJson['name'] = graphDetails.data.release[i].sprints[j].name == null ? 'na' : graphDetails.data.release[i].sprints[j].name;
            // dataJson['in Progress'] = inProgressCount;
            // dataJson['completed'] = completedCount;
            // jdata.push(dataJson);

            inProg['label'] = graphDetails.release[i].sprints[j].name == null ? 'na' : graphDetails.release[i].sprints[j].name;
            inProg['value'] = inProgressCount;

            compl['label'] = graphDetails.release[i].sprints[j].name == null ? 'na' : graphDetails.release[i].sprints[j].name;
            compl['value'] = completedCount;
            jdataInProgress.push(inProg);
            jdataCompleted.push(compl);
          }
        }
      }
      var InProgressData = {};
      InProgressData['key'] = "In Progress";
      InProgressData['color'] = "#36D7B7";
      InProgressData['values'] = jdataInProgress;
      allData.push(InProgressData);
      var completedData = {};
      completedData['key'] = "Completed";
      completedData['color'] = "#26A65B";
      completedData['values'] = jdataCompleted;
      allData.push(completedData);

      $scope.data =allData;
      // console.log("----------releaseChartData----------"+JSON.stringify($scope.data));
    });
  };

  // TODO - Add the project id here
  $scope.releaseChartData($rootScope.projectID,$stateParams.releaseID);

  //Options for Progress Chart

  //Vertical Bar chart

  $scope.options = {
   chart: {
     type: 'multiBarChart',
     height: 450,
     x: function(d){return d.label;},
     y: function(d){return d.value;},
     showControls: false,
     grouped:false,
     stacked:false,
     showValues: true,
     duration: 500,
     xAxis: {
       showMaxMin: true
     },
     yAxis: {
       axisLabel: 'Stories',
       tickFormat: function(d){
         return d3.format(',')(d);
       }
     },
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
       text: 'This graph gives the status of your sprints in this release.It shows how many stories are in progress and releasable ',
       css: {
           'text-align': 'center',
           'margin': '10px 13px 0px 7px'
       }
   },
 };
  // Vertical bar chart end


}]);
