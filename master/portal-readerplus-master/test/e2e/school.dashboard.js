var Promise = require('bluebird').Promise;
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var courseSectionEnrollData = 'UserName,SectionCode\nmanik@ny.com,AS600\ntest@pearson.com,AS600\n';
var invalidCourseSectionEnrollData = 'UserName,SectionCode\nxxxx@xxxx.xxx,AS600\nyyyy@yyyy.yyy,AS600';
var courseSectionEnrollDataWithEmptyRow = 'UserName,SectionCode\ngeetha.muthyam@pearson.com,AS600\n,';
var sinSectionData = 'SIN,SectionCode\n1234xxxx1234,AS700\n1234yyyy1234,AS700\n';
var invalidSinSectionData = 'SIN,SectionCode\n1234xxxx1234,ABCD1\n1234aaaa1234,AS700';
var sinSectionDataWithEmptyRow = 'SIN,SectionCode\n1234zzzz1234,AS700\n,';

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

  'School Dashboard : I should see a list of course sections' : function (client) {

    client.elements('css selector', '.ui-grid-row', function(res){
      client.assert.ok(res.value.length === 20)
    });
  },


    'School Dashboard : Add an instructor and add first courseSection' : function (client) {
    var schoolSwitch = client.page.schoolSwitch();
    var courseSection = client.page.courseSection();
    var schoolAdmin = client.page.schoolAdmin();
    var filter = client.page.filter();
    var alert = client.page.alert();
    var grid = client.page.grid();

    schoolAdmin.navigate();

    schoolSwitch.selectSchool('Broadfields Primary School');

    var createdEmail = 'testemail' + Math.random() + '@example.com';
    schoolAdmin.fillUserForm('Broadfields', 'Broadfields', 'Teacher', createdEmail, 'asdf1234');

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('User Broadfields Broadfields successfully created');
    courseSection.navigate();

    courseSection.addCourseSection('A test course section', 'AC100', 'Broadfields Broadfields');

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Course section A test course section successfully created');

    grid.expectCellTextPresent('A test course section');
    grid.expectCellTextPresent('AC100');

  },


  // 'School Dashboard : The grid should have the columns' : function (client) {
  //   client.elements('css selector', '.ngHeaderScroller', function(res){
  //     console.log(res);//.ngHeaderScroller
  //     client.elementIdElements(res.value[0].ELEMENT, 'css selector', '.ngHeaderCell .ngHeaderText', function(col){
  //       client.elementIdText(col.value[0].ELEMENT, function(text){
  //         client.assert.ok(text.value === 'Code');
  //       });
  //       client.elementIdText(col.value[1].ELEMENT, function(text){
  //         client.assert.ok(text.value === 'Course Section');
  //       });
  //       client.elementIdText(col.value[2].ELEMENT, function(text){
  //         client.assert.ok(text.value === 'Course Start');
  //       });
  //       client.elementIdText(col.value[3].ELEMENT, function(text){
  //         client.assert.ok(text.value === 'Course End');
  //       });
  //       client.elementIdText(col.value[4].ELEMENT, function(text){
  //         client.assert.ok(text.value === 'Instructor Name');
  //       });
  //     });
  //   });
  // },

  'School Dashboard : School filter by Jozz Hart' : function (client) {
    client
    .click('select')
    .useXpath()
    .click("//option[.='Jozz Hart']")
    .useCss();

    client.elements('css selector', '.ui-grid-row', function(res){
      client.assert.ok(res.value.length === 0)
    });
  },

  'School Dashboard : Add Course Section' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();
    var courseSection = client.page.courseSection();
    var modalSelect = client.page.modalSelect();

    courseSection.addCourseSection('A test course section', 'AC100', 'Jane Smith');

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Course section A test course section successfully created');

    grid.expectCellTextPresent('A test course section');
    grid.expectCellTextPresent('AC100');

  },

  'School Dashboard : Add Course Section without instructor' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();
    var modalSelect = client.page.modalSelect();
    var modalAlert = client.page.modalAlert();

    var schoolName = 'A test school ' + Math.random();

    client
    .click('[ng-click="addSection()"]')
    .waitForElementVisible(".modal-dialog h3", 5000)
    .expect.element('.modal-dialog h3').text.to.equal('Create New Section');

    client
    .setValue('[ng-model="newCourseSection.name"]', 'A test course section')

    client
    .click('[ng-model="newCourseSection.start"]')
    .click('.ui-state-default')
    .pause(300)
    .click('[ng-model="newCourseSection.end"]')
    .pause(300)
    .click('.ui-datepicker-calendar tbody tr:last-of-type .ui-state-default')
    .pause(300)
    .click('.modal-dialog .btn-primary')

    modalAlert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Please select an Instructor');
    client
    .click('.modal-dialog button.close')
    .pause(500)
    .expect.element('.modal-dialog .alert-danger').to.not.be.present;
    client
    .click('[ng-click="cancel()"]')
    .pause(500)
    .expect.element('.modal-dialog').to.not.be.present;

  },
  'School Dashboard : Bulk enroll users for course section' : function (client) {
      var fileToUpload = './test/data/bulk-enroll.csv';
      var absolutePath = path.resolve(fileToUpload);
      var alert = client.page.alert();

      Promise
      .resolve()
      .then(function() {
        return fs.writeFile(fileToUpload, courseSectionEnrollData);
      })
      .then(function() {
        client.setValue('#blkEnroll input[type="file"]', absolutePath);
        alert
        .waitForElementVisible('@alert', 8000)
        .expect.element('@alert').text.to.equal('2 users successfully enrolled');
      })
      .catch(function() {});
  },
  'School Dashboard : Bulk enroll existing users for course section' : function (client) {
      var fileToUpload = './test/data/bulk-enroll.csv';
      var absolutePath = path.resolve(fileToUpload);
      var alert = client.page.alert();

      Promise
      .resolve()
      .then(function() {
        return fs.writeFile(fileToUpload, courseSectionEnrollData);
      })
      .then(function() {
        client.setValue('#blkEnroll input[type="file"]', absolutePath);
        alert
        .waitForElementVisible('@alert', 8000)
        .expect.element('@alert').text.to.equal('The following users were not enrolled:\nmanik@ny.com - Enrollment already exists\ntest@pearson.com - Enrollment already exists');
      })
      .catch(function() {});
  },
  'School Dashboard : Bulk enroll invalid users for course section' : function (client) {
      var fileToUpload = './test/data/bulk-enroll.csv';
      var absolutePath = path.resolve(fileToUpload);
      var alert = client.page.alert();

      Promise
      .resolve()
      .then(function() {
        return fs.writeFile(fileToUpload, invalidCourseSectionEnrollData);
      })
      .then(function() {
        client.setValue('#blkEnroll input[type="file"]', absolutePath);
        alert
        .waitForElementVisible('@alert', 8000)
        .expect.element('@alert').text.to.equal('The following users were not enrolled:\nxxxx@xxxx.xxx - User doesn\'t exist as student role in the school or course section code doesn\'t exist for the school\nyyyy@yyyy.yyy - User doesn\'t exist as student role in the school or course section code doesn\'t exist for the school');
      })
      .catch(function() {});
  },
  'School Dashboard : Bulk enroll users for course section with empty row' : function (client) {
      var fileToUpload = './test/data/bulk-enroll.csv';
      var absolutePath = path.resolve(fileToUpload);
      var alert = client.page.alert();

      Promise
      .resolve()
      .then(function() {
        return fs.writeFile(fileToUpload, courseSectionEnrollDataWithEmptyRow);
      })
      .then(function() {
        client.setValue('#blkEnroll input[type="file"]', absolutePath);

        alert
        .waitForElementVisible('@alert', 8000)
        .expect.element('@alert').text.to.equal('1 users successfully enrolled');
      })
      .catch(function() {});
  },
  'School Dashboard : Bulk enroll user SIN for course section' : function (client) {
      var fileToUpload = './test/data/bulk-enroll-sin.csv';
      var absolutePath = path.resolve(fileToUpload);
      var alert = client.page.alert();

      Promise
      .resolve()
      .then(function() {
        return fs.writeFile(fileToUpload, sinSectionData);
      })
      .then(function() {
        client.setValue('#blkSinEnroll input[type="file"]', absolutePath);
        alert
        .waitForElementVisible('@alert', 8000)
        .expect.element('@alert').text.to.equal('2 users successfully enrolled');
      })
      .catch(function() {});
  },
  'School Dashboard : Bulk enroll existing user SIN for course section' : function (client) {
      var fileToUpload = './test/data/bulk-enroll-sin.csv';
      var absolutePath = path.resolve(fileToUpload);
      var alert = client.page.alert();

      Promise
      .resolve()
      .then(function() {
        return fs.writeFile(fileToUpload, sinSectionData);
      })
      .then(function() {
        client.setValue('#blkSinEnroll input[type="file"]', absolutePath);
        alert
        .waitForElementVisible('@alert', 8000)
        .expect.element('@alert').text.to.equal('The following user SIN were not enrolled:\n1234xxxx1234 - Enrollment already exists\n1234yyyy1234 - Enrollment already exists');
      })
      .catch(function() {});
  },
  'School Dashboard : Bulk enroll invalid SIN data for course section' : function (client) {
      var fileToUpload = './test/data/bulk-enroll-sin.csv';
      var absolutePath = path.resolve(fileToUpload);
      var alert = client.page.alert();

      Promise
      .resolve()
      .then(function() {
        return fs.writeFile(fileToUpload, invalidSinSectionData);
      })
      .then(function() {
        client.setValue('#blkSinEnroll input[type="file"]', absolutePath);
        alert
        .waitForElementVisible('@alert', 8000)
        .expect.element('@alert').text.to.equal('The following user SIN were not enrolled:\n1234xxxx1234 - User doesn\'t exist as student role in the school or course section code doesn\'t exist for the school\n1234aaaa1234 - User doesn\'t exist as student role in the school or course section code doesn\'t exist for the school');
      })
      .catch(function() {});
  },
  'School Dashboard : Bulk enroll user SIN for course section with empty row' : function (client) {
      var fileToUpload = './test/data/bulk-enroll-sin.csv';
      var absolutePath = path.resolve(fileToUpload);
      var alert = client.page.alert();

      Promise
      .resolve()
      .then(function() {
        return fs.writeFile(fileToUpload, sinSectionDataWithEmptyRow);
      })
      .then(function() {
        client.setValue('#blkSinEnroll input[type="file"]', absolutePath);

        alert
        .waitForElementVisible('@alert', 8000)
        .expect.element('@alert').text.to.equal('1 users successfully enrolled');
      })
      .catch(function() {});
  }

};
