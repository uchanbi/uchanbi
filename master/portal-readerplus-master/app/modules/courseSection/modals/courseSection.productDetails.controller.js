'use strict';

angular.module('app.courseSection')
.controller('ShowProductDetailsModalCtrl', function ($scope, ProductService,  $modalInstance) {
  ProductService.getProduct($scope.selectedProductId)
  .then(function(product) {
    product.layout = _.map(product.layout, function(layout) {
      return layout.replace(/_/g, ' ');
    });
    $scope.selectedProduct = product;
  });
});
