// var angularModule = angular.module('fragile');

fragileApp.config(function($stateProvider,$urlRouterProvider){
  $stateProvider
  .state('release',{
    templateUrl: 'components/release/release.view.html',
    url : '/release/:prId/:releaseID',
    controller: 'releaseController'
    });
});
