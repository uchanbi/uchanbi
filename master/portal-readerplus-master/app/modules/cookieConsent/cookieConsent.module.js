'use strict';

angular.module('app.cookieConsent', [])
.controller('CookieConsentCtrl', function ($scope, $localStorage, localStorage) {
  $scope.cookieConsent = $localStorage.cookieConsent;
  $scope.consent = function() {
    $scope.cookieConsent = $localStorage.cookieConsent = true;
    localStorage.copyOver();
  };
});
