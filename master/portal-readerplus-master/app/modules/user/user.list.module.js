'use strict';

angular.module('app.user')
.controller('UserListCtrl', function ($scope, $filter, UserService, SchoolService, $stateParams, $modal, uiGridConstants) {
  $scope.alerts = [];

  var refreshUsers = function() {
    SchoolService.getUsers()
    .then(function(data) {
      $scope.users = data;
      $scope.originalUsers = data;
      $scope.roles = _.chain(data)
      .pluck('roles')
      .map(function(roles) {
        return roles[0]
      })
      .unique()
      .value();

      _.each($scope.users, function(user){
        user.role = user.roles[0];
      })

      if($scope.users.length === 0) {
        $scope.emptyUsers = 'There are no users yet';
      } else {
        $scope.emptyUsers = null;
      }
    });
  };

  refreshUsers();

  $scope.$watchGroup(['userFilterBy', 'selectedRole'], function(newValue, oldValue) {
    $scope.users = _.filter(_.filter($scope.originalUsers, function(user) {
      if(!newValue[0]) return true;
      return ((user.firstName + user.lastName).toLowerCase().indexOf(newValue[0].toLowerCase()) >= 0
       ||  user.sin && user.sin.toLowerCase().indexOf(newValue[0].toLowerCase()) >= 0);
    }), function(user) {
      if($scope.selectedRole == null) return true;
      return user.roles[0] === $scope.selectedRole;
    });
  });
  var actionsCell = '<a class="btn-xs btn btn-primary" ng-click="grid.appScope.editUser(row.entity)">Edit</a>';
  actionsCell += '<a class="btn-xs btn btn-info" ng-click="grid.appScope.showCourseSections(row.entity)">Course sections</a>';
  actionsCell += '<a ng-if="row.entity.role !== \'admin\'" class="btn-xs btn btn-danger" ng-click="grid.appScope.deleteUser(row.entity)">Delete</a>';

  $scope.gridOptions = {
    data: 'users',
    paginationPageSize: 20,
    columnDefs: [
      { field: 'firstName', displayName: 'First Name'},
      { field: 'lastName', displayName: 'Last Name', sort: { priority: 0, direction: uiGridConstants.ASC }},
      { field: 'email', displayName: 'email'},
      { field: 'sin', displayName: 'SIN'},
      { field: 'roles[0]', displayName: 'Role'},
      { name: 'actions', displayName: ' ', width: 215, cellTemplate: actionsCell, enableColumnMenu: false }
    ]
  };

  $scope.addUser = function() {
    var modalInstance = $modal.open({
        templateUrl: 'modules/user/user.modal.html',
        controller: 'UserModalCtrl',
        resolve: {
          modalOpts: function () {
            return {
              method: 'add',
              role: 'user'
            };
          }
        }
      }
    )
    .result
    .then(function(result){
      refreshUsers();
      $scope.alerts = [{ type: 'success', msg: 'User ' + result.name + ' successfully created' }];
    })
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
      refreshUsers();
      if(result.message && result.message === 'User successfully deleted') return $scope.alerts = [{ type: 'success', msg: result.message }];
      angular.copy(result, user);
      $scope.alerts = [{ type: 'success', msg: 'User ' + result.firstName + ' ' + result.lastName + ' successfully updated' }];
    });
  };


  $scope.deleteUser = function(user) {
    $scope.newUser = angular.copy(user);

    $modal.open({
      templateUrl: 'modules/user/user.modal.html',
      controller: 'UserModalCtrl',
      scope: $scope,
      resolve: {
        modalOpts: function () {
          return {
            method: 'delete',
            role: 'user'
          };
        }
      }
    })
    .result
    .then(function(result){
      refreshUsers();
      if(result.message && result.message === 'User successfully deleted') return $scope.alerts = [{ type: 'success', msg: result.message }];
    });
  };

  $scope.showCourseSections = function(user) {
    var modalInstance = $modal.open({
        templateUrl: 'modules/user/modals/courseSections.html',
        controller: 'UserCourseSectionModalCtrl',
        resolve: {
          modalOpts: function () {
            return {
              user: user
            };
          }
        }
      }
    )
    .result
    .then(function(result){
      refreshUsers();
      $scope.alerts = [{ type: 'success', msg: 'User ' + result.name + ' successfully created' }];
    })
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

      UserService.batchCreate(result.data)
      .then(function(data){
        $scope.alerts = [];

        if(data.successMessage) $scope.alerts.push({ type: 'success', msg: data.successMessage });
        if(data.errorMessage) $scope.alerts.push({ type: 'danger', msg: data.errorMessage });
        refreshUsers();
      }, function(err){
        $scope.alerts = [{ type: 'danger', msg: err }];
      })
    }
  });

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };
});
