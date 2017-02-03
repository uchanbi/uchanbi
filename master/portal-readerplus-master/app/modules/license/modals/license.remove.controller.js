'use strict';

angular.module('app.license')
.controller('RemoveLicenseModalCtrl', function ($scope, LicenseService, $modalInstance, ModalErrorHandler) {
  
  $scope.removeLicense = function () {
    LicenseService.removeLicense($scope.removeLicenseId)
    .then(function(data){
      $modalInstance.close(data);
    }, function(err){
      if(err.statusCode === 404) err.message = 'License not found';
      ModalErrorHandler.handleError(err, $scope, $modalInstance);
    });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss();
  };

});
