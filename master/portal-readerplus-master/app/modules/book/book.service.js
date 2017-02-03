'use strict';

angular.module('app.book')
.factory('BookService', function ($q, $http, $rootScope) {

  var Globals = $rootScope.globals;

   this.getBooks = function() {
    var deferred = $q.defer();

    $http.get(Globals.glsUrl + '/book')
    .then(function(res) {
      deferred.resolve(res.data);
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  this.getBook = function(id) {
    var deferred = $q.defer();

    $http.get(Globals.glsUrl + '/book/' + id)
    .then(function(res) {
      deferred.resolve(res.data);
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  this.addBook = function(book) {
    var deferred = $q.defer();

    $http.post(Globals.glsUrl + '/book', book)
    .success(function(book) {
      deferred.resolve(book);
    }).error(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.updateBook = function(id, book) {
    var deferred = $q.defer();

    $http.put(Globals.glsUrl + '/book/' + id, book)
    .success(function(book) {
      deferred.resolve(book);
    }).error(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.deleteBook = function(id) {
    var deferred = $q.defer();

    $http.delete(Globals.glsUrl + '/book/' + id)
    .success(function(data) {
      deferred.resolve({ message: 'Successfully deleted book'});
    }).error(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  return this;
});
