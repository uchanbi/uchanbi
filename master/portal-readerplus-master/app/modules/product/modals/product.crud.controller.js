'use strict';

angular.module('app.product')
.controller('AddProductModalCtrl', function ($scope, $rootScope, modalOpts, ProductService, $modalInstance, Upload, ModalErrorHandler) {

  $scope.alerts = [];
  $scope.navData = {};
  $scope.studentEncryptEpub = true;
  $scope.teacherEncryptEpub = true;

  $scope.$watch('files', function () {
    $scope.upload($scope.files);
  });

  $scope.upload = function (files, userType) {
    if(!files || !files.length) return;

    $scope[userType + 'Status'] = 'uploading';
    Upload.upload({
      url: $rootScope.globals.glsUrl + '/epub',
      file: files[0],
      fields : {
        zip : $scope[userType + 'EncryptEpub']
      },
      fileFormDataName : 'book'
    }).success(function (data, status, headers, config) {
      $scope[userType + 'Status'] = 'uploaded';

      if(userType === 'student') {
        $scope.newProduct.epubURL = data.url;
        $scope.newProduct.coverImageURL = data.coverImageUrl;
        $scope.newProduct.encpwd = data.encpwd;
      } else {
        $scope.newProduct.teacherVersion = true;
        $scope.newProduct.teacherEpubURL = data.url;
      }
    }).error(function() {
        $scope[userType + 'Status'] = 'failed';
    });
  };

  $scope.modalOpts = modalOpts;
  if (!$scope.newProduct) {
    $scope.newProduct = {};
  }

  $scope.navigationOptions = [
    {name : 'Horizontal', code : 'horizontal'},
    {name : 'Vertical', code : 'vertical'}
  ];

  $scope.layoutOptions = [
    {name : 'Portrait single page', code : 'portrait_single_page'},
    {name : 'Portrait double page', code : 'portrait_double_page'},
    {name : 'Landscape single page', code : 'landscape_single_page'},
    {name : 'Landscape double page', code : 'landscape_double_page'},
  ];

  _.each($scope.navigationOptions, function(nav) {
    if (nav.code === $scope.newProduct.allowedPageNavigation) $scope.navData.selectedNav = nav.name;
  });

  $scope.layoutOptions = _.map($scope.layoutOptions, function(layout) {
    if (_.contains($scope.newProduct.layout, layout.code)) layout.selected = true;
    return layout;
  });

  var prepProduct = function() {
    var selectionFunction = function(item) {
      return item.selected;
    };

    var selectedLayout = _.filter($scope.layoutOptions, selectionFunction);

    if ($scope.navData.selectedNav) {
      $scope.newProduct.allowedPageNavigation = $scope.navData.selectedNav.toLowerCase();
    }

    if (selectedLayout) {
      $scope.newProduct.layout = _.pluck(selectedLayout, 'code');
    }
  };


  $scope.save = function () {
    prepProduct();

    ProductService.addProduct($scope.newProduct)
    .then(function(data){
      $modalInstance.close(data);
    }, function(err){
      ModalErrorHandler.handleError(err, $scope, $modalInstance);
    });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss();
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.update = function () {
    prepProduct();
    ProductService.updateProduct($scope.newProduct.id, _.omit($scope.newProduct, 'id'))
    .then(function(data){
      $modalInstance.close(data);
    }, function(err){
       ModalErrorHandler.handleError(err, $scope, $modalInstance);

    });
  };

  $scope.remove = function (book) {
    book.showConfirm = true;
  };

});
