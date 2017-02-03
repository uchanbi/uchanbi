var request = require('request');
var async = require('async');
var _ = require('lodash');
var GLS = require('../gls');

var schoolAdmin = require('./schoolAdmin');
var pearsonAdmin = require('./pearsonAdmin');
var qaSeed = require('./qaSeed');

var schoolData = require('../../../test/data/e2e/schools');
var apiKeyData = require('../../../test/data/e2e/apiKeys');

var Seed = (function(environment, callback) {

  var opts = {
    headers: {
      Accept: 'application/vnd.gls.pearson.v2+json'
    }
  };

  switch(environment) {
    case 'e2e':
      seedE2E(opts, callback);
      break;
    case 'qa':
      seedQA(opts, callback);
      break;
  }

});

function seedQA(opts, callback){

  // UNCOMMENT TO USE

  // opts.glsUrl = 'http://api-qa.gls.pearson-intl.com';
  // opts.headers.appid = '54b91c74d320966f86ac8c7f';

  // qaSeed.seed(opts, callback);
}

function seedE2E(opts, callback){

  var mongoose = require('mongoose')
  var config = require('../../config');
  mongoose.connect(config.get('mongo:url'), config.get('mongo:options'));

  var AppGroupModel = mongoose.model('AppGroup', new mongoose.Schema({
    name          : { type : String, required : true, index : { unique : true } },
    description   : { type : String },
    apps          : [{ type : mongoose.Schema.ObjectId, ref : 'App' }]
  }));

  var AppModel = mongoose.model('App', new mongoose.Schema({
    name            : { type : String, required : true, index : { unique : true } },
    platform        : { type : String, required : true },
    enabled         : { type : Boolean, required : true },
    authentication  : { type: String, required : true, enum: ['bugclub', 'saltare']},
    appGroup        : { type : mongoose.Schema.ObjectId, ref : 'AppGroup', required : true }
  }));

  var SchoolModel = mongoose.model('School', new mongoose.Schema({
    name            : { type : String, required : true, index : { unique : true } },
    organizationId  : { type : String },
    countryCode  : { type : String }
  }));

  var ApiKeyModel = mongoose.model('ApiKey', new mongoose.Schema({
    key           : { type : String, required : true },
    secret        : { type : String, required : true },
    algorithm     : { type : String, required : true },
    appId         : { type : mongoose.Schema.ObjectId, ref : 'App', required : true },
  }));

  var appGroup = new AppGroupModel({
    _id: '56fe7003ddd439fc27ed91bd',
    name: 'App Group',
    apps: ['5487201fbab5214b54f3ecc1']
  });

  var app = new AppModel({
    _id: '5487201fbab5214b54f3ecc1',
    name: 'E-2-E App',
    platform: 'Android',
    authentication: 'saltare',
    enabled: true,
    appGroup: '56fe7003ddd439fc27ed91bd'
  });

  var Redis = require('redis');
  var redis = Redis.createClient(config.get('redis:port'), config.get('redis:host'));

  opts.headers.appid = app.id;
  opts.glsUrl = config.get('GLS:uri');

  async.waterfall([
    // Drop database
    function(callback) {
      mongoose.connection.once('open', function () {
        mongoose.connection.db.dropDatabase(function(err) {
          callback(err)
        });
      });
    },
    //  Create Test App Group
    function(callback) {
      appGroup.save(function(err, appGroup){
        console.log(err)
        //  Save it to redis
        callback(err);
      });
    },
    //  Create Test App
    function(callback) {
      app.save(function(err, app){
        //  Save it to redis
        redis.select(config.get('redis:db'), function() {
          redis.set('app:' + app.id, JSON.stringify(app), function (err, res) {
            callback(err);
          });
        });
      });
    },
    //  Create api keys
    function(callback) {
      async.map(apiKeyData, function(apiKey, callback) {
        apiKey = new ApiKeyModel(apiKey);
        apiKey.save(function(err, apiKey){
          callback(err, apiKey);
        });
      }, function(err, schools){
        callback(err)
      });
    },
    //  Create schools
    function(callback) {
      async.map(schoolData, function(school, callback) {
        school = new SchoolModel(school);
        school.save(function(err, school){
          callback(err, school);
        });
      }, function(err, schools){
        opts.schoolId = schools[0].id;
        opts.schoolId2 = schools[1].id;
        callback(err)
      });
    },
    //  Auth
    function(callback) {
      GLS.auth(opts, { username: 'glos_admin', password: 'uCkQ8qES' }, callback);
    },
    // Do school admin seed
    function(token, callback) {
      opts.headers.token = token;
      schoolAdmin.seed(opts, callback);
    },
    // Do pearson admin seed
    function(callback) {
      pearsonAdmin.seed(opts, callback);
    },
    // Do provisioning
    function(callback) {
      schoolAdmin.provision(callback);
    }],
  function(err, results) {
    callback(err);
  });

}

module.exports = Seed;