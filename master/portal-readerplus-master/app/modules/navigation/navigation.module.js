'use strict';

angular.module('app.navigation', [])
.controller('NavigationCtrl', function ($scope, $location, localStorage, $state) {

  $scope.school = localStorage.get('school');
  $scope.schools = localStorage.get('schools');

  $scope.refreshPage = function(item, model){
    localStorage.set('school', item)
    // If on course section detail page, redirect
    if(_.contains($location.url(), 'school-admin/course-section')) return $state.go('main.schoolAdmin.dashboard');
    // else refresh the page
    $state.go($state.current, {}, {reload: true});
  }
});