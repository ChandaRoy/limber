fragileApp.config(function($stateProvider,$urlRouterProvider){

  $stateProvider
  .state('sprint',{
    templateUrl: 'components/sprint/sprint.view.html',
    url : '/sprint/:prId/:releaseID/:sprintID',
    controller: 'sprintController'
  });

});
