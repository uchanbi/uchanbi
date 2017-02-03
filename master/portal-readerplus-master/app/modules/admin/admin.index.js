'use strict';

angular.module('app.admin')
.controller('AdminIndexCtrl', function ($scope, $filter, AdminService, $stateParams, $modal, UserService, uiGridConstants) {
  $scope.alerts = [];

  var refreshAdmins = function() {
    UserService.getUsers('admin')
    .then(function(data) {
      $scope.admins = data;
      $scope.originalAdmins = data;

      if($scope.admins.length === 0) {
        $scope.emptyAdmins = 'There are no admins yet';
      } else {
        $scope.emptyAdmins = null;
      }
    });
  };

  refreshAdmins();

  $scope.$watchGroup(['adminName'], function(newValue, oldValue) {
    $scope.admins = _.filter($scope.originalAdmins, function(admin) {
      if(!newValue[0]) return true;
      return (admin.firstName + admin.lastName).toLowerCase().indexOf(newValue[0].toLowerCase()) >= 0
    });
  });
  var actionsCell = '<a class="btn-xs btn btn-primary" ng-click="grid.appScope.editAdmin(row.entity)">Edit</a>';

  $scope.gridOptions = {
    data: 'admins',
    paginationPageSize: 20,
    columnDefs: [
      { field: 'firstName', displayName: 'First Name'},
      { field: 'lastName', displayName: 'Last Name', sort: { priority: 0, direction: uiGridConstants.ASC }},
      { field: 'email', displayName: 'email'},
      { name: 'actions', displayName: ' ', width: 110, cellTemplate: actionsCell, enableColumnMenu: false }
    ]
  };

  $scope.addAdmin = function() {
    var modalInstance = $modal.open({
        templateUrl: 'modules/user/user.modal.html',
        controller: 'UserModalCtrl',
        resolve: {
          modalOpts: function () {
            return {
              method: 'add',
              role: 'admin'
            };
          }
        }
      }
    )
    .result
    .then(function(result){
      refreshAdmins();
      $scope.alerts = [{ type: 'success', msg: 'Admin ' + result.name + ' successfully created' }];
    })
  };

  $scope.editAdmin = function(admin) {
    $scope.newUser = angular.copy(admin);

    $modal.open({
      templateUrl: 'modules/user/user.modal.html',
      controller: 'UserModalCtrl',
      scope: $scope,
      resolve: {
        modalOpts: function () {
          return {
            method: 'edit',
            role: 'admin'
          };
        }
      }
    })
    .result
    .then(function(result){
      refreshAdmins();
      if(result.message && result.message === 'Admin successfully deleted') return $scope.alerts = [{ type: 'success', msg: result.message }];
      angular.copy(result, admin);
      $scope.alerts = [{ type: 'success', msg: 'Admin ' + result.firstName + ' ' + result.lastName + ' successfully updated' }];
    });
  };


  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };
});
