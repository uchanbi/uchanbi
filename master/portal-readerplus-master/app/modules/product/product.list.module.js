'use strict';

angular.module('app.product')
.controller('ProductListCtrl', function ($scope, $rootScope, $filter, ProductService, $stateParams, $modal, rfc4122, Upload, sse, $interval, $timeout, $http, uiGridConstants) {
  $scope.alerts = [];
  var uniqueIdentifiers = {};
  var gridEntityRef = {};
  var polling = {};

  // Look to re-implement SSE
  // sse.addEventListener('message', function (e) {
  //   var data = JSON.parse(e.data)
  //   if(gridEntityRef[data.uuid]) gridEntityRef[data.uuid].status[data.role] = data.progress;
  // });

  $rootScope.$on('fileProgress', function(event, data){
    $timeout(function(){
      uniqueIdentifiers[data.uniqueIdentifier].status[data.role] = "Uploading " + data.progress + '% ';
    },0)
  });

  $rootScope.$on('fileComplete', function(event, data){
    var uuid = uniqueIdentifiers[data.uniqueIdentifier].uuid;
    polling[uuid] = getStatus(uuid);
  });

  function getStatus(uuid){
    return $interval(function(){
      $http({
        method: 'GET',
        url: $rootScope.globals.glsUrl + '/status/' + uuid
      }).then(function successCallback(res) {
        if(gridEntityRef[uuid]) gridEntityRef[uuid].status[res.data.role] = res.data.progress;
        if(res.data.progress === 'Complete' || _.contains(res.data.progress, 'Error')) {
          $interval.cancel(polling[uuid]);
          delete polling[uuid];
        }
      }, function errorCallback(res) {
        console.log(res)
      });
    }, 2500);
  };


  $scope.upload = function (newBook) {
    uniqueIdentifiers[newBook.flow.files[0].uniqueIdentifier] = gridEntityRef[newBook.flow.opts.query.uuid];
    newBook.flow.opts.target=$rootScope.globals.glsUrl+'/chunkBook';
    newBook.flow.opts.headers = {
      token: $http.defaults.headers.common.token,
      appId: $http.defaults.headers.common.appid
    }
    newBook.flow.upload();
    gridEntityRef[newBook.flow.opts.query.uuid].status[newBook.flow.opts.query.role] = "Processing...";
  };

  var refreshProducts = function() {
    ProductService.getProducts()
    .then(function(data) {
      $scope.rawProducts = angular.copy(data);
      _.each(data, function(product) {

        var uuid = rfc4122.v4();

        var row = _.extend(product, {
          uuid : uuid,
          status : {
            student : _.some(product.books, function(book) { if(!book.metadata) return false; return book.metadata.role === 'student' }) ? 'Yes' : false,
            teacher : _.some(product.books, function(book) { if(!book.metadata) return false; return book.metadata.role === 'teacher' }) ? 'Yes' : false,
          }
        });

        gridEntityRef[uuid] = row;

      });
      $scope.products = data;
      $scope.originalProducts = data;
      if($scope.products.length === 0) {
        $scope.emptySchools = 'There are no products yet';
      }
    });
  };

  refreshProducts();

  $scope.$watchGroup(['productName'], function(newValue, oldValue) {
    $scope.products = _.filter($scope.originalProducts, function(product) {
      return product.title.toLowerCase().indexOf(newValue[0].toLowerCase()) >= 0;
    });
  });

  //  Be good to clean this up
  var actionsCell =  '<a class="btn-xs btn btn-primary" ng-click="grid.appScope.editProduct(row.entity.id)">Edit</a>';

  var studentBookCell = '<a ng-show="!row.entity.status.student" class="btn-xs btn btn-primary" ng-click="grid.appScope.addBook(row.entity, \'student\')">Add</a>';
  studentBookCell += '<div class="ui-grid-cell-contents" ng-show="row.entity.status.student && row.entity.status.student != \'Yes\'">{{row.entity.status.student}}</div>';
  studentBookCell += '<a ng-show="row.entity.status.student" class="btn-xs btn btn-danger" ng-click="grid.appScope.removeBook(row.entity, \'student\')">Remove</a>';

  var teacherBookCell = '<a ng-show="!row.entity.status.teacher" class="btn-xs btn btn-primary" ng-click="grid.appScope.addBook(row.entity, \'teacher\')">Add</a>';
  teacherBookCell += '<div class="ui-grid-cell-contents" ng-show="row.entity.status.teacher && row.entity.status.teacher != \'Yes\'">{{row.entity.status.teacher}}</div>';
  teacherBookCell += '<a ng-show="row.entity.status.teacher" class="btn-xs btn btn-danger" ng-click="grid.appScope.removeBook(row.entity, \'teacher\')">Remove</a>';

  $scope.gridOptions = {
    data: 'products',
    paginationPageSizes: [20, 40],
    paginationPageSize: 20,
    columnDefs: [
      { field: 'title', displayName: 'Title', sort: { priority: 0, direction: uiGridConstants.ASC }},
      { field: 'author', displayName: 'Author'},
      { field: 'hasStudentBook', displayName: 'Student Book', cellTemplate: studentBookCell },
      { field: 'hasTeacherBook', displayName: 'Teacher Book', cellTemplate: teacherBookCell },
      { name: 'actions', displayName: ' ', width: 110, cellTemplate: actionsCell, enableColumnMenu: false },
    ]
  };

  $scope.$watch('csv', function(result){
    if(result) {
      if(result.errors.length > 0) {
        var errorMessage = [];
        _.each(result.errors, function(err){
          errorMessage.push('<li>' + err.message + '</li>');
        })
        return $scope.alerts = [{ type: 'danger', msg: '<ul>' + errorMessage + '</ul>' }];
      }

      ProductService.batch(result.data)
      .then(function(data){
        $scope.alerts = [{ type: 'success', msg: data.message }];
        refreshProducts();
      }, function(err){
        $scope.alerts = [{ type: 'danger', msg: err.message }];
      })
    }
  });

  $scope.addProduct = function() {
    var modalInstance = $modal.open({
        templateUrl: 'modules/product/modals/product.crud.html',
        controller: 'AddProductModalCtrl',
        resolve: {
          modalOpts: function () {
            return {
              method: 'add'
            };
          }
        }
      }
    )
    .result
    .then(function(result){
      $scope.alerts = [{ type: 'success', msg: 'Product ' + result.title + ' successfully created' }];
      refreshProducts();
    })
  };

  $scope.addBook = function(entity, role) {
    var modalInstance = $modal.open({
      templateUrl: 'modules/book/modals/book.add.html',
      controller: 'AddBookModalCtrl',
      resolve: {
        modalOpts: function () {
          return {
            newBook: {
              uuid: entity.uuid,
              role: role,
              type: 'epub',
              productId: entity.id,
              allowedPageNavigation: 'horizontal',
              layout: ['portrait_single_page', 'portrait_double_page', 'landscape_single_page', 'landscape_double_page'],
              zip: true
             }
          };
        }
      }
    })
    .result
    .then(function(result){
      $scope.upload(result);
    })
  };

  $scope.editProduct = function(productId) {
    $scope.newProduct = angular.copy(_.find($scope.rawProducts, function(product) {
      return product.id === productId;
    }));

    if ($scope.newProduct.coverImageURL) {
      $scope.newProduct.coverImageURL = $scope.newProduct.coverImageURL.url;
    }

    var modalInstance = $modal.open({
        templateUrl: 'modules/product/modals/product.crud.html',
        controller: 'AddProductModalCtrl',
        scope : $scope,
        resolve: {
          modalOpts: function () {
            return {
              method: 'edit'
            };
          }
        }
      }
    )
    .result
    .then(function(result){
      $scope.alerts = [{ type: 'success', msg: 'Product ' + result.title + ' successfully updated' }];
      refreshProducts();
    })
  };

  $scope.removeBook = function(entity, role) {

    $scope.book = _.find(entity.books, function(book){
      return book.metadata.role === role;
    });

    $modal.open({
      templateUrl: 'modules/book/modals/book.remove.html',
      controller: 'RemoveBookModalCtrl',
      scope: $scope
    })
    .result
    .then(function(result){
      refreshProducts();
      $scope.alerts = [{ type: 'success', msg: result.message }];
    });
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };
});
