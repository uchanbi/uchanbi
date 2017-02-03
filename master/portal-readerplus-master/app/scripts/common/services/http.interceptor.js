angular.module('app.common.services', [])
.factory('httpInterceptor', function ($q, $rootScope, $location) {
    return {
        responseError: function (response) {

            if ((response.status === 401  && $rootScope.globals.user) || (response.status === 403  && $rootScope.globals.user)) {
                $rootScope.globals.errors.sessionExpired = true;
                $location.path('/login');
            }

            return $q.reject(response);
        }
    };
});