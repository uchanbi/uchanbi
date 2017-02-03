"use strict";

var modules = [
  'app.login',
  'app.logout',
  'app.navigation',
  'app.pearsonDashboard',
  'app.schoolDashboard',
  'app.user',
  'app.admin',
  'app.product',
  'app.license',
  'app.cookieConsent',
  'app.courseSection',
  'app.school',
  'app.book',
  'app.common.filters',
  'app.common.services',
  'app.csvUpload',
  'app.sse',
  'ngSanitize',
  'ngStorage',
  'ui.router',
  'ui.bootstrap',
  'ui.select',
  'ui.date',
  'ui.bootstrap.showErrors',
  'ui.grid',
  'ui.grid.edit',
  'ui.grid.pagination',
  'angular-loading-bar',
  'ngFileUpload',
  'uuid',
  'flow'
];

var app = angular.module('app', modules)
.config(function ($stateProvider, $urlRouterProvider, $httpProvider, uiSelectConfig, flowFactoryProvider) {

  $httpProvider.interceptors.push('httpInterceptor');

  uiSelectConfig.theme = 'bootstrap';

  $urlRouterProvider.otherwise('/');

  flowFactoryProvider.defaults = {
    target: '/',
    singleFile: true,
    fileParameterName: 'file',
    maxChunkRetries: 1,
    chunkRetryInterval: 5000,
    simultaneousUploads: 4,
    //allowDuplicateUploads: true,
    generateUniqueIdentifier: function(file){
      var s = [];
      var hexDigits = "0123456789abcdef";
      for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";
      return s.join("");
    },
    query:{}
  };
  flowFactoryProvider.on('catchAll', function (event, e, f) {
    if(event === 'fileProgress') {
      window.angular.element('body').scope().$emit('fileProgress', { uniqueIdentifier: f.fileObj.uniqueIdentifier, role: f.fileObj.flowObj.opts.query.role, progress: Math.round(e.sizeUploaded() / f.fileObjSize * 100) });
    }
    if(event === 'fileSuccess') {
      window.angular.element('body').scope().$emit('fileComplete', { uniqueIdentifier: e.uniqueIdentifier });
    }
  });

  $stateProvider
  .state('main', {
    abstract: true,
    templateUrl: 'views/root.html'
  })
  .state('main.schoolAdmin', {
    abstract: true,
    templateUrl: 'views/layout.html',
    resolve: {
      LoginService: 'LoginService',
      config: function(LoginService) {
        return LoginService.getSchoolAdmin();
      }
    }
  })
  .state('main.pearsonAdmin', {
    abstract: true,
    templateUrl: 'views/layout.html',
    resolve: {
      LoginService: 'LoginService',
      config: function(LoginService) {
        return LoginService.getPearsonAdmin();
      }
    }
  })
  .state('main.roleRedirect', {
    url: '/',
    templateUrl: 'views/root.html',
    resolve: {
      user: function ($state, LoginService) {
        return LoginService.getCurrentUser().then(function(user) {
          if (user.role === 'pearson-admin') {
            $state.go('main.pearsonAdmin.dashboard');
          } else {
            $state.go('main.schoolAdmin.dashboard');
          }
          return user;
        });
      }
    }
  })
  .state('main.schoolAdmin.dashboard', {
    url: '/school-admin',
    templateUrl: 'modules/school-dashboard/dashboard.index.html',
    controller: 'SchoolDashboardCtrl'
  })
  .state('main.schoolAdmin.courseSectionDetail', {
    url: '/school-admin/course-section/:CourseSectionId',
    templateUrl: 'modules/courseSection/courseSection.view.html',
    controller: 'CourseSectionCtrl'
  })
  .state('main.schoolAdmin.user', {
    url: '/school-admin/user',
    templateUrl: 'modules/user/user.list.html',
    controller: 'UserListCtrl'
  })
  .state('main.pearsonAdmin.dashboard', {
    url: '/pearson-admin',
    templateUrl: 'modules/pearson-dashboard/dashboard.index.html',
    controller: 'PearsonDashboardCtrl'
  })
  .state('main.pearsonAdmin.schoolDetail', {
    url: '/pearson-admin/school/:SchoolId',
    templateUrl: 'modules/school/school.view.html',
    controller: 'SchoolCtrl'
  })
  .state('main.pearsonAdmin.product', {
    url: '/pearson-admin/product',
    templateUrl: 'modules/product/product.list.html',
    controller: 'ProductListCtrl'
  })
  .state('main.pearsonAdmin.admin', {
    url: '/pearson-admin/admin',
    templateUrl: 'modules/admin/admin.index.html',
    controller: 'AdminIndexCtrl'
  })
  .state('login', {
    url: '/login',
    templateUrl: 'modules/login/login.index.html',
    controller: 'LoginCtrl'
  })
  .state('logout', {
    url: '/logout',
    templateUrl: 'modules/logout/logout.index.html',
    controller: 'LogoutCtrl'
  });


});

app.run(function($rootScope, $localStorage, $http, $state, $window) {
  $rootScope.globals = {
    glsUrl : '/api',
    errors : {}
  };

  $http.defaults.headers.common.Accept = 'application/vnd.gls.pearson.v2+json';
  $http.defaults.headers.common.appid = $window.glsConfig.appId;

  //for when we are not given consent
  $rootScope.localStorage = {};

  $rootScope.$on('$stateChangeError', function() {
    $state.go('login');
  });
});
