fragileApp.config(function($stateProvider,$urlRouterProvider){

  $stateProvider
  .state('cards',{
    templateUrl: 'components/cards/cards.view.html',
    controller: 'cardsController',
controllerAs:'ctrl',
    url: '/cards/'
  });


});
