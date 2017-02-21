var angularModule = angular.module('LimberAuth',['ngRoute','ngCookies']);

angularModule.config(function($routeProvider){
       $routeProvider
        .when('/',{
          'templateUrl' : 'login.html',
          'controller':'authController',
          resolve:{

             resourceBundle: function(ResourceBundle,$rootScope) {
       		 var data=ResourceBundle.retrieveResourceBundle();
       		 data.then(function() {
       		 	//console.log("The data is resolve-----: ",data);
       		 	return data;
       		 });
       		  //$rootScope.resourceBundle=data.$$stat;


            }

          }
        }).when('/forgot', {
          'templateUrl': 'forgot.html',
          'controller':'authController',
           resolve:{

             resourceBundle: function(ResourceBundle,$rootScope) {
       		 var data=ResourceBundle.retrieveResourceBundle();
       		 data.then(function() {
       		 	//console.log("The data is resolve-----: ",data);
       		 	return data;
       		 });
       		  //$rootScope.resourceBundle=data.$$stat;


            }

          }
          })
        });
