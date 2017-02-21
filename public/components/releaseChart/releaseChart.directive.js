angular.module('fragileApp').directive('releaseChart',function() {
  return {
    templateUrl: './components/releaseChart/releaseChart.html',
    link: function(scope,element,attr) {
      scope.projRelData = JSON.parse(attr.data);
    },
    restrict: 'C'
  }
});
