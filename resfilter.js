Limber.filter('xlat', ['$rootScope', function($rootScope) {
  // The code here executes only once, during initialization.
  // We'll return the actual filter function that's executed
  // many times.
  var tables = {
    'en': { 'FIRST_NAME': 'First name:' },
    'nl': { 'FIRST_NAME': 'Voornaam:' }
  };
  $rootScope.currentLanguage = 'en';
  return function(label) {
    // tables is a nested map; by first selecting the
    // current language (kept in the $rootScope as a
    // global variable), and selecting the label,
    // we get the correct value.
    return tables[$rootScope.currentLanguage][label];
  };
}]);