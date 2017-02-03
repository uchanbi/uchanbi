'use strict';

angular.module('app.license')
.controller('LicenseModalCtrl', function ($scope, modalOpts, ProductService, LicenseService, $stateParams, $modalInstance, $filter, localStorage, ModalErrorHandler) {

  $scope.alerts = [];

  $scope.dateOptions = {
    dateFormat: 'dd M yy',
    changeYear: true,
    changeMonth: true
  };

  if(!$scope.newLicense) {
    $scope.newLicense = {};
  }

  $scope.modalOpts = modalOpts;

  ProductService.getProducts()
  .then(function(data) {
    $scope.products = data;
  });


  $scope.updateLicensePeriod = function() {

    var fifteenMonths = moment($scope.newLicense.start).add(15, 'months').toDate();
    $scope.newLicense.end = fifteenMonths;
  } 
    
      
    
 

  $scope.save = function () {
    if(!$scope.newLicense.product) return $scope.alerts = [{ type: 'danger', msg: 'Please select a product' }];
    if(moment($scope.newLicense.end).isBefore($scope.newLicense.start)) return $scope.alerts = [{ type: 'danger', msg: 'License end date is before start date' }];

    $scope.newLicense.school = localStorage.get('school').id;

    var newLicense = angular.copy($scope.newLicense);
    newLicense.product = $scope.newLicense.product.id;

    LicenseService.addLicense(newLicense)
    .then(function(data){
      $modalInstance.close(data);
    }, function(err){
      ModalErrorHandler.handleError(err, $scope, $modalInstance);
    });
  };

  $scope.update = function () {
    if(moment($scope.newLicense.end).isBefore($scope.newLicense.start)) return $scope.alerts = [{ type: 'danger', msg: 'License end date is before start date' }];
    LicenseService.updateLicense($scope.newLicense)
    .then(function(data){
      $modalInstance.close(data);
    }, function(err){
      //  Quick fix
      if(err.statusCode === 404) err.message = 'License not found';
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
