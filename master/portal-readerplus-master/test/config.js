"use strint"

exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',

  framework: 'cucumber',

  // Spec patterns are relative to this directory.
  specs: [
    'features/*.feature'
  ],

  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      // Get rid of --ignore-certificate yellow warning
      // Set download path and avoid prompting for download even though
      // this is already the default on Chrome but for completeness
      args: ['--disable-cache'],
      prefs: {
        'download': {
          'prompt_for_download': false,
          'default_directory': '/tmp'
        }
      }
    }
  },

  baseUrl : 'http://localhost:3000',

  cucumberOpts: {
    require: 'features/step_definitions/**/*.js',
    format: 'pretty'
  },

  allScriptsTimeout: 40000,

  onPrepare: function() {
    browser.manage().window().setSize(1200, 1000);

    // Disable animations so e2e tests run more quickly
    var disableNgAnimate = function() {
      angular.module('disableNgAnimate', []).run(['$animate', function($animate) {
        $animate.enabled(false);
      }]);
    };

    browser.addMockModule('disableNgAnimate', disableNgAnimate);
  }
};
