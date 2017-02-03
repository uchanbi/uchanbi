'use strict';

angular.module('app.courseSection')
.controller('AddStudentToCourseSectionModalCtrl', function ($scope, UserService, CourseSectionService, $stateParams, $modalInstance, ModalErrorHandler, filterFilter) {

  $scope.alerts = [];

  $scope.data = {};

  UserService.getStudentsNotEnrolled($stateParams.CourseSectionId)
  .then(function(data){
    $scope.students = data;
  });

  $scope.add = function () {
    var selectedStudents = _.filter($scope.students, 'selected');
    if(selectedStudents.length === 0) return $scope.alerts = [{ type: 'danger', msg: 'Please select a student' }];

    CourseSectionService.addStudents($scope.courseSection.id, selectedStudents)
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
