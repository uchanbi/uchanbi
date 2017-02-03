'use strict';

angular.module('app.courseSection')
.controller('RemoveTitleFromCourseSectionModalCtrl', function ($scope, ProductService, $modalInstance, ModalErrorHandler) {

  $scope.remove = function () {
    ProductService.removeProductProvisionFromCourseSection($scope.courseSection.id, $scope.removeLicenseId)
    .then(function(data){
      $modalInstance.close(data);
    }, function(err){
      if(err.statusCode === 404) err.message = 'Course section not found';
      ModalErrorHandler.handleError(err, $scope, $modalInstance);
    });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss();
  };

});
