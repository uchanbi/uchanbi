'use strict';

angular.module('app.user')
.controller('UserCourseSectionModalCtrl', function ($scope, UserService, $location, $stateParams, $modalInstance, ModalErrorHandler, modalOpts) {

  $scope.alerts = [];

  $scope.data = {};

  _.merge($scope, modalOpts);

  UserService.getCourseSections($scope.user.id)
  .then(function(data){
    $scope.courseSections = data;
  });

  $scope.gotoCourseSection = function(id) {
    $location.url('/school-admin/course-section/' + id);
    $modalInstance.dismiss();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss();
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

});
