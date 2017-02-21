// var resourceBundle;

// var app=angular.module('Limber',[]);
// app.service('resourceService',function($http,$q){
// 	var deferred=$q.defer();

// 	this.getData=function(){
// 		return  	$http.get('resource.json').then(function(response) {
// 	        resourceBundle=response.data;
// 	          console.log("the data inside server ",resourceBundle[0].APP_NAME);
// 	          deferred.resolve(response.data);
// 	          return deferred.promise;
// 	    }, function(response){
// 	    	deferred.reject(response);
// 	    	 return deferred.promise;
// 	    });
// 	}
// })
// //============
// angular.module('Limber').factory('resourceService',['$http','$filter','$q',function resourceService($http,$filter, $q){
// 	var resourceBundle={};
// 	var testFun=function(){
// 		return "Good morning!";
// 	}
  
//  //   var myData= function(){
   	
// 	//    	$http.get('resource.json').success(function(data) {
// 	//         //resourceBundle=data;
// 	//         resourceBundle=data;
// 	//           console.log("the data inside server ",resourceBundle[0].APP_NAME);
	          
// 	//     })
// 	//     console.log("See resourceBundle :",resourceBundle);
// 	//     return resourceBundle;
// 	// };
// 	resourceService.resolve = function() {
// 	var deferred = $q.defer();
// 	var resourceBundle={};
// 	var myData= function(){
   	
// 	   	$http.get('resource.json').then(function(reponse){
// 	    	//promise fullfilled 
// 	    		deferred.resolve(response.data);
// 	    		console.log(" success :",deferred.promise);
//        		 return deferred.promise;},
//        		 function	(response){
// 	    	//promise fails
// 	    	deferred.reject(response);
// 	    	console.log(" fails :",deferred.promise);

//              return deferred.promise;

// 	    });
// 	    console.log("final deferred :",deferred.promise);
// 	    return resourceBundle;
// 	};
// 	// Download Resource Bundle
// 	// on Successful Download, call defered.resolve();

// 		return deferred.promise;
// 		}
// 		var myFun=resourceService.resolve();

//    return {
//    	testFun:testFun,
//    	myFun:resourceBundle
//    }
// } ]);

