
var request = require('request');
var async = require('async');
var _ = require('lodash');

var productData = require('../../../test/data/QA/products');
var studentData = require('../../../test/data/QA/students');
var teacherData = require('../../../test/data/QA/teachers');
var adminData = require('../../../test/data/QA/admins');
var courseSectionData = require('../../../test/data/QA/courseSections');

var GLS = require('../gls');

var QASeed = (function() {

  var self = this;

  var students = [];

  return {
    seed: seed
  }

  function seed(opts, callback) {

    //self.schoolId = opts.schoolId;
    self.headers = opts.headers;
    self.glsUrl = opts.glsUrl;
    self.licenses = [];

    async.series([function(callback) {
        upsertSchool(callback);
      }, function(callback) {
        upsertUsers(callback);
      }, function(callback) {
        auth(callback);
      }, function(callback) {
        cleanCourseSections(callback);
      }, function(callback) {
        populateCourseSections(callback);
      }, function(callback) {
        cleanProducts(callback);
      }, function(callback) {
        createProducts(callback);
      }, function(callback) {
        enrollStudentsCourseSections(callback);
      }, function(callback) {
        enrollTeachersCourseSections(callback);
      }, function(callback) {
        provisionCourseSections(callback);
      }
    ], function(err) {
      callback(err);
    });
  }

  function auth(callback) {

    console.log('begining auth');

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
      if (body && body.error) return callback(body.message);
      self.headers.token = body.token;
      callback(null);
    });
  }

  function upsertSchool(callback) {

    console.log('begining upsert school');

    //  Needs to be refacter to actually upsert
    self.schoolId = '54c6a072397423b7c6920910';

    callback(null);
  };

  function upsertUsers(callback) {

    console.log('begining upsert users');

    async.series(
    [
      function(callback) {
        upsertStudents(callback);
      },
      function(callback) {
        upsertTeachers(callback);
      },
      function(callback) {
        upsertAdmins(callback);
      }
    ], function(err) {
      callback(err);
    });
  };


  function upsertStudents(callback) {

    async.each(studentData, function(student, callback) {

      GLS.auth(self, student, function(err, token){
        if(err) return callback(err);

        self.headers.token = token;

        GLS.getUserByEmail(self, student.username, function(err, student){
          if(err) return callback(err);

          GLS.enrollInSchool(self, student.id, 'student', function(err){
            //  Ingore conflicts
            if(err && body.statusCode !== 409) return callback(err)

            callback(null);
          });
        });
      });
    }, function(err) {
      callback(err);
    });
  };

  function upsertTeachers(callback) {

    async.each(teacherData, function(teacher, callback) {

      GLS.auth(self, teacher, function(err, token){
        if(err) return callback(err);
        //  Should check here to see Saltare is returning the user, otherwise create

        self.headers.token = token;

        GLS.getUserByEmail(self, teacher.username, function(err, teacher){
          if(err) return callback(err);

          GLS.enrollInSchool(self, teacher.id, 'teacher', function(err){
            //  Ingore conflicts
            if(err && body.statusCode !== 409) return callback(err)
            callback(null);
          });
        });
      });
    }, function(err) {
      callback(err);
    });
  };

  function upsertAdmins(callback) {

    async.each(adminData, function(admin, callback) {

      GLS.auth(self, admin, function(err, token){
        //  Should check here to see Saltare is returning the user, otherwise create
        if(err) return callback(err);

        self.headers.token = token;

        GLS.getUserByEmail(self, admin.username, function(err, admin){
          if(err) return callback(err);

          GLS.enrollInSchool(self, admin.id, 'admin', function(err){
            //  Ingore conflicts
            if(err && body.statusCode !== 409) return callback(err)
            callback(null);
          });
        });
      });
    }, function(err) {
      callback(err);
    });
  };

  function cleanProducts(callback) {

    console.log('clean products');

    GLS.getProducts(self, function(err, products){

      async.each(products, function(product, callback) {
        if (!product) return callback(new Error('Empty product'));

        GLS.deleteProduct(self, product.id, function(err){
          if(err) return callback(err);
          callback(null);
        })
      }, function(err) {
        callback(err);
      });
    });
  }

  //  Create Product and license to a school
  function createProducts(callback) {

    console.log('create products');

    async.each(productData, function(product, callback) {

      product.layout = product.layout ? product.layout.split(','): '';

      GLS.createProduct(self, product, function(err, product){

        var options = {
          headers: self.headers,
          url: self.glsUrl + '/license',
          json: {
            product: product.id,
            school: self.schoolId,
            seats: 500,
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


  function cleanCourseSections(callback) {

    console.log('clean course sections');

    GLS.school.getCourseSections(self, function(err, courseSections){

      async.each(courseSections, function(courseSection, callback) {
        if(err) return callback(err);

        GLS.deleteCourseSection(self, courseSection.id, function(err){
          if(err) return callback(err);
          callback(null);
        })

      }, function(err) {
        callback(err);
      });
    });
  };

  function populateCourseSections(callback) {

    console.log('populate course sections');

    async.each(courseSectionData, function(courseSection, callback) {

      var options = {
        headers: self.headers,
        url: self.glsUrl + '/coursesection',
        json: courseSection
      };

      request.post(options, function(err, response, body) {
        if (body.error) return callback(body.message);

        var courseSectionId = body.id;

        var options = {
          headers: self.headers,
          url: self.glsUrl + '/school/' + self.schoolId + '/coursesection',
          json: {
            add: courseSectionId
          }
        };

        request.patch(options, function(err, response, body) {
          if (body.error) return callback(body.message);
          callback(null);
        });
      });
    }, function(err) {
      callback(err);
    });
  };


  function enrollStudentsCourseSections(callback) {

    console.log('Enroll students in courses');

    var courseEnrollments = [{
        name: 'UAT-Batch1-2015',
        users: ['Learner1','Learner2','Learner3','Learner4','Learner5','Learner6','Learner7','Learner8']
      },{
        name: 'UAT-Batch2-2015',
        users: ['Learner1','Learner2','Learner9','Learner10','Learner11','Learner12','Learner13','Learner14','Learner15']
      }];

    GLS.school.getCourseSections(self, function(err, courseSections){
      GLS.school.getStudents(self, function(err, students){
        async.each(courseEnrollments, function(courseEnrollment, callback){
          enrollIntoCourse(courseEnrollment, courseSections, students, 'student', callback)
        }, function(err){
          callback(err);
        });

      });
    });
  };

  function enrollTeachersCourseSections(callback) {

    console.log('Enroll teachers in courses');

    var courseEnrollments = [{
        name: 'UAT-Batch1-2015',
        users: ['Teacher1']
      },{
        name: 'UAT-Batch2-2015',
        users: ['Teacher1']
      }];

    GLS.school.getCourseSections(self, function(err, courseSections){
      GLS.getSchoolTeachers(self, function(err, teachers){
        async.each(courseEnrollments, function(courseEnrollment, callback){
          enrollIntoCourse(courseEnrollment, courseSections, teachers, 'teacher', callback)
        }, function(err){
          callback(err);
        });

      });
    });
  };

  function enrollIntoCourse(courseEnrollment, courseSections, users, role, callback){

    var courseSection = _.findWhere(courseSections, { name : courseEnrollment.name });

    var users = _.filter(users, function(user){
      return _.indexOf(courseEnrollment.users, user.firstName) > -1;
    });

    async.each(users, function(user, callback){

      //  Enroll user into course sections
      var options = {
        headers: self.headers,
        url: self.glsUrl + '/enrollment/coursesection/' + courseSection.id + '/' + role,
        json: {
          add: user.id
        }
      };

      request.patch(options, function(err, response, body) {
        if (body.error) return callback(body.message);
        callback(null);
      });

    }, function(err){
      callback(err);
    });
  };




  function provisionCourseSections(callback) {

    console.log('Provision books to course sections');

    var courseProvisions = [{
        name: 'UAT-Batch1-2015',
        products: ['Navigating Information Literacy',
                    'Focus: Life Sciences',
                    'Focus: Life Sciences(Lightbox)',
                    'Life Skills',
                    'Geografie',
                    'Platinum Natural Sciences and Technology',
                    'Platinum Mathematics Grade 6']
      },{
        name: 'UAT-Batch2-2015',
        products: ['Life Skills',
                    'Geografie',
                    'Platinum Natural Sciences and Technology',
                    'Platinum Mathematics Grade 6',
                    'Pearson Platinum Mathematics Grade 7',
                    'Pearson Platinum Natural Sciences Grade 7',
                    'Life Orientation']
      }];

    GLS.school.getCourseSections(self, function(err, courseSections){
      GLS.school.getProducts(self, function(err, products){
        GLS.school.getLicenses(self, function(err, licenses){
          async.each(courseProvisions, function(courseProvision, callback){
            getProductsLicense(courseProvision, courseSections, products, licenses, callback)
          }, function(err){
            callback(err);
          });
        });
      });
    });
  };

  function getProductsLicense(courseEnrollment, courseSections, products, licenses, callback) {

    var courseSection = _.findWhere(courseSections, { name : courseEnrollment.name });

    var filteredProducts = _.filter(products, function(product){
      return _.indexOf(courseEnrollment.products, product.title.replace(/\u200B/g,'')) > -1;
    });

    async.each(filteredProducts, function(product, callback){

      var license = _.find(licenses, function(license){
        return license.product.id === product.id;
      });

      licenseProductToCourseSection(license, courseSection, callback);

    }, function(err){
      callback(err)
    });
  }

  function licenseProductToCourseSection(license, courseSection, callback) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/license/' + license.id + '/provision/coursesection',
      json: {
        add: courseSection.id
      }
    };
    request.patch(options, function(err, response, body) {
      if (body.error) return callback(body.message);
      callback(null);
    });
  }

})();

module.exports = QASeed;