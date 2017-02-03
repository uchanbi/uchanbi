var request = require('request');
var async = require('async');
var _ = require('lodash');


var GLS = (function() {

  var me = this;


  return {
    auth: auth,
    createSchool: createSchool,
    getUserByEmail: getUserByEmail,
    enrollInSchool: enrollInSchool,
    enrollInSecondSchool: enrollInSecondSchool,
    getStudents: getStudents,
    getCourseSections: getCourseSections,
    getSchoolTeachers: getSchoolTeachers,
    getProducts: getProducts,
    getLicenses: getLicenses,
    createProduct: createProduct,
    createCourseSection: createCourseSection,
    deleteProduct: deleteProduct,
    deleteCourseSection: deleteCourseSection,
    school: {
      getStudents: function(a, b){
        getStudents(a, b, true)
      },
      getLicenses: function(a, b){
        getLicenses(a, b, true)
      },
      getProducts: function(a, b){
        getProducts(a, b, true)
      },
      getCourseSections: function(a, b){
        getCourseSections(a, b, true)
      }
    }
  }

  function auth(self, user, callback) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/authenticate',
      json: _.pick(user, 'username', 'password')
    };

    request.post(options, function(err, response, body) {
      if(err) return callback(err);

      callback(null, body.token);
    });
  };

  function createSchool(self, school, callback) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/school',
      json: school
    };

    request.post(options, function(err, response, school) {
      if (school.error) return callback(school.message);
      callback(null, school)
    });
  };

  function getUserByEmail(self, email, callback) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/user/all?email=' + email
    };

    request.get(options, function(err, response, body) {
      if(err) return callback(err)

      callback(null, JSON.parse(body)[0]);
    });
  };

  function enrollInSchool(self, userId, role, callback) {
    //  Enroll
    var options = {
      headers: self.headers,
      url: self.glsUrl + '/enrollment/school/' + self.schoolId + '/' + role,
      json: {
        add: userId
      }
    };

    request.patch(options, function(err, response, body) {
      if(err) return callback(err)

      callback(null);
    });
  };

  function enrollInSecondSchool(self, userId, role, callback) {
    //  Enroll
    var options = {
      headers: self.headers,
      url: self.glsUrl + '/enrollment/school/' + self.schoolId2 + '/' + role,
      json: {
        add: userId
      }
    };

    request.patch(options, function(err, response, body) {
      if(err) return callback(err)

      callback(null);
    });
  };

  function getStudents(self, callback, forSchool) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/student'
    };

    if(forSchool) options.url = self.glsUrl + '/school/' + self.schoolId + '/student'

    request.get(options, function(err, response, body) {
      if(err) return callback(JSON.parse(err));
      callback(null, JSON.parse(body));
    });
  }

  function getSchoolTeachers(self, callback) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/school/' + self.schoolId + '/teacher'
    };

    request.get(options, function(err, response, body) {
      if(err) return callback(JSON.parse(err));
      callback(null, JSON.parse(body));
    });
  }

  function getCourseSections(self, callback, forSchool) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/coursesection'
    };

    if(forSchool) options.url = self.glsUrl + '/school/' + self.schoolId + '/coursesection'

    //  Get course sections
    request.get(options, function(err, response, body) {
      if(err) return callback(JSON.parse(err));
      callback(null, JSON.parse(body));
    });
  }

  function getProducts(self, callback, forSchool) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/product'
    };

    if(forSchool) options.url = self.glsUrl + '/school/' + self.schoolId + '/product'

    //  Get course sections
    request.get(options, function(err, response, body) {
      if(err) return callback(JSON.parse(err));
      callback(null, JSON.parse(body));
    });
  }

  function getLicenses(self, callback, forSchool) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/license'
    };

    if(forSchool) options.url = self.glsUrl + '/school/' + self.schoolId + '/license'

    //  Get licences
    request.get(options, function(err, response, body) {
      if(err) return callback(JSON.parse(err));
      callback(null, JSON.parse(body));
    });
  };

  function createProduct(self, product, callback) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/product',
      json: product
    };

    request.post(options, function(err, response, body) {
      if (body.error) return callback(body.message);
      callback(null, body)
    });
  };

  function createCourseSection(self, courseSection, callback) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/coursesection',
      json: courseSection
    };

    request.post(options, function(err, response, body) {
      if (body.error) return callback(body.message);
      callback(null, body)
    });
  };

  function deleteProduct(self, productId, callback) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/product/' + productId
    };

    request.del(options, function(err, response, body) {
      if (body.error) return callback(body.message);
      callback(null);
    });
  };

  function deleteCourseSection(self, courseSectionId, callback) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/coursesection/' + courseSectionId
    };

    request.del(options, function(err, response, body) {
      if (body.error) return callback(body.message);
      callback(null);
    });
  };

})();

module.exports = GLS;