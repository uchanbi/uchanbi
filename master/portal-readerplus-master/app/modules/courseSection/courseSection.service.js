'use strict';

angular.module('app.courseSection')
.factory('CourseSectionService', function ($q, $http, $rootScope, localStorage) {

  var Globals = $rootScope.globals;

   this.getCourseSections = function() {
    var deferred = $q.defer();

    $http.get(Globals.glsUrl + '/school/' + localStorage.get('school').id +'/coursesection')
    .then(function(res) {
      deferred.resolve(res.data);
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };


  this.getCourseSection = function(id) {
    var deferred = $q.defer();

    $http.get(Globals.glsUrl + '/coursesection/' + id)
    .then(function(res) {
      var courseSection = res.data;
      $http.get(Globals.glsUrl + '/coursesection/' + id + '/teacher')
      .then(function(res) {
        courseSection.teacher = res.data;
        deferred.resolve(courseSection);
      }, function(err){
        deferred.resolve(courseSection);
      });
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  this.getCourseSectionStudents = function(id) {
    return $http.get(Globals.glsUrl + '/coursesection/' + id + '/student').then(function(res) {
      return res.data;
    });
  };

  this.getCourseSectionProducts = function(id) {
    return $http.get(Globals.glsUrl + '/coursesection/' + id + '/license').then(function(res) {
      return res.data;
    });
  };

  this.addCourseSection = function(data) {
    var deferred = $q.defer();

    $http.post(Globals.glsUrl + '/coursesection', _.pick(data, ['name', 'sectionCode', 'start', 'end']))
    .success(function(courseSection, status, headers, config) {
      //  Add Course Section to school
      $http.patch(Globals.glsUrl + '/school/' + localStorage.get('school').id + '/coursesection',{
        add:courseSection.id
      })
      .success(function(courseSectionSchool, status, headers, config) {
        //  Enroll the teacher in the course
        $http.patch(Globals.glsUrl + '/enrollment/coursesection/' + courseSection.id + '/teacher',{
          add:data.teacher.id
        })
        .success(function(data, status, headers, config) {
          courseSection.teachers =  [data.user];
          deferred.resolve(courseSection);
        })
        .error(function(data, status, headers, config) {
          deferred.reject(data);
        });
      })
      .error(function(data, status, headers, config) {
        deferred.reject(data);
      });
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.addStudent = function(courseSectionId, studentId) {
    var deferred = $q.defer();

    $http.patch(Globals.glsUrl + '/enrollment/coursesection/' + courseSectionId + '/student', {
      add: studentId
    })
    .success(function(data, status, headers, config) {
      deferred.resolve(data);
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.addStudents = function(courseSectionId, students) {
    var deferred = $q.defer();

    var data = { requests: [] }

    _.each(students, function(student){
      data.requests.push({
        method: 'patch',
        path: '/enrollment/coursesection/' + courseSectionId + '/student',
        payload: {
          add: student.id
        }
      })
    });

    $http.post(Globals.glsUrl + '/batch', data)
    .success(function(data, status, headers, config) {
      deferred.resolve(data);
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.updateCourseSection = function(courseSection) {
    var deferred = $q.defer();

    $http.put(Globals.glsUrl + '/coursesection/' + courseSection.id, {
      name:courseSection.name,
      sectionCode:courseSection.sectionCode,
      start: courseSection.start,
      end: courseSection.end
    })
    .success(function(data, status, headers, config) {

      // Don't need to update teacher
      if(courseSection.oldTeacher === courseSection.teacher) {
        return deferred.resolve(courseSection);
      }

      async.series(
      [
        //  Check for and remove existing teacher
        function(callback){
          if(!courseSection.oldTeacher.id) return callback(null);

          $http.patch(Globals.glsUrl + '/enrollment/coursesection/' + courseSection.id + '/teacher',{
            remove : courseSection.oldTeacher.id,
          })
          .success(function(data, status, headers, config) {
            callback(null)
          })
          .error(function(data, status, headers, config) {
            callback(data);
          });
        },
        function(callback){

          //  Add new teacher
          $http.patch(Globals.glsUrl + '/enrollment/coursesection/' + courseSection.id + '/teacher',{
            add : courseSection.teacher.id,
          })
          .success(function(data, status, headers, config) {
            courseSection.teacher =  data.user;
            callback(null, courseSection);
          })
          .error(function(data, status, headers, config) {
            callback(data);
          });
        }
      ],
      function(err, results){
        if(err) deferred.reject(err);
        deferred.resolve(results[1]);
      });

    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });

    return deferred.promise;
  };

  this.assignCourseToSchool = function(coursesectionid,schoolid) {
     var deferred = $q.defer();

    $http({method:'PATCH', url: Globals.glsUrl + '/school/' + schoolid + '/course' ,data: {add: coursesectionid} })
    .success(function(data, status, headers, config) {
       deferred.resolve(data);
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.bulkEnrollwithUsername = function(enties, schoolId) {
    var deferred = $q.defer();
    var data = { requests: [] };
    _.each(enties, function(entry){
      if(entry.UserName || entry.SectionCode){
        data.requests.push({
          method: 'patch',
          path: '/enrollment/coursesection',
          payload: {
            addUserName: entry.UserName,
            courseSectionCode: entry.SectionCode,
            schoolId: schoolId,
            role: 'student'
          }
        });
      }
    });

    $http.post(Globals.glsUrl + '/batch', data)
    .success(function(responses, status, headers, config) {
      var errors = [];
      var successCount = 0;
      _.each(responses, function(response, index){
        if(response.error) {
          errors.push('<li>' + data.requests[index].payload.addUserName +' - '+ response.message.replace('Error enrolling user: ', '') + '</li>')
        } else {
          successCount++;
        }
      });
      if(errors.length) {
        var errorMessage = '<h4>The following users were not enrolled:</h4><ul>' + errors.join('') + '</ul>';
      }
      if(successCount > 0) {
        var successMessage = successCount + ' users successfully enrolled';
      }
      deferred.resolve({ successMessage: successMessage, errorMessage: errorMessage });
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.bulkEnrollwithSin = function(enties, schoolId) {
    var deferred = $q.defer();
    var data = { requests: [] };
    _.each(enties, function(entry){
      if(entry.SIN || entry.SectionCode){
        data.requests.push({
          method: 'patch',
          path: '/enrollment/coursesection',
          payload: {
            addSin: entry.SIN,
            courseSectionCode: entry.SectionCode,
            schoolId: schoolId,
            role: 'student'
          }
        });
      }
    });

    $http.post(Globals.glsUrl + '/batch', data)
    .success(function(responses, status, headers, config) {
      var errors = [];
      var successCount = 0;
      _.each(responses, function(response, index){
        if(response.error) {
          errors.push('<li>' + data.requests[index].payload.addSin +' - '+ response.message.replace('Error enrolling user: ', '') + '</li>')
        } else {
          successCount++;
        }
      });
      if(errors.length) {
        var errorMessage = '<h4>The following user SIN were not enrolled:</h4><ul>' + errors.join('') + '</ul>';
      }
      if(successCount > 0) {
        var successMessage = successCount + ' users successfully enrolled';
      }
      deferred.resolve({ successMessage: successMessage, errorMessage: errorMessage });
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  return this;
});
