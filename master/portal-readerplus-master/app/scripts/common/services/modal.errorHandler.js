'use strict';

angular.module('app.common.services')
.factory('ModalErrorHandler', function() {
    return {
       handleError: function(err, $scope, $modalInstance){
         if(err.statusCode === 401 || err.statusCode === 403) {
             $modalInstance.dismiss();
         } else {
           $scope.alerts = [{ type: 'danger', msg: err.message }];
         }
       }
    };
});
