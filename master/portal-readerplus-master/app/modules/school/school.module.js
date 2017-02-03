'use strict';

angular.module('app.school', [])
.controller('SchoolCtrl', function ($scope, $filter, SchoolService, $stateParams, $modal, $location, $state, uiGridConstants) {

  $scope.alerts = [];

  $scope.school = {};

  SchoolService
  .getSchool($stateParams.SchoolId)
  .then(function(data){
    data.start = $filter('date')(data.start, 'dd MMM yyyy');
    data.end = $filter('date')(data.end, 'dd MMM yyyy');
    $scope.school = angular.extend($scope.school, data);
  });

  var refreshAdmins = function() {
    SchoolService
    .getSchoolUsersByRole($stateParams.SchoolId, 'admin')
    .then(function(data) {
      $scope.admins =  _.map(data, function(user){
        user.role = user.roles[0];
        return user;
      });
      if(data.length === 0) {
        $scope.noSchoolAdmins = 'This school does not have any admins assigned yet';
      }
    });
  };

  var refreshLicenses = function() {
    SchoolService
    .getSchoolLicenses($stateParams.SchoolId)
    .then(function(data){
      $scope.licenses = _.map(data, function(license) {
        return _.extend(license, {
          start : $filter('date')(new Date(license.start), 'dd MMM yyyy'),
          end : $filter('date')(new Date(license.end), 'dd MMM yyyy'),
        });
      });

      if(data.length === 0) {
        $scope.noSchoolLicenses = 'This school does not have any licenses assigned yet';
      }
    });
  };

  refreshAdmins();
  refreshLicenses();

  var actionsCell = '<a class="btn btn-danger btn-xs" ng-click="grid.appScope.removeAdminConfirm(row.entity)">Remove</a>';

  $scope.adminGridOptions = {
    data: 'admins',
    paginationPageSize: 20,
    columnDefs: [
      { field: 'firstName', displayName: 'First Name'},
      { field: 'lastName', displayName: 'Last Name', sort: { priority: 0, direction: uiGridConstants.ASC }},
      { field: 'email', displayName: 'Email'},
      { name: 'actions', displayName: ' ', width: 75, cellTemplate: actionsCell, enableColumnMenu: false }
    ]
  };

  var actionsCell = '<a class="btn-xs btn btn-primary" ng-click="grid.appScope.editLicense(row.entity.id)">Edit</a><a class="btn-xs btn btn-danger" ng-click="grid.appScope.removeLicense(row.entity)">Remove</a>';
  var termCell = '<div class="ui-grid-cell-contents col1 colt1"><div>{{row.entity.start}} - {{row.entity.end}}</div></div>';

  $scope.licenseGridOptions = {
    data: 'licenses',
    paginationPageSize: 20,
    columnDefs: [
      { field: 'product.title', displayName: 'Product Name'},
      { field: 'term', displayName: 'Term', cellTemplate: termCell },
      { field: 'seats', displayName: 'Seats', width : 80},
      { name: 'actions', displayName: ' ', width: 115, cellTemplate: actionsCell, enableColumnMenu: false }
    ]
  };

  $scope.addLicense = function() {
    var modalInstance = $modal.open({
        templateUrl: 'modules/license/modals/license.crud.modal.html',
        controller: 'LicenseModalCtrl',
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
      $scope.alerts = [{ type: 'success', msg: 'License successfully created for ' + result.product.title }];
      $scope.noSchoolLicenses = null;
      refreshLicenses();
    })
  };

  $scope.editLicense = function(licenseId) {
    $scope.newLicense = angular.copy(_.find($scope.licenses, function(license) {
      return license.id === licenseId;
    }));
  

    var modalInstance = $modal.open({
        templateUrl: 'modules/license/modals/license.crud.modal.html',
        controller: 'LicenseModalCtrl',
        scope : $scope,
        resolve: {
          modalOpts: function () {
            return {
              method: 'edit'
            };
          }
        }
      }
    )
    .result
    .then(function(result){
      $scope.alerts = [{ type: 'success', msg: 'License for ' + result.product.title + ' successfully updated' }];
      refreshLicenses();
    })
  };

  $scope.removeLicense = function(item) {
    $scope.removeLicenseId = item.id;
    var modalInstance = $modal.open({
        templateUrl: 'modules/license/modals/license.remove.html',
        controller: 'RemoveLicenseModalCtrl',
        scope: $scope
      }
    )
    .result
    .then(function(result){
      $scope.alerts = [{ type: 'success', msg: 'License for ' + item.product.title + ' removed' }];
      refreshLicenses();
    })
  };


  $scope.addAdmin = function() {
    var modalInstance = $modal.open({
        templateUrl: 'modules/admin/modals/admin.addToSchool.html',
        controller: 'AddAdminToSchoolModalCtrl',
      }
    )
    .result
    .then(function(result){
      $scope.alerts = [{ type: 'success', msg: 'Admin ' + result.firstName + ' successfully added to school' }];
      $scope.noSchoolAdmins = null;
      refreshAdmins();
    })
  };

  $scope.removeAdminConfirm = function(item) {
    $scope.user = item;
    var modalInstance = $modal.open({
        templateUrl: 'modules/admin/modals/admin.removeFromSchool.html',
        controller: 'RemoveAdminFromSchoolModalCtrl',
        scope: $scope
      }
    )
    .result
    .then(function(result){
      $scope.alerts = [{ type: 'success', msg: 'Admin successfully removed from school' }];
      refreshAdmins();
    })
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };
});
