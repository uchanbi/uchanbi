'use strict';

angular.module('app.book')
.controller('RemoveBookModalCtrl', function ($scope, BookService, $modalInstance, ModalErrorHandler) {

  $scope.delete = function () {
    BookService.deleteBook($scope.book.id)
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
