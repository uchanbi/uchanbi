'use strict';

angular.module('app.book')
.controller('AddBookModalCtrl', function ($scope, $window, $rootScope, modalOpts, BookService, $modalInstance, Upload, ModalErrorHandler, flowFactory) {

  $scope.tabActivity=[true,false];
  $scope.book ={};

  $scope.alerts = [];
  $scope.navData = {};
  $scope.studentEncryptEpub = true;
  $scope.teacherEncryptEpub = true;

  _.merge($scope, modalOpts);

  $scope.navigationOptions = [
    { name : 'Horizontal', code : 'horizontal'},
    { name : 'Vertical', code : 'vertical'}
  ];

  $scope.layoutOptions = [
    { name : 'Portrait single page', code : 'portrait_single_page', selected : false },
    { name : 'Portrait double page', code : 'portrait_double_page', selected : false },
    { name : 'Landscape single page', code : 'landscape_single_page', selected : false },
    { name : 'Landscape double page', code : 'landscape_double_page', selected : false },
  ];

  $scope.layoutOptions = _.map($scope.layoutOptions, function(layout) {
    if (_.contains($scope.newBook.layout, layout.code)) layout.selected = true;
    return layout;
  });

  var prepBook = function() {

    var activeTab = $scope.tabActivity[0] ? 'epub' : 'pdf';
    $scope.newBook.type = activeTab;

    var selectedLayout = _.filter($scope.layoutOptions, function(item) {
      return item.selected;
    });
    $scope.newBook.layout = _.pluck(selectedLayout, 'code');

    if(!$scope.book.flow.files[0] || !$scope.book.flow.files[0].size > 0) {
      $scope.alerts = [{ type: 'danger', msg: 'Please select a valid book'}];
      return false;
    }


    if(!$scope.newBook.bookCover || !$scope.newBook.bookCover.size > 0) {
      $scope.alerts = [{ type: 'danger', msg: 'Please select a cover image'}];
      return false;
    }
    //To pass other multipart fields
    $scope.book.flow.opts.query = $scope.newBook;

    return true;
  };

  $scope.setFilename = function(file) {
    $scope.selectedFiles = {
      bookCover: file
    }
  }


  $scope.save = function () {
    if(prepBook())$modalInstance.close($scope.book);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss();
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

});
