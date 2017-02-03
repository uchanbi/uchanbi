'use strict';

angular.module('app.courseSection')
.controller('AddTitleToCourseSectionModalCtrl', function ($scope, ProductService, LicenseService, $stateParams, $modalInstance, ModalErrorHandler) {

  $scope.alerts = [];

  $scope.data = {};

  LicenseService.getSchoolLicenses()
  .then(function(data){
    $scope.licenses = _.map(data, function(item) {
      item.title = item.product.title;
      return item;
    });
  });


  $scope.add = function () {

    if(!$scope.data.license) return $scope.alerts = [{ type: 'danger', msg: 'Please select a title' }];

    ProductService.provisionProductToCourseSection($scope.courseSection.id, $scope.data.license.id)
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

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

});
