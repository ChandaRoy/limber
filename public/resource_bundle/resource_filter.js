fragileApp.factory('Friend', function ($http) {
    return {
        get: function () {
            return $http.get('/resource_bundle/bundle.json');
        }
    };
});


fragileApp.filter('translate', ['$rootScope','Friend', function($rootScope,Friend) {
  $rootScope.currLang='en';
  var tables;
  Friend.get().then(function (msg) {
          tables= msg;
      });
  return function(label) {
    return tables[$rootScope.currLang][label];
  };

}])
