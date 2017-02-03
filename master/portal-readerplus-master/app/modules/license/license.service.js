'use strict';

angular.module('app.license')
.factory('LicenseService', function ($q, $http, $rootScope, localStorage) {

  var Globals = $rootScope.globals;

  this.getSchoolLicenses = function() {
    var deferred = $q.defer();

    $http.get(Globals.glsUrl + '/school/' + localStorage.get('school').id +'/license')
    .then(function(res) {
      deferred.resolve(res.data);
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  this.addLicense = function(license) {
    var deferred = $q.defer();

    $http.post(Globals.glsUrl + '/license', license)
    .success(function(license) {
      deferred.resolve(license);
    }).error(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.updateLicense = function(license) {
    var deferred = $q.defer();
    license.product = license.product.id;
    license.school = license.school.id;

    $http.put(Globals.glsUrl + '/license/' + license.id, _.omit(license, 'id', 'courseSections', 'remainingSeats', 'startFormatted', 'endFormatted'))
    .success(function(license) {
      deferred.resolve(license);
    }).error(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.removeLicense = function(licenseId) {
    var deferred = $q.defer();

    $http.delete(Globals.glsUrl + '/license/' + licenseId)
    .success(function() {
      deferred.resolve();
    }).error(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  return this;
});


