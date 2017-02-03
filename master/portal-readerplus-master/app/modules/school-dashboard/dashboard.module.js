'use strict';

angular.module('app.schoolDashboard', [])
.controller('SchoolDashboardCtrl', function ($scope, DashboardService, SchoolService, $location, $modal, UserService, CourseSectionService, localStorage, uiGridConstants) {

  $scope.alerts = [];

  $scope.csv = null;

  $scope.sincsv = null;

  $scope.school = localStorage.get('school');

  CourseSectionService.getCourseSections()
  .then(function(data){
    $scope.courseSections = data;
    $scope.originalCourseSections = data;
    if($scope.courseSections.length === 0) {
      $scope.emptyCourseSections = 'You don\'t have any course sections yet';
    }
  });

  var refreshCourseSection = function() {
      CourseSectionService.getCourseSections()
  .then(function(data){
    $scope.courseSections = data;
    $scope.originalCourseSections = data;
    if($scope.courseSections.length === 0) {
      $scope.emptyCourseSections = 'You don\'t have any course sections yet';
    }
    else {

      $scope.emptyCourseSections = false;
    }
  });
  }

  SchoolService.getUsers('teacher')
  .then(function(data) {
    $scope.instructors = _.filter(data, function(instructor) {
      return instructor.name;
    });
  });

  $scope.dateOptions = {
    dateFormat: 'dd M yy'
  };

  $scope.$watchGroup(['fromDate', 'toDate', 'selectedInstructor'], function(newValue, oldValue) {
    var fromDate = new Date($scope.fromDate);
    var toDate = new Date($scope.toDate);

    $scope.courseSections = _.filter(_.filter($scope.originalCourseSections, function(courseSection) {
      var greaterThanFrom = true;
      var lessThanTo = true;
      if (!isNaN(fromDate.getTime())) {
        greaterThanFrom = new Date(courseSection.start).getTime() >= fromDate.getTime();
      }

      if (!isNaN(toDate.getTime())) {
        lessThanTo = new Date(courseSection.end).getTime() <= toDate.getTime();
      }

      return greaterThanFrom && lessThanTo;
    }), function(courseSection) {
      // If no instructer filter, return the course section
      if($scope.selectedInstructor == null) return true;

      return _.some(courseSection.teachers, function(teacher) {
        return teacher.name.toLowerCase() === $scope.selectedInstructor.toLowerCase()
      });
    });

    if(_.some(newValue) && $scope.courseSections.length === 0) {
      $scope.emptyCourseSections = 'No results for selected filters';
    } else {
      $scope.emptyCourseSections = null;
    }

  });

  var actionsCell =  '<a class="btn-xs btn btn-primary" ng-click="grid.appScope.sectionDetails(row.entity)">Details</a>';
  var dateCell = '<div class="ui-grid-cell-contents"><div>{{row.entity[col.field] | date:"dd MMM yyyy" }}</div></div>';

  $scope.gridOptions = {
    data: 'courseSections',
    paginationPageSize: 20,
    columnDefs: [
      { field: 'sectionCode', displayName: 'Code'},
      { field: 'name', displayName: 'Course Section', sort: { priority: 0, direction: uiGridConstants.ASC }},
      { field: 'start', displayName: 'Course Start', cellTemplate: dateCell },
      { field: 'end', displayName: 'Course End', cellTemplate: dateCell },
      { field: 'teachers[0].name', displayName: 'Instructor Name'},
      { name: 'actions', displayName: ' ', width: 70, cellTemplate: actionsCell, enableColumnMenu: false }
    ]
  };

  $scope.sectionDetails = function(courseSection) {
    $location.path('/school-admin/course-section/' + courseSection.id);
  };

  $scope.addSection = function() {
    var modalInstance = $modal.open({
        templateUrl: 'modules/courseSection/modals/courseSection.crud.html',
        controller: 'CourseSectionCrudModalCtrl',
        resolve: {
          modalOpts: function () {
            return {
              method: 'add'
            };
          }
        }
      }
    )
    .result
    .then(function(result){
      //$scope.courseSections.unshift(result);
      refreshCourseSection();
      $scope.alerts = [{ type: 'success', msg: 'Course section ' + result.name + ' successfully created' }];
    })
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.$watch('csv', function(result){
    if(result) {
      if(result.errors.length > 0) {
        var errorMessage = [];
        _.each(result.errors, function(err){
          errorMessage.push('<li>' + err.message + '</li>');
        })
        return $scope.alerts = [{ type: 'danger', msg: '<ul>' + errorMessage + '</ul>' }];
      }
      CourseSectionService.bulkEnrollwithUsername(result.data, $scope.school.id)
      .then(function(data){
        $scope.alerts = [];
        if(data.successMessage) $scope.alerts.push({ type: 'success', msg: data.successMessage });
        if(data.errorMessage) $scope.alerts.push({ type: 'danger', msg: data.errorMessage });
      }, function(err){
        $scope.alerts = [{ type: 'danger', msg: err }];
      })
    }
  });

  $scope.$watch('sincsv', function(result){
    if(result) {
      if(result.errors.length > 0) {
        var errorMessage = [];
        _.each(result.errors, function(err){
          errorMessage.push('<li>' + err.message + '</li>');
        })
        return $scope.alerts = [{ type: 'danger', msg: '<ul>' + errorMessage + '</ul>' }];
      }
      CourseSectionService.bulkEnrollwithSin(result.data, $scope.school.id)
      .then(function(data){
        $scope.alerts = [];
        if(data.successMessage) $scope.alerts.push({ type: 'success', msg: data.successMessage });
        if(data.errorMessage) $scope.alerts.push({ type: 'danger', msg: data.errorMessage });
      }, function(err){
        $scope.alerts = [{ type: 'danger', msg: err }];
      })
    }
  });
});
