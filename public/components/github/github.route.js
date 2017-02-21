fragileApp.config(function($stateProvider,$urlRouterProvider){

  $stateProvider
  .state('issues',{
    templateUrl: 'components/github/github.issues.view.html',
    controller: 'githubController',
    url: '/github/issues',
    params:{repo:null}
  });

});
