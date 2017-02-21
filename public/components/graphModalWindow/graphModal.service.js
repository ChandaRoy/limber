angular.module('fragileApp').factory('graphModalFactory', function($uibModal) {
  return {
    open: function(size,componentTemplate,title) {
      return $uibModal.open({
        animation: true,
        templateUrl: './components/graphModalWindow/graphModal.view.html',
        controller: 'graphModalController',
        size: size,
        resolve: {
          componentTemplate: function() {
            return componentTemplate;
          },
          title: function() {
            return title;
          }
        }
      });
    }
  };
});
