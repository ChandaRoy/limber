fragileApp.controller('sprintChartController', ['$scope','$stateParams','$uibModal','sprFactory','$http','$timeout','sprService','graphModalFactory',//'$uibModalInstance',
function($scope,$stateParams, $uibModal,sprFactory,$http,$timeout,sprService,graphModalFactory) {

  $scope.sprintChartData = function(sprintID) {
    sprService.getSprintGraph(sprintID).success(function(graphDetails) {

      // console.log("sprintID = "+sprintID + "-----"+graphDetails);
      if(graphDetails === null){
        return;
      }

      var jdata=[];
        for(var i = 0 ,len = graphDetails.list.length; i < len ; i++) {
          var obj = {};
          obj['key'] = graphDetails.list[i].listName;
          obj['y'] = graphDetails.list[i].stories.length;
          jdata.push(obj);
        }
        // console.log(JSON.stringify(jdata));
      $scope.data = jdata;
    });
  }

//TODO - Add sprint iD here
$scope.sprintChartData($stateParams.sprintID);

$scope.options = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
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
                text: 'This graph shows the lists of this sprint.Hover over it to find the count of stories in each list.',
                css: {
                    'text-align': 'center',
                    'margin': '10px 13px 0px 7px'
                }
            },
        };
}]);
