'use strict';

angular.module('app.user')
.factory('UserService', function ($q, $http, $rootScope, localStorage) {

  var Globals = $rootScope.globals;

  this.addUser = function(user) {
    var deferred = $q.defer();

    user.schoolId = localStorage.get('school').id;
    user.countryCode = localStorage.get('school').countryCode;

    $http.post(Globals.glsUrl + '/user', user)
    .success(function(newUser, status, headers, config) {
      deferred.resolve(newUser);
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.addAdmin = function(user) {
    var deferred = $q.defer();

    $http.post(Globals.glsUrl + '/user', user)
    .success(function(newUser, status, headers, config) {
      deferred.resolve(newUser);
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.batchCreate = function(users) {
    var deferred = $q.defer();

    var data = { requests: [] };

    _.each(users, function(user){
      if(user.Firstname || user.Surname || user.Email || user.Password || user.Role){
        data.requests.push({
          method: 'post',
          path: '/user',
          payload: {
            firstName: user.Firstname,
            lastName: user.Surname,
            email: user.Email,
            password: user.Password,
            roles: [user.Role],
            sin: (user.StudentNumber)? user.StudentNumber : '',
            schoolId: localStorage.get('school').id
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
          errors.push('<li>' + data.requests[index].payload.firstName + ' ' + data.requests[index].payload.lastName + ' - ' + response.message.replace('Error creating user: ', '') + '</li>')
        } else {
          successCount++;
        }
      });

      if(errors.length) {
        var errorMessage = '<h4>The following users were not created:</h4><ul>' + errors.join('') + '</ul>';
      }

      if(successCount > 0) {
        var successMessage = successCount + ' users successfully uploaded';
      }

      deferred.resolve({ successMessage: successMessage, errorMessage: errorMessage });
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });

    return deferred.promise;
  };

  this.updateUser = function(user) {
    var deferred = $q.defer();

    var updateUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.firstName + ' ' + user.lastName,
      roles: user.roles
    }
    if(user.sin || user.sin === ''){
      updateUser.sin = user.sin;
    }

    if(user.password !== '') {
      updateUser.password = user.password;
    }

    $http.put(Globals.glsUrl + '/user/' + user.id, updateUser)
    .success(function(data, status, headers, config) {
      data.role = data.roles[0];
      deferred.resolve(data);
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.deleteUser = function(user) {
    var deferred = $q.defer();

    $http.delete(Globals.glsUrl + '/user/' + user.id)
    .success(function(data, status, headers, config) {
      deferred.resolve({ message: 'User successfully deleted'});
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.getTeachers = function() {
    var deferred = $q.defer();

    $http.get(Globals.glsUrl + '/school/' + localStorage.get('school').id +'/teacher')
    .then(function(res) {
      deferred.resolve(res.data);
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  this.getStudents = function() {
    var deferred = $q.defer();

    $http.get(Globals.glsUrl + '/school/' + localStorage.get('school').id +'/student')
    .then(function(res) {
      deferred.resolve(res.data);
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  this.getUsers = function(role) {
    var deferred = $q.defer();

    var queryString = role ?  '?role=' + role : '';

    $http.get(Globals.glsUrl + '/user/all' + queryString)
    .then(function(res) {
      deferred.resolve(res.data);
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  this.removeStudentFromCourseSection = function(courseSectionId, userId) {
    var deferred = $q.defer();

    $http.patch(Globals.glsUrl + '/enrollment/coursesection/' + courseSectionId + '/student', { remove: userId })
    .success(function(data, status, headers, config) {
      deferred.resolve({ message: 'User successfully removed'});
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.removeAdminFromSchool = function(schoolId, userId) {
    var deferred = $q.defer();

    $http.patch(Globals.glsUrl + '/enrollment/school/' + schoolId + '/admin', { remove: userId })
    .success(function(data, status, headers, config) {
      deferred.resolve({ message: 'Admin successfully removed'});
    }).error(function(data, status, headers, config) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  this.getStudentsNotEnrolled = function(courseSectionId) {
    var deferred = $q.defer();
    var data = { requests: [
      {
        method: 'get',
        path: '/school/' + localStorage.get('school').id +'/student',
      }, {
        method: 'get',
        path: '/coursesection/' + courseSectionId +'/student',
      }
    ]};

    $http.post(Globals.glsUrl + '/batch', data)
    .then(function(res) {
      var allStudents = res.data[0];
      var enrolledStudentsIds = _.pluck(res.data[1], 'id');
      deferred.resolve(_.filter(allStudents, function(student) {
        return student.id && !_.contains(enrolledStudentsIds, student.id);
      }));
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  this.getCourseSections = function(userId) {
    var deferred = $q.defer();

    $http.get(Globals.glsUrl + '/user/' + userId +'/coursesection')
    .then(function(res) {
      deferred.resolve(res.data);
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  };

  return this;

});
