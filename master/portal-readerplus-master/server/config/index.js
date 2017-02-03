var nconf = require('nconf')
  , _ = require('underscore');

function Config(){
  nconf.argv().env('_');
  nconf.use('memory');

  paths = {
    test : 'config/test.json',
    development : 'config/development.json',
    jenkins : 'config/jenkins.json'
  };

  var environment = nconf.get('NODE:ENV') || 'development';
  nconf.file(environment, nconf.get('NODE:CONFIG:FILE') || paths[environment]);

  nconf.file('default',  'config/default.json');
}

Config.prototype.get = function(key) {
  return nconf.get(key);
};

Config.prototype.getEnv = function() {
  return nconf.get('NODE:ENV') || 'development';
};

module.exports = new Config();