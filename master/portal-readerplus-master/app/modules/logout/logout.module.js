'use strict';

angular.module('app.logout', [])
.controller('LogoutCtrl', function ($scope, LogoutService, $state) {
  LogoutService.logout().then(function() {
    $state.go('login');
  });
});
