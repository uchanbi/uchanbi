'use strict';

angular.module('app.admin')
.controller('AddAdminToSchoolModalCtrl', function ($scope, UserService, SchoolService, $stateParams, $modalInstance, ModalErrorHandler) {

  $scope.alerts = [];

  $scope.data = {};

  UserService.getUsers('admin')
  .then(function(data){
    $scope.admins = _.map(data, function(user){
      user.role = user.roles[0];
      return user;
    });
  });

  
  $scope.add = function () {
    if(!$scope.data.selectedAdmin) return $scope.alerts = [{ type: 'danger', msg: 'Please select an admin' }];

    SchoolService.addUser($stateParams.SchoolId, $scope.data.selectedAdmin)
    .then(function(data){
      $modalInstance.close(data);
    }, function(err){
      ModalErrorHandler.handleError(err, $scope, $modalInstance);
    });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss();
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

});
