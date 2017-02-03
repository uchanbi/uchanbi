'use strict';

angular.module('app.login')
.factory('LogoutService', function ($q, $http, $localStorage, $rootScope) {
  var Globals = $rootScope.globals;
  this.logout = function() {
    var deferred = $q.defer();
    $http.post(Globals.glsUrl + '/logoff', {})
    .success(function(data, status, headers, config) {
      delete $localStorage.user;
      delete $localStorage.school;
      delete $localStorage.token;
      delete $http.defaults.headers.common.token;

      deferred.resolve();
    })
    .error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  return this;
});
