var Promise = require('bluebird').Promise;
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var filename = '/tmp/user-batch.csv';

module.exports = {
  '@tags': ['windows','batch'],
  beforeEach : function(client) {
    var auth = client.page.auth();
    var schoolAdmin = client.page.schoolAdmin();

    auth.navigate()
    auth.loginSchoolAdmin();
    schoolAdmin.navigate();
  },

  afterEach : function(client, done) {
    var coverage = client.page.coverage();
    coverage.saveCoverage(done);
  },

  'School User List : Download batch csv' : function (client) {

    fs.exists(filename, function(exists){
      if(exists) fs.unlinkSync(filename);

      client.click('[href="downloads/user-batch.csv"]')
      .pause(3000, function() {
        client.assert.equal(fs.readFileSync(filename, { encoding: 'utf8' }), 'Firstname,Surname,StudentNumber,Email,Password,Role');
      });
    })
  }
};
