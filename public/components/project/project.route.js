fragileApp.config(function($stateProvider,$urlRouterProvider){

  $stateProvider
  .state('project',{
    templateUrl: 'components/project/project.view.html',
    controller: 'projectController',
    url: '/project/:userID'
  });

});
