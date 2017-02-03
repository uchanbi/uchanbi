'use strict';

angular.module('app.school')
.factory('SchoolService', function ($q, $http, $rootScope, localStorage) {

  var Globals = $rootScope.globals;

  this.getSchools = function() {
    var deferred = $q.defer();

    $http.get(Globals.glsUrl + '/school')
    .then(function(res) {
      deferred.resolve(res.data);
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  this.getSchool = function(id) {
    var deferred = $q.defer();

    $http.get(Globals.glsUrl + '/school/' + id)
    .then(function(res) {
      deferred.resolve(res.data);
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  this.getSchoolUsersByRole = function(id, role) {
    var deferred = $q.defer();

    $http.get(Globals.glsUrl + '/school/' + id + '/' + role)
    .then(function(res) {
      deferred.resolve(res.data);
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  this.getSchoolLicenses = function(id, role) {
    var deferred = $q.defer();

    $http.get(Globals.glsUrl + '/school/' + id + '/license')
    .then(function(res) {
      deferred.resolve(res.data);
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  this.addSchool = function(school) {
    var deferred = $q.defer();

    $http.post(Globals.glsUrl + '/school', school)
    .success(function(school) {
      deferred.resolve(school);
    }).error(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.getUsers = function(role) {
    var deferred = $q.defer();

    if(!role) role = 'user'

    $http.get(Globals.glsUrl + '/school/' + localStorage.get('school').id + '/' + role)
    .then(function(res) {
      deferred.resolve(res.data);
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  this.addUser = function(schoolId, user) {
    var deferred = $q.defer();

    $http.patch(Globals.glsUrl + '/enrollment/school/' + schoolId + '/' + user.role, {
      add: user.id
    })
    .success(function(school) {
      deferred.resolve(user);
    }).error(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.removeUser = function(schoolId, user) {
    var deferred = $q.defer();

    $http.patch(Globals.glsUrl + '/enrollment/school/' + schoolId + '/' + user.role, {
      remove: user.id
    })
    .success(function(school) {
      deferred.resolve();
    }).error(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  return this;
});


