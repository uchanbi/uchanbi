var request = require('request');
var async = require('async');
var _ = require('lodash');

var schoolAdmin = require('./schoolAdmin');


  var opts = {
    glsUrl: 'http://api-stg.gls.pearson-intl.com',
    headers: {
      'Accept': 'application/vnd.gls.pearson.v2+json',
      'appid': '54b91ea1cb11ffb47a257ecc'
    },
    schoolId: '54be411c19b7aea389911727'
  }

  schoolAdmin.seedTestUsers(opts, function() {
    console.log('done');
  });

