'use strict';

angular.module('app.product')
.factory('ProductService', function ($q, $http, $rootScope) {

  var Globals = $rootScope.globals;

   this.getProducts = function() {
    var deferred = $q.defer();

    $http.get(Globals.glsUrl + '/product')
    .then(function(res) {
      deferred.resolve(res.data);
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  this.getProduct = function(id) {
    var deferred = $q.defer();

    $http.get(Globals.glsUrl + '/product/' + id)
    .then(function(res) {
      deferred.resolve(res.data);
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  this.addProduct = function(product) {
    var deferred = $q.defer();

    $http.post(Globals.glsUrl + '/product', product)
    .success(function(product) {
      deferred.resolve(product);
    }).error(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.updateProduct = function(id, product) {
    var deferred = $q.defer();
    var updateProduct = {
      title: product.title,
      author: product.author ? product.author :'' ,
      description: product.description ? product.description :''
    }

    $http.put(Globals.glsUrl + '/product/' + id, updateProduct)
    .success(function(product) {
      deferred.resolve(product);
    }).error(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.deleteProduct = function(id) {
    var deferred = $q.defer();

    $http.delete(Globals.glsUrl + '/product/' + id)
    .success(function(data) {
      deferred.resolve({ message: 'Successfully deleted product'});
    }).error(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.provisionProductToCourseSection = function(courseSectionId, licenseId) {
     var deferred = $q.defer();

    $http({method:'PATCH', url: Globals.glsUrl + '/license/' + licenseId + '/provision/coursesection' , data: { add: courseSectionId} })
    .success(function(data, status, headers, config) {
      deferred.resolve(data);
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.removeProductProvisionFromCourseSection = function(courseSectionId, licenseId) {
     var deferred = $q.defer();

    $http({method:'PATCH', url: Globals.glsUrl + '/license/' + licenseId + '/provision/coursesection' , data: { remove: courseSectionId} })
    .success(function(data, status, headers, config) {
      deferred.resolve(data);
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.batch = function(products) {
    var deferred = $q.defer();

    var data = { requests: [] }

    _.each(products, function(product){
      if(product.Title || product['Cover Image URL'] || product['ePub URL'] || product['Page Navigation']){
        var payload = {
          title: product.Title.trim(),
          author: product.Author,
          description: product.Description,
          encpwd: (product.Passkey) ? product.Passkey.trim() : product.Passkey,
          coverImageURL: product['Cover Image URL'].trim(),
          epubURL: product['ePub URL'].trim(),
          teacherVersion: !!product['Has Teacher Version'],
          allowedPageNavigation: product['Page Navigation'].trim(),
          layout: product.Layout.split(',')
        }

        if(payload.teacherVersion) {
          payload.teacherEpubURL = product['Teacher ePub URL'].trim();
        }
        data.requests.push({
          method: 'post',
          path: '/product',
          payload: payload
        });
      }
    });

    $http.post(Globals.glsUrl + '/batch', data)
    .success(function(responses, status, headers, config) {

      var errors = [];

      _.each(responses, function(response, index){
        if(response.error) {
          errors.push('<li>' + data.requests[index].payload.title + ' - ' + response.message.replace('Error creating product: ', '') + '</li>')
        }
      });

      if(errors.length) {
        deferred.reject({message: '<h4>The following products were not created:</h4><ul>' + errors.join('') + '</ul>'});
      }

      deferred.resolve({ message: data.requests.length + ' products successfully uploaded'});
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });

    return deferred.promise;
  };

  return this;
});
