'use strict';

angular.module('app.pearsonDashboard', [])
.controller('PearsonDashboardCtrl', function ($scope, $location, localStorage, $modal, SchoolService, uiGridConstants) {

  $scope.alerts = [];

  var refreshSchools = function() {
    SchoolService.getSchools()
    .then(function(data){
      $scope.schools = data;
      $scope.originalSchools = data;
      if($scope.schools.length === 0) {
        $scope.emptySchools = 'There are no schools yet';
      }
    });

    $scope.$watchGroup(['schoolName'], function(newValue, oldValue) {
      $scope.schools = _.filter($scope.originalSchools, function(school) {
        return school.name.toLowerCase().indexOf(newValue[0].toLowerCase()) >= 0;
      });
    });
  };

  refreshSchools();

  var actionsCell = '<a class="btn-xs btn btn-primary" ng-click="grid.appScope.schoolDetail(row.entity)">View</a>';

  $scope.gridOptions = {
    data: 'schools',
    paginationPageSize: 20,
    columnDefs: [
      { field: 'name', displayName: 'Name', sort: { priority: 0, direction: uiGridConstants.ASC }},
      { field: 'city', displayName: 'City'},
      { field: 'country', displayName: 'Country'},
      { field: 'localCDNs', displayName: 'Servers'},
      { name: 'actions', displayName: ' ', width: 56, cellTemplate: actionsCell, enableColumnMenu: false }
    ]
  };

  $scope.schoolDetail = function(school) {
    localStorage.set('school', school);
    $location.path('/pearson-admin/school/' + school.id);
  };

  $scope.addSchool = function() {
    var modalInstance = $modal.open({
        templateUrl: 'modules/school/modals/school.add.html',
        controller: 'AddSchoolModalCtrl'
      }
    )
    .result
    .then(function(result){
      $scope.alerts = [{ type: 'success', msg: 'School ' + result.name + ' successfully created' }];
      refreshSchools();
    })
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };
});