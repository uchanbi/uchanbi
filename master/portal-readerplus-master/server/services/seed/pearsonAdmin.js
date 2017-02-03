var request = require('request');
var async = require('async');
var _ = require('lodash');

var GLS = require('../gls');

var productData = require('../../../test/data/e2e/products');

var PearsonAdmin = (function() {

  var self = this;

  return {
    seed: seed
  }

  function seed(opts, callback) {

    self.schoolId = opts.schoolId;
    self.headers = opts.headers;
    self.glsUrl = opts.glsUrl;
    self.licenses = [];

    async.series([function(callback) {
        auth(callback);
      }, function(callback) {
        reset(callback);
      }, function(callback) {
        populate(callback);
      }
    ], function(err) {
      callback(err);
    });
  }

  function auth(callback) {

    console.log('begining pearson admin auth');

    var options = {
      url: this.glsUrl + '/authenticate',
      headers: this.headers,
      json: {
        username: 'test_pearson_admin@pearson.com',
        password: 'zdDoERwU1h7I'
      }
    };

    //  Authenticate pearson admin
    request.post(options, function(err, response, body) {
      if (body && body.error) return callback(body.error);
      self.headers.token = body.token;
      callback(null);
    });
  }

  function reset(callback) {

    console.log('begining pearson admin reset');

    async.series([function(callback) {
        cleanProducts(callback);
      },
      function(callback) {
        cleanSchools(callback)
      }
    ], function(err) {
      callback(err);
    });
  };

  function populate(callback) {

    console.log('begining pearson admin populate');

    async.series(
    [
      function(callback) {
        populateProducts(callback);
      }
    ], function(err) {
      callback(err);
    });
  };

  function cleanProducts(callback) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/product'
    };

    request.get(options, function(err, response, body) {
      if (body.error) return callback(body.error);

      async.eachSeries(JSON.parse(body), function(product, callback) {
        if (!product) return callback(new Error('Empty product'));

        var options = {
          headers: self.headers,
          url: self.glsUrl + '/product/' + product.id
        };

        request.del(options, function(err, response, body) {
          if (body.error) return callback(body.message);
          callback(null);
        });
      }, function(err) {
        callback(err);
      });
    });
  }

  function cleanSchools(callback) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/school'
    };

    request.get(options, function(err, response, body) {
      if (body.error) return callback(body.error);

      var testGeneratedSchool = _.filter(JSON.parse(body), function(school) {
        return school.name.indexOf('A test school') > -1;
      });

      //  Remove test schools
      async.eachSeries(testGeneratedSchool, function(school, callback) {
        if (!school) return callback(new Error('Empty school'));
        var options = {
          headers: self.headers,
          url: self.glsUrl + '/school/' + school.id
        };

        request.del(options, function(err, response, body) {
          if (body.error) return callback(body.message);
          callback(null);
        });
      }, function(err) {
        //callback(err);
      });

      //  Remove assigned admins from Broadfields Primary School
      options.url = self.glsUrl + '/school/' + 'xxxxxxxxxxxxxxxxx' + '/admin'
      request.get(options, function(err, response, body) {
        if (body.error) return callback(body.message);
        var admins = JSON.parse(body);
        if(admins.length === 0) return callback();

        async.eachSeries(admins, function(admin, callback){

          var options = {
            headers: self.headers,
            url: self.glsUrl + '/enrollment/school/' + 'xxxxxxxxxxxxxxxxx' + '/admin',
            json: {
              remove: admin.id
            }
          };

          request.patch(options, function(err, response, body) {
            if (body.error) return callback(body.message);
            callback(null);
          });
        }, function(err){
          if(err) callback(err);
          callback();
        })
      });

    });
  }

  //  Create Product and license to a school
  function populateProducts(callback) {

    async.eachSeries(productData, function(product, callback) {

      product.layout = product.layout ? product.layout.split(','): '';

      var options = {
        headers: self.headers,
        url: self.glsUrl + '/product',
        json: product
      };

      request.post(options, function(err, response, body) {
        if (body.error) return callback(body.message);

        var productId = body.id;

        var options = {
          headers: self.headers,
          url: self.glsUrl + '/license',
          json: {
            product: productId,
            school: self.schoolId,
            seats: 50,
            start: '2013-01-13T01:14:13+00:00',
            end: '2015-11-13T01:14:13+00:00'
          }
        };

        request.post(options, function(err, response, body) {
          if (body.error) return callback(body.message);
          self.licenses.push(body.id);
          callback(null);
        });
      });
    }, function(err) {
      callback(err);
    });
  };

})();

module.exports = PearsonAdmin;
