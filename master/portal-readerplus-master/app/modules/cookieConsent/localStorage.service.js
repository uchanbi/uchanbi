'use strict';

angular.module('app.cookieConsent')
.factory('localStorage', function ($localStorage, $rootScope) {

  this.set = function(item, value) {
    if($localStorage.cookieConsent) {
      $localStorage[item] = value;  
    }
    
    $rootScope.localStorage[item] = value;
  };

  this.get = function(item) {
    if($localStorage.cookieConsent) {
      return $localStorage[item]
    }
    
    return $rootScope.localStorage[item];
  };

  this.copyOver = function(item) {
    _.each($rootScope.localStorage, function(value, key) {
      $localStorage[key] = value;
    });
  }
  return this;

});


