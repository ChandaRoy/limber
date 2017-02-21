fragileApp.controller('cardsController', ['$scope', '$state','sprintService', '$rootScope', '$stateParams', '$uibModal','uibDateParser', 'cardsService', 'Socket', '$filter', 'graphModalFactory','homeService','$timeout',function($scope, $state,sprintService, $rootScope, $stateParams, $uibModal,uibDateParser, cardsService, Socket, $filter, graphModalFactory,homeService,$timeout) {

$scope.date = new Date();





 $scope.setDate=function(){

  $scope.startDate= moment($scope.date).day(1).format('YYYY-MM-DD');
  //  console.log("startDate",$scope.startDate);
  $scope.startDateConverted = new Date($scope.startDate);
  console.log("startDateConverted",$scope.startDateConverted);
  $scope.displayStartDate = $scope.startDateConverted.toDateString(); // " format:Wed Aug 26 2015"
  //  console.log("displayStartDate ",$scope.displayStartDate );

   $scope.endDate= moment($scope.date).day(7).format('YYYY-MM-DD');
  //  console.log("endDate",$scope.endDate);
  $scope.endDateConverted = new Date($scope.endDate);
  $scope.displayEndDate = $scope.endDateConverted.toDateString();
  // console.log("displayEndDate ",$scope.displayEndDate );


}
$scope.setDate()

 var socket = Socket($scope);
 $rootScope.inprojectRoom=false;




 $scope.loadCards=function(){

   sprintService.currentRoom={};

   var emitData={
     'room' :$scope.currentUserID
   };
   socket.emit('join:room', emitData);

   //$scope.cards={};
   $scope.stories=[];
   cardsService.getUserCards().success(function(response) {
     $scope.cards = response[0].assignedStories;


     $scope.cards.forEach(function(item){
       $rootScope.projects.forEach(function(projObj){
         if(item.projectId===projObj._id)
         {
           item.projectName=projObj.name
           projObj.release.forEach(function(relObj){
             if(item.releaseId===relObj._id){item.releaseName=relObj.name}
           })
         }
       })
     })
   })




   socket.on('story:memberAssigned',function(data){
     //$scope.stories=[];
     $scope.cards.push(data);
     $scope.loadCards();
     //console.log(data.length);

   })

   socket.on('story:memberRemoved',function(data)
   {
     $scope.cards = $filter('filter')($scope.cards, {_id: !data._id})

   });

   $scope.storyFilter = $filter('applyFilter')
   console.log("$scope.storyFilter",$scope.storyFilter);


   $scope.gotoProject=function(){
     $state.go('project');
   }
   $scope.goToSprint=function(params,story){
     $state.go('sprint',params).then(function(){
       //$rootScope.showModal(story._id, listItem.group,listItem._id,listItem.listName);\
       angular.element("#"+story._id).triggerHandler("ng-click");
     })
   }
   $scope.processDate = function(dt)
  {
    return $filter('date')(dt, 'dd-MM-yyyy');
  }
 }


}
])






.filter('applyFilter', function() {

return function(items,date) {
if(items,date){
  var filtered = [];
function myFunc(d,weekNum) {
    // console.log("d",d);d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    var week = new Date(d.getFullYear(), 0, 4);
    var weekNum = 1 + Math.round(((d.getTime() - week.getTime()) / 86400000
                          - 3 + (week.getDay() + 6) % 7) / 7);
    return weekNum;
      }
var dateDefault = new Date();
var defaultDate = myFunc(dateDefault);
var weekNumberInput = myFunc(date);
console.log("weekNumberInput",weekNumberInput);

return items.filter(function (item) {

var itemStartDate=item.sprintId.startDate;
var itemStartDateConverted = moment.utc(itemStartDate);
var itemStartDateConvertedExtracted = itemStartDateConverted._d;
var itemStartDateWeekNum = myFunc(itemStartDateConvertedExtracted);
console.log("itemStartDateWeekNum",itemStartDateWeekNum);

var itemEndDate=item.sprintId.endDate;
var itemEndDateConverted = moment.utc(itemEndDate);
var itemEndDateConvertedExtracted = itemEndDateConverted._d;
var itemEndDateWeekNum = myFunc(itemEndDateConvertedExtracted);
console.log("itemEndDateWeekNum",itemEndDateWeekNum);


if(itemStartDateWeekNum == weekNumberInput || itemEndDateWeekNum == weekNumberInput)
  {

           filtered.push(item)
           console.log("filtered",filtered);
         return filtered;

  }
          return false;


  });

}


}

});
