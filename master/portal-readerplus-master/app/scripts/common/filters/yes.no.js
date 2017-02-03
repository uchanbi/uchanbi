angular.module('app.common.filters', [])
  .filter('yesNo', function() {
  return function(text) {
      if (text) {
          return 'Yes';
      }
      return 'No';
  };
});