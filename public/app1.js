
var fragileApp = angular.module('fragileApp',['angular.filter','ui.router','ngLetterAvatar','ui.bootstrap','ngAnimate','ngDragDrop','autocomplete', 'angular-loading-bar','ngFileUpload','nvd3','jkuri.datepicker','ngMaterial', 'ngMessages', 'material.svgAssetsCache','Showdown','ngSanitize','bc.AngularUrlEncode','mgcrea.ngStrap','angular-smilies']);

fragileApp.filter('dateSuffix', function($filter) {
 var suffixes = ["th", "st", "nd", "rd"];
  return function(input) {
    if (!input || !input.length) { return; }

    var dtfilter = $filter('date')(input, 'MMMM d');
    var day = parseInt(dtfilter.slice(-2));
    var relevantDigits = (day < 30) ? day % 20 : day % 30;
    var suffix = (relevantDigits <= 3) ? suffixes[relevantDigits] : suffixes[0];
    return dtfilter+suffix + ", " + $filter('date')(input, 'yyyy')
  };
});

fragileApp.config(function($popoverProvider) {
angular.extend($popoverProvider.defaults, {
  html: true
});
})

fragileApp.config(function($datepickerProvider) {
  angular.extend($datepickerProvider.defaults, {
    dateFormat: 'dd/MM/yyyy',
    startWeek: 1
  });
})
