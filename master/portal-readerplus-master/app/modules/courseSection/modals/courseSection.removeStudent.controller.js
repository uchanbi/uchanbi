'use strict';

angular.module('app.courseSection')
.controller('RemoveStudentFromCourseSectionModalCtrl', function ($scope, UserService, $modalInstance, ModalErrorHandler) {

  $scope.remove = function () {
    UserService.removeStudentFromCourseSection($scope.courseSection.id, $scope.removeStudentId)
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
