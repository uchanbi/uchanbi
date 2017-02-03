'use strict';

angular.module('app.courseSection')
.controller('CourseSectionCrudModalCtrl', function($scope, modalOpts, UserService, SchoolService, CourseSectionService, $stateParams, $modalInstance, ModalErrorHandler) {

  $scope.alerts = [];

  $scope.dateOptions = {
    dateFormat: 'dd M yy'
  };

  if (!$scope.newCourseSection) {
    $scope.newCourseSection = {};
  } else {
    $scope.newCourseSection.oldTeacher = $scope.newCourseSection.teacher || {};
  }

  $scope.modalOpts = modalOpts;

  SchoolService.getUsers('teacher')
  .then(function(data) {
    $scope.instructors = data;
  });


  $scope.save = function() {
    if(!$scope.newCourseSection.teacher) return $scope.alerts = [{ type: 'danger', msg: 'Please select an Instructor' }];
    if(!$scope.newCourseSection.start) return $scope.alerts = [{ type: 'danger', msg: 'Please select a start date' }];
    if(!$scope.newCourseSection.end) return $scope.alerts = [{ type: 'danger', msg: 'Please select a end date' }];

    CourseSectionService.addCourseSection($scope.newCourseSection)
    .then(function(data) {
      $modalInstance.close(data);
    }, function(err) {
        ModalErrorHandler.handleError(err, $scope, $modalInstance);
      });
  };

  $scope.update = function() {
    CourseSectionService.updateCourseSection($scope.newCourseSection)
    .then(function(data) {
      $modalInstance.close(data);
    }, function(err) {
        ModalErrorHandler.handleError(err, $scope, $modalInstance);
      });
  };

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

});
