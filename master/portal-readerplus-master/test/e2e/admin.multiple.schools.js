var Promise = require('bluebird').Promise;
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

module.exports = {

  beforeEach : function(client) {
    var auth = client.page.auth();

    auth.navigate()
    auth.loginSchoolAdmin();

  },

  afterEach : function(client, done) {
    var coverage = client.page.coverage();
    coverage.saveCoverage(done);
  },

  'Multiple Schools : Add an instructor' : function (client) {
    var schoolSwitch = client.page.schoolSwitch();
    var courseSection = client.page.courseSection();
    var schoolAdmin = client.page.schoolAdmin();
    var filter = client.page.filter();
    var alert = client.page.alert();

    schoolAdmin.navigate();

    schoolSwitch.selectSchool('Broadfields Primary School');

    var createdEmail = 'testemail' + Math.random() + '@example.com';
    schoolAdmin.fillUserForm('Broadfields', 'Broadfields', 'Teacher', createdEmail, 'asdf1234');

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('User Broadfields Broadfields successfully created');


    filter.setFilter('Broadfields');

    client.elements('css selector', '.ui-grid-row', function(res){
      client.assert.ok(res.value.length > 0)
    });

    schoolSwitch.selectSchool('Durban Heights Primary School');

    client.waitForElementVisible('.table-header input', 10000);

    filter.setFilter('Broadfields');

    client.elements('css selector', '.ui-grid-row', function(res){
      client.assert.ok(res.value.length === 0)
    });

  },

};
