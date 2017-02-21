angular.module('LimberAuth')
    .controller('authController',function($scope,$http,$rootScope,$window,$location,$timeout,$q){
      $scope.logInErrorMsg = '';
      $scope.passwordError='';
      $scope.passwordErrorMsg='';
      $rootScope.newUser={
      email:'',
      code:'',
      codeCheck:'',
      password:'',
      confirmpassword:'',
      verifyCheck:false,
      sendStatus:false
       };//this object is used for forgot password only
         $scope.dismissMsg = function() {
           $scope.registerErrorMsg = '';
           $scope.logInErrorMsg = '';
           $scope.passwordError='';
         }
         $scope.$watch('logInErrorMsg', function(nv,ov) {
     if (nv) {
       $('#errorDiv').slideDown();
     }else {
       $('#errorDiv').slideUp();
     }
   });
   $scope.$watch('registerErrorMsg', function(nv,ov) {
if (nv) {
 $('#regDiv').slideDown();
}else {
 $('#regDiv').slideUp();
}
});
   $scope.$watch('passwordError', function(nv,ov) {
   if (nv) {
    $('#passDiv').slideDown();
  //angular.element(element.getElementsById("#passDiv")).slideDown();
    }else {
    $('#passDiv').slideUp();
  //angular.element(element.getElementsById("#passDiv")).slideUp();
    }
    });
    $scope.user = {
      email:'',
      password:''
    };
    $scope.user1 = {
      email:'',
      password:'',
      confirmpassword:'',
      code:'',
      enteredcode:'',
      verifyStatus:false,
      sendStatus:false
    };
    $scope.passportLogin = function(){
      $http.post('/auth/login',$scope.user).success(function(data){
        if(data.error) {
          $scope.logInErrorMsg = data.error;
          //$window.location.href = '/index.html';
        } else{
			console.log("home")
         $window.location.href = '/home.html';
         }
      });;
    }
    //Service call for resource bundling
    //$scope.nitTest=resourceService.testFun();

    //verifyCode starts : this function is to send a verification code to new user
    $rootScope.newUserEmail='';
    $scope.verifyCode=function(){
      $http.post('/auth/verifycode',$scope.user1).success(function(data){
          if(data.error)
          { $scope.registerErrorMsg=data.error;
             $timeout(function() {$scope.registerErrorMsg=''}, 4000); //this msg will be displayed for 4 sec

          }else if(data.code){
                $scope.user1.code=data.code;
                $rootScope.newUserEmail=$scope.user1.email;
                $scope.user1.sendStatus=true;
          }


        });
    }

    $scope.checkVerifyCode=function(){
      if($scope.user1.code==$scope.user1.enteredcode){
        $scope.user1.verifyStatus=true;
      }else {
         $scope.registerErrorMsg="Entered code is invalid!";
             $timeout(function() {$scope.registerErrorMsg=''}, 2000);

      }
    }
    //verifyCode ends
    $scope.forgotPassword=function()
    {
      var code=Math.floor(Math.random()*90000) + 10000;
      $rootScope.newUser.code=code;


      $http.post('/auth/forgotpass',$rootScope.newUser).success(function(data)
      {
          if(data.error){
              $scope.passwordErrorMsg=data.error;
            $timeout(function() {$scope.passwordErrorMsg='';}, 2000);

          }
          else{
            $rootScope.newUser.sendStatus=true;
            $timeout(function() {$scope.passwordErrorMsg='';}, 2000);

          }

          //$timeout(function() {}, 2000);


      });
     // $window.location.href="/forgot.html";
    }//forgot password ends
    $scope.passwordUpdateMsg='';
    $scope.verifyErrorMsg='';
    $scope.resetPassword=function(){
      if($rootScope.newUser.verifyCheck==false){
          if($rootScope.newUser.code==$rootScope.newUser.codeCheck){
            $scope.verifyErrorMsg="Verified!"
            $timeout(function() {$scope.verifyErrorMsg=''; $rootScope.newUser.verifyCheck=true}, 2000);

          }else{
               $scope.verifyErrorMsg="Incorrect code. Try again..."
              $timeout(function() {$scope.verifyErrorMsg=''}, 2000);

          }
        }else if ($rootScope.newUser.verifyCheck==true){
            if($rootScope.newUser.password===$rootScope.newUser.confirmpassword){
                $http.post('/auth/resetPassword',$rootScope.newUser).success(function(data){
                if(data.error){
                   $scope.passwordUpdateMsg="Something went wrong. Try again";
                    $timeout(function() {$scope.passwordUpdateMsg='';}, 2000);

                } else{
                     $scope.passwordUpdateMsg="Password changed! Login again."
                      $timeout(function() {$scope.passwordUpdateMsg=''; $window.location.href = '/index.html';}, 2000);

                     }
                })


            }else{
               $scope.passwordUpdateMsg="Passwords doesn't match"
              $timeout(function() {$scope.passwordUpdateMsg='';}, 2000);

            }
        }
    }
    $scope.register = function(){
      if($scope.user1.password!=$scope.user1.confirmpassword){
         $scope.passwordError="Password does not match the confirm password";
      } else if($rootScope.newUserEmail!=$scope.user1.email){
          $scope.passwordError="Verification is done for "+$rootScope.newUserEmail+" Please use the same.";
      }
      else{
      $http.post('/auth/register', $scope.user1).success(function(data){
        if(data.error) {
          $scope.registerErrorMsg = data.error;
        // $window.location.href = '/index.html';
        } else
        {
         $window.location.href = '/home.html';
         }

      });
    }
  };//end of register

});//end of controller
