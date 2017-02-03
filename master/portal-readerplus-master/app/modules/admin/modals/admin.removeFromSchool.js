'use strict';

angular.module('app.admin')
.controller('RemoveAdminFromSchoolModalCtrl', function ($scope, UserService, $modalInstance, SchoolService, $stateParams, ModalErrorHandler) {

  $scope.remove = function () {
    SchoolService.removeUser($stateParams.SchoolId, $scope.user)
    .then(function(data){
      $modalInstance.close(data);
    }, function(err){
      ModalErrorHandler.handleError(err, $scope, $modalInstance);
    });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss();
  };

});
