'use strict';

angular.module('app.courseSection', [])
.controller('CourseSectionCtrl', function ($scope, $filter, localStorage, CourseSectionService, $stateParams, $modal, $location, $state, uiGridConstants) {

  $scope.alerts = [];

  $scope.school = localStorage.get('school');

  $scope.courseSection = {};

  CourseSectionService
  .getCourseSection($stateParams.CourseSectionId)
  .then(function(data){
    data.start = $filter('date')(data.start, 'dd MMM yyyy');
    data.end = $filter('date')(data.end, 'dd MMM yyyy');
    $scope.courseSection = angular.extend($scope.courseSection, data);
  });

  var refreshStudents = function() {
    CourseSectionService
    .getCourseSectionStudents($stateParams.CourseSectionId)
    .then(function(data){
      $scope.courseSection.students = data;
      if($scope.courseSection.students.length === 0) {
        $scope.noCourseSectionStudents = 'This course does not have any students assigned yet';
      }
    });
  };

  var refreshProducts = function() {
    CourseSectionService
    .getCourseSectionProducts($stateParams.CourseSectionId)
    .then(function(data){
      $scope.courseSection.products = _.map(data, function(item) {
        return {
          id : item.id,
          product : item.product,
          term : $filter('date')(item.start, 'dd MMM yyyy') + ' - ' + $filter('date')(item.end, 'dd MMM yyyy'),
          availableSeats : item.remainingSeats
        }
      })
      if($scope.courseSection.products.length === 0) {
        $scope.noCourseSectionProducts = 'This course does not have any products assigned yet';
      }
    });
  };

  refreshStudents();
  refreshProducts();

  CourseSectionService
  .getCourseSections($stateParams.CourseSectionId)
  .then(function(data){
    $scope.courseSections = _.sortBy(data, function(courseSection) {
      return courseSection.name; });
  });

  var actionsCell = '<a class="btn-xs btn btn-primary" ng-click="grid.appScope.productDetails(row.entity)">Details</a><a class="btn btn-danger btn-xs" ng-click="grid.appScope.removeTitle(row.entity)">Remove</a>';

  $scope.productGridOptions = {
    data: 'courseSection.products',
    paginationPageSize: 20,
    columnDefs: [
      { field: 'product.title', displayName: 'Book Title', sort: { priority: 0, direction: uiGridConstants.ASC }},
      { field: 'term', displayName: 'License Term'},
      { field: 'availableSeats', displayName: '# of Unused Licenses'},
      { name: 'actions', displayName: ' ', width: 135, cellTemplate: actionsCell, enableColumnMenu: false }
    ]
  };

  var nameCell = '<div class="ui-grid-cell col1 colt1"><div>{{row.entity.firstName}} {{row.entity.lastName}}</div></div>';
  var actionsCell =  '<a class="btn-xs btn btn-primary" ng-click="grid.appScope.editUser(row.entity)">Edit</a><a class="btn-xs btn btn-danger" ng-click="grid.appScope.removeStudent(row.entity)">Remove</a>';

  $scope.gridOptions = {
    data: 'courseSection.students',
    paginationPageSize: 20,
    columnDefs: [
      { field: 'name', displayName: 'Name', cellTemplate: nameCell},
      { field: 'email', displayName: 'Email'},
      { field: 'role', displayName: 'Role' },
      { name: 'actions', displayName: ' ', width: 120, cellTemplate: actionsCell, enableColumnMenu: false, enableColumnMenu: false }
    ]
  };

  $scope.editSection = function() {

    $scope.newCourseSection = angular.copy($scope.courseSection);

    $modal.open({
      templateUrl: 'modules/courseSection/modals/courseSection.crud.html',
      controller: 'CourseSectionCrudModalCtrl',
      scope: $scope,
      resolve: {
        modalOpts: function () {
          return {
            method: 'edit'
          };
        }
      }
    })
    .result
    .then(function(result){
      refreshProducts();
      $scope.courseSection = result;
      $scope.alerts = [{ type: 'success', msg: 'Course section ' + result.name + ' successfully updated' }];
    });
  };

  $scope.addStudentToCourseSection = function() {
    $modal.open({
      templateUrl: 'modules/courseSection/modals/courseSection.addStudent.html',
      controller: 'AddStudentToCourseSectionModalCtrl',
      scope: $scope
    })
    .result
    .then(function(result) {
      var names = _.map(result, function(item, index) {
        return item.user.name;
      });

      $scope.alerts = [{ type: 'success', msg: (names.length === 1 ? 'User ' : 'Users ') + names + ' successfully added to course section' }];
      $scope.noCourseSectionStudents = null;
      refreshProducts();
      refreshStudents();
    });
  };

  $scope.addTitle = function() {
    $modal.open({
      templateUrl: 'modules/courseSection/modals/courseSection.addTitle.html',
      controller: 'AddTitleToCourseSectionModalCtrl',
      scope: $scope
    })
    .result
    .then(function(result){
      $scope.alerts = [{ type: 'success', msg: 'Title ' + result.product.title + ' successfully added to course section' }];
      $scope.courseSection.products.push({
        id : result.id,
        product : result.product,
        term : $filter('date')(result.start, 'dd MMM yyyy') + ' - ' + $filter('date')(result.end, 'dd MMM yyyy'),
        availableSeats : result.remainingSeats
      });
      $scope.noCourseSectionProducts = null;
    });
  };

  $scope.removeTitle = function(item) {
    $scope.removeLicenseId = item.id;
    $modal.open({
      templateUrl: 'modules/courseSection/modals/courseSection.removeTitle.html',
      controller: 'RemoveTitleFromCourseSectionModalCtrl',
      scope: $scope
    })
    .result
    .then(function() {
      refreshProducts();
      $scope.alerts = [{ type: 'success', msg: 'Title ' + item.product.title + ' successfully removed from course section' }];
    });
  };

  $scope.removeStudent = function(item) {
    $scope.removeStudentId = item.id;
    $modal.open({
      templateUrl: 'modules/courseSection/modals/courseSection.removeStudent.html',
      controller: 'RemoveStudentFromCourseSectionModalCtrl',
      scope: $scope
    })
    .result
    .then(function() {
      refreshProducts();
      refreshStudents();
      $scope.alerts = [{ type: 'success', msg: item.name + ' successfully removed from course section' }];
    });
  };

  $scope.editUser = function(user) {
    $scope.newUser = angular.copy(user);

    $modal.open({
      templateUrl: 'modules/user/user.modal.html',
      controller: 'UserModalCtrl',
      scope: $scope,
      resolve: {
        modalOpts: function () {
          return {
            method: 'edit',
            role: 'user'
          };
        }
      }
    })
    .result
    .then(function(result){
      refreshStudents();
      angular.copy(result, user);
      $scope.alerts = [{ type: 'success', msg: 'User ' + result.firstName + ' ' + result.lastName + ' successfully updated' }];
    });
  };

  $scope.productDetails = function(item) {
    $scope.selectedProductId = item.product.id;
    $modal.open({
      templateUrl: 'modules/courseSection/modals/courseSection.productDetails.html',
      controller: 'ShowProductDetailsModalCtrl',
      scope: $scope
    });
  };

  $scope.courseSectionSwitcher = function($item) {
    $location.path('/school-admin/course-section/' + $item.id);
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };
});
