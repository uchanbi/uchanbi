'use strict';

angular.module('app.login')
.factory('LoginService', function ($q, $http, localStorage, $rootScope) {

  var Globals = $rootScope.globals;

  this.login = function(username, password) {
    var deferred = $q.defer();

    $http.post(Globals.glsUrl + '/authenticate', { username: username, password: password})
    .success(function(data, status, headers, config) {

      localStorage.set('token', data.token);
      $http.defaults.headers.common.token = data.token;
      localStorage.set('user', null);

      deferred.resolve(data);
    })
    .error(function(data, status, headers, config) {
      deferred.reject(data);
    });

    return deferred.promise;
  };


  this.getCurrentUser = function() {
    var deferred = $q.defer();
    var dayInMilliseconds = 86400000;
    if(localStorage.get('user') && (new Date()).getTime() - localStorage.get('user').refreshDate < dayInMilliseconds) {
      $rootScope.globals.user = localStorage.get('user');
      $http.defaults.headers.common.token = localStorage.get('token');
      deferred.resolve(localStorage.get('user'));
      return deferred.promise;
    }

    if(!localStorage.get('token')){
      deferred.reject({});
      return deferred.promise;
    }

    $http.get(Globals.glsUrl + '/user')
    .success(function(data, status, headers, config) {
      localStorage.set('user', data);
      $rootScope.globals.user = data;
      localStorage.get('user').refreshDate = (new Date()).getTime();

      deferred.resolve(data);
    })
    .error(function(data, status, headers, config) {
      deferred.reject(data);
    });

    return deferred.promise;
  };

  this.getSchoolAdmin = function() {
    return this.getCurrentUser().then(function(user) {
      if (user.roles[0] !== 'admin') throw new Error('user role not admin');

      return user;
    });
  };

  this.getPearsonAdmin = function() {
    return this.getCurrentUser().then(function(user) {
      if (user.roles[0] !== 'pearson-admin') throw new Error('user role not Pearson admin');

      return user;
    });
  };

  this.getCurrentSchool = function() {

    var deferred = $q.defer();

    $http.get(Globals.glsUrl + '/admin/' + localStorage.get('user').id + '/enrollment/school')
    .success(function(data, status, headers, config) {
      if(data.length === 0) return deferred.reject({ message: 'User is not registered to a school'});

      localStorage.set('school', data[0].school);
      localStorage.set('schools', _.map(data, function(item){ return { id: item.school.id, name: item.school.name}}));

      deferred.resolve(data);
    })
    .error(function(data, status, headers, config) {
      deferred.reject(data);
    });

    return deferred.promise;
  };

  return this;
});


