angular.module('app.sse', [])
.factory('sse', function($rootScope) {;
  var sse = new EventSource($rootScope.globals.glsUrl + '/sse');
  return {
    addEventListener: function(eventName, callback) {
      sse.addEventListener(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(sse, args);
        });
      });
    }
  };
});