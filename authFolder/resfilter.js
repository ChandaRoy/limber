var app=angular.module('LimberAuth');
app.factory('ResourceBundle', function($q, $rootScope, $http) {
  $rootScope.resourceBundle ={};

  var retrieveResourceBundle = function() {
    var defer = $q.defer();

    if(!$rootScope.resourceBundle) {
      console.log("Point 1 ",$rootScope.resourceBundle);
      defer.resolve();
    } else {
      var retrieveResourceBundleHttpPromise = $http.get('/resource_bundle.en.json');
      retrieveResourceBundleHttpPromise.success(function(data) {
          $rootScope.resourceBundle = data;
      console.log("Point 2 ",$rootScope.resourceBundle);

          defer.resolve();
        
      });
      retrieveResourceBundleHttpPromise.error(function(data) {
          console.log("Thye data reject----.",data);

        defer.reject(data);
      });
    }
   // $rootScope.resourceBundle=defer.promise.value;
    console.log('Retrieving Resource Bundle!! point 3 ',$rootScope.resourceBundle);
    return defer.promise;
  }

  return {
    retrieveResourceBundle: retrieveResourceBundle
  }
});


app.filter('l10n', function($rootScope, $http) {
  $rootScope.currentLanguage = 'en';

  return function(label,page) {
    // console.log('resourceBundle is: ', $rootScope.resourceBundle);
    // console.log('$rootScope.resourceBundle[label]: '+label+'and vlaue is '  + $rootScope.resourceBundle[label]);
    return $rootScope.resourceBundle[page][label];
  }
});
