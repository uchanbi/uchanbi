'use strict';

angular.module('app.product')
.controller('DeleteProductModalCtrl', function ($scope, ProductService, $modalInstance, ModalErrorHandler) {

  $scope.delete = function () {
    ProductService.deleteProduct($scope.product.id)
    .then(function(data){
      $modalInstance.close(data);
    }, function(err){
      if(err.statusCode === 404) err.message = 'Error';
      ModalErrorHandler.handleError(err, $scope, $modalInstance);
    });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss();
  };

});
