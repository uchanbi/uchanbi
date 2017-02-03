var request = require('request');
var async = require('async');
var _ = require('lodash');

var GLS = require('../gls');

var courseSectionData = require('../../../test/data/e2e/courseSections');
var studentData = require('../../../test/data/e2e/students');
var teacherData = require('../../../test/data/e2e/teachers');
var adminData = require('../../../test/data/e2e/admins');

var SchoolAdmin = (function() {

  var self = this;

  return {
    seed: seed,
    provision: provision
  }

  function seed(opts, callback) {

    self.headers = opts.headers;
    self.glsUrl = opts.glsUrl;
    self.schoolId = opts.schoolId;
    self.schoolId2 = opts.schoolId2;

    async.series([
      function(callback) {
        reset(callback);
      }, function(callback) {
        populate(callback);
      }, function(callback) {
        enroll(callback);
      }
    ], function(err) {
      callback(err);
    });
  }

  function reset(callback) {

    console.log('begining reset');

    async.series([function(callback) {
        cleanCourseSections(callback);
      }
      , function(callback) {
        cleanStudents(callback);
      }, function(callback) {
        cleanTeachers(callback);
      }
    ], function(err) {
      callback(err);
    });
  };

  function populate(callback) {

    console.log('begining populate');

    async.series(
    [
      function(callback) {
        populateCourseSections(callback);
      },
      function(callback) {
        populateStudents(callback);
      },
      function(callback) {
        populateTeachers(callback);
      }
    ], function(err) {
      callback(err);
    });
  };


  function enroll(callback) {

    console.log('begining enroll');

    async.series(
    [
      function(callback) {
        enrollStudentsCourseSections(callback);
      }, function(callback) {
        enrollTeacherCourseSections(callback);
      }, function(callback) {
        enrollAdmins(callback);
      }
    ], function(err) {
      callback(err);
    });
  };

  function cleanCourseSections(callback) {

    console.log('clean course sections')

    GLS.school.getCourseSections(self, function(err, courseSections){

      async.eachSeries(courseSections, function(courseSection, callback) {
        if (!courseSection) return callback(new Error('Empty courseSection'));

        var options = {
          headers: self.headers,
          url: self.glsUrl + '/coursesection/' + courseSection.id
        };

        request.del(options, function(err, response, body) {
          if (body.error) return callback(body.message);
          callback(null);
        });
      }, function(err) {
        callback(err);
      });
    });
  };

  function populateCourseSections(callback) {

    console.log('populate course sections');

    async.eachSeries(courseSectionData, function(courseSection, callback) {

      GLS.createCourseSection(self, courseSection, function(err, courseSection){
        if(err) return callback(err);

        var options = {
          headers: self.headers,
          url: self.glsUrl + '/school/' + self.schoolId + '/coursesection',
          json: {
            add: courseSection.id
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

  function populateStudents(callback) {

    async.eachSeries(studentData, function(student, callback) {

      var options = {
        headers: self.headers,
        url: self.glsUrl + '/user',
        json: _.omit(student, 'username')
      };
      request.post(options, function(err, response, body) {
        if (body.error) return callback(body.message);

        var studentId = body.id;

        var options = {
          headers: self.headers,
          url: self.glsUrl + '/enrollment/school/' + self.schoolId + '/student',
          json: {
            add: studentId
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

  function populateTeachers(callback) {

    async.eachSeries(teacherData, function(teacher, callback) {

      var random = Math.random();

      teacher.email = teacher.email + random;

      var options = {
        headers: self.headers,
        url: self.glsUrl + '/user',
        json: _.omit(teacher, 'username')
      };

      request.post(options, function(err, response, body) {
        if (body.error) return callback(body.message);

        var teacherId = body.id;

        var options = {
          headers: self.headers,
          url: self.glsUrl + '/enrollment/school/' + self.schoolId + '/teacher',
          json: {
            add: teacherId
          }
        };

        request.patch(options, function(err, response, body) {
          if (body.error) return callback(body.message);
          callback();
        });
      });
    }, function(err) {
        callback(err);
      });
  };

  function cleanStudents(callback) {

    console.log('Clean students');

    GLS.school.getStudents(self, function(err, students){

      async.eachSeries(students, function(student, callback) {
        if (!student || !student.id) return callback();
        if (student.email === 'test_student@pearson.com') return callback();

        var options = {
          headers: self.headers,
          url: self.glsUrl + '/user/' + student.id
        };

        request.del(options, function(err, response, body) {
          if (!body) return callback();
          if (JSON.parse(body).error) return callback(JSON.parse(body).error);
          callback();
        });
      }, function(err) {
          callback(err);
        });
    });
  };


  function cleanTeachers(callback) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/school/' + self.schoolId + '/teacher'
    };
    request.get(options, function(err, response, body) {
      if (body.error) return callback(body.message);
      if (!body) return callback();

      async.eachSeries(JSON.parse(body), function(teacher, callback) {
        if (!teacher || !teacher.id) return callback();
        if (teacher.email === 'test_teacher@pearson.com') return callback();

        var options = {
          headers: self.headers,
          url: self.glsUrl + '/user/' + teacher.id
        };

        request.del(options, function(err, response, body) {
          if (!body) return callback();
          if (JSON.parse(body).error) return callback(JSON.parse(body).error);
          callback();
        });
      }, function(err) {
          callback(err);
        });
    });
  };


  function enrollStudentsCourseSections(callback) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/school/' + self.schoolId + '/coursesection'
    };

    //  Get course sections
    request.get(options, function(err, response, body) {
      if (body.error) return callback(body.message);

      async.eachSeries(JSON.parse(body), function(courseSection, callback) {
        if (!courseSection) return callback();
        // Don't add students to Afrikaans 200, Afrikaans 400, Afrikaans 500, Afrikaans 600, Afrikaans 700  for testing purposes
        if(courseSection.name === 'Afrikaans 200' || courseSection.name === 'Afrikaans 400'|| courseSection.name === 'Afrikaans 500' || courseSection.name === 'Afrikaans 600'|| courseSection.name === 'Afrikaans 700') return callback();
        if(!courseSection.name) return callback();

        var options = {
          headers: self.headers,
          url: self.glsUrl + '/school/' + self.schoolId + '/student'
        };
        // Get students
        request.get(options, function(err, response, body) {
          if (body.error) return callback(body.message);
          if (!body) return callback();

          async.eachSeries(JSON.parse(body), function(student, callback) {
            if (!student || !student.id) return callback();

            //  Enroll students into course sections
            var options = {
              headers: self.headers,
              url: self.glsUrl + '/enrollment/coursesection/' + courseSection.id + '/student',
              json: {
                add: student.id
              }
            };

            request.patch(options, function(err, response, body) {
              if (body.error) return callback(body.message);
              callback(null);
            });
          }, function(err){
            callback(err)
          });
        });
      }, function(err) {
        callback(err);
      });
    });
  };

  function enrollTeacherCourseSections(callback) {

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/school/' + self.schoolId + '/coursesection'
    };

    //  Get course sections
    request.get(options, function(err, response, body) {
      if (body.error) return callback(body.message);

      async.eachSeries(JSON.parse(body), function(courseSection, callback) {
        if (!courseSection || !courseSection.id) return callback();

        var options = {
          headers: self.headers,
          url: self.glsUrl + '/school/' + self.schoolId + '/teacher'
        };
        // Get teachers
        request.get(options, function(err, response, body) {
          if (body.error) return callback(body.message);
          if (!body) return callback();

          var teacher = _.find(JSON.parse(body), function(teacher){
            return teacher.name === 'Jane Smith';
          });

          if(!teacher.id) return callback(null);

          //  Enroll teacher into course sections
          var options = {
            headers: self.headers,
            url: self.glsUrl + '/enrollment/coursesection/' + courseSection.id + '/teacher',
            json: {
              add: teacher.id
            }
          };

          request.patch(options, function(err, response, body) {
            if (body.error) return callback(body.message);
            if (!body) return callback();

            callback();
          });
        });
      }, function(err) {
        callback(err);
      });
    });
  };

  function enrollAdmins(callback) {

    async.eachSeries(adminData, function(admin, callback) {

      GLS.auth(self, {username: admin.username, password: admin.password}, function(err, token){
        if(admin.username === 'admin@not.assigned.com' || admin.username === 'just@an.admin.com') return callback(null);

        GLS.getUserByEmail(self, admin.username, function(err, admin){
          if(err) return callback(err);

          GLS.enrollInSchool(self, admin.id, 'admin', function(err){
            //  Ingore conflicts
            if(err && body.statusCode !== 409) return callback(err)

            GLS.enrollInSecondSchool(self, admin.id, 'admin', function(err){
              //  Ingore conflicts
              if(err && body.statusCode !== 409) return callback(err)

              callback(null);
            });
          });
        });
      });
    }, function(err){
      callback(err);
    });
  };

  // Provision product to all course sections excpet Africaans 300
  function provision(callback) {

    console.log('begining provision')

    var options = {
      headers: self.headers,
      url: self.glsUrl + '/school/' + self.schoolId + '/coursesection'
    };
    request.get(options, function(err, response, body) {
      if (body.error) return callback(body.message);

      async.eachSeries(JSON.parse(body), function(courseSection, callback) {
        if (!courseSection) return callback(new Error('Empty courseSection'));
        if(!courseSection.name) return callback(null);
        if(courseSection.name.indexOf('Afrikaans') > -1) return callback(null);

        var options = {
          headers: self.headers,
          url: self.glsUrl + '/school/' + self.schoolId + '/license'
        };
        request.get(options, function(err, response, body) {
          if (body.error) return callback(body.message);

          async.eachSeries(JSON.parse(body), function(license, callback) {
            if(license.product.title !== 'Degrees of Flight') return callback(null);

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
          }, function(err){
            callback(err);
          })
        });
      }, function(err) {
        callback(err);
      });
    });
  };

})();

module.exports = SchoolAdmin;
