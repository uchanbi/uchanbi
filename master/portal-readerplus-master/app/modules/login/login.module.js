'use strict';

angular.module('app.login', [])
.controller('LoginCtrl', function ($scope, $rootScope, LoginService, $location) {

  $scope.alerts = [];
  if($rootScope.globals.errors.sessionExpired) {
    $scope.alerts.push({ type: 'danger', msg: 'Your session has expired, please login again.' });
  }

  $scope.login = function() {
    //  Clear any existing alters
    $scope.$broadcast('show-errors-check-validity');
    $scope.alerts = [];

    if ($scope.login_form.$valid) {
       LoginService.login($scope.username, $scope.password)
          .then(function(data){
            LoginService.getCurrentUser(data.token)
            .then(function(data){
              if (data && data.roles[0] === 'admin') {
                return LoginService.getCurrentSchool()
                .then(function(data){
                  $location.path('/school-admin');
                },
                function(err){
                  $scope.alerts.push({ type: 'danger', msg: 'Error: ' + err.message });
                });
              }

              if(data && data.roles[0] === 'pearson-admin') {
                return $location.path('/pearson-admin');
              }

              $scope.alerts.push({ type: 'danger', msg: 'Error: Only admin users allowed to use the portal' });
            },
            function(err){
              $scope.alerts.push({ type: 'danger', msg: 'Error: ' + err.message });
            });
          },
          function(err){
            $scope.alerts.push({ type: 'danger', msg: 'Error: ' + err.message });
          });
    } else {
      $scope.alerts.push({ type: 'danger', msg: 'Error: Please enter required fields' });
    }

  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

});