var Promise = require('bluebird').Promise;
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var userData = 'Firstname,Surname,StudentNumber,Email,Password,Role\nxxxx,xxxx,,xxxx@xxxx.xxx,abcd1234,student\nyyyy,yyyy,,yyyy@yyyy.yyy,abcd1234,student\n';
var corruptUserData = 'Firstname,Surname,StudentNumber,Email,Password,Role\nxxxx,xxxx,,xxxx@xxxx.xxx'+ Math.random() +',abcd1234,student\nyyyy,yyyy,,yyyy@yyyy.yyy' + Math.random() + ',abcd1234';
var userDataWithEmptyLine = 'Firstname,Surname,StudentNumber,Email,Password,Role\nzzzz,zzzz,,zzzz@zzzz.zzz,abcd1234,student\n\n';
var userDataWithEmptyRow = 'Firstname,Surname,StudentNumber,Email,Password,Role\nzzzz,zzzz,,zzzz@zzzz.zzz' + Math.random() + ',abcd1234,student\n,,,,,';
var userDataWithEmptyFields = 'Firstname,Surname,StudentNumber,Email,Password,Role\n,,,aaaa@aaaa.aaa,abcd1234,student';
var studentsWithSin = 'Firstname,Surname,StudentNumber,Email,Password,Role\nmmmm,mmmm,123mmmm123,mmmm@mmmm.mmm,abcd1234,student\nnnnn,nnnn,,nnnn@nnnn.nnn,abcd1234,student\n';
var teachersWithSin = 'Firstname,Surname,StudentNumber,Email,Password,Role\nqqqq,qqqq,123qqqq123,qqqq@qqqq.qqq,abcd1234,teacher\nrrrr,rrrr,123rrrr123,rrrr@rrrr.rrr,abcd1234,teacher\n';

module.exports = {
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

  'School User List : The page loads with users' : function (client) {
    client.expect.element(".user-grid").to.be.present;
    client.elements('css selector', '.ui-grid-row', function(res){
      client.assert.ok(res.value.length >= 2)
    });

  },

  'School User List : User filter by name' : function (client) {
    client
    .clearValue('[ng-model="userFilterBy"]')
    .setValue('[ng-model="userFilterBy"]', 'Bill');

    client.elements('css selector', '.ui-grid-row', function(res){
      client.assert.ok(res.value.length === 1)
    });

  },

  'School User List : User filter by role' : function (client) {
    client
    .clearValue('[ng-model="selectedRole"]')
    .setValue('[ng-model="selectedRole"]', 'admin');

    client.elements('css selector', '.ui-grid-row', function(res){
      client.assert.ok(res.value.length === 2)
    });
  },

  'School User List : Add new student' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();
    var schoolAdmin = client.page.schoolAdmin();

    var createdEmail = 'testemail' + Math.random() + '@example.com';
    schoolAdmin.fillUserForm('A test name', 'A test last name', 'Student', createdEmail, 'a test password 12');

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('User A test name A test last name successfully created');

    grid.expectCellTextPresent('A test name');

  },
  'School User List : Add new user without role' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();
    //var schoolAdmin = client.page.schoolAdmin();

    var createdEmail = 'testemail' + Math.random() + '@example.com';

    client
    .click('[ng-click="addUser()"]')
    .waitForElementVisible('.modal-dialog [ng-click="$select.activate()"]', 10000)
    .pause(200)
    .setValue('[ng-model="newUser.firstName"]', 'A test new')
    .setValue('[ng-model="newUser.lastName"]', 'A test last new')
    .setValue('[ng-model="newUser.email"]', createdEmail)
    .setValue('[ng-model="newUser.password"]', 'a test password 12')
    .click('.modal-dialog .btn-primary')
    .waitForElementVisible('.modal-dialog .alert', 10000)
    .expect.element('.modal-dialog .alert div span').text.to.equal('child "roles" fails because ["roles" is required]');

    client
    .click('.modal-dialog [ng-click="close($event)"]')
    .waitForElementVisible('.modal-dialog [ng-click="$select.activate()"]', 10000)
    .click('.modal-dialog [ng-click="$select.activate()"]')
    .pause(300)
    .useXpath()
    .click("//div[contains(@class, 'modal-dialog')] //span[contains(@ng-bind-html,'role') and text() = 'Student']/..")
    .useCss()
    .pause(200)
    .click('.modal-dialog .btn-primary');

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('User A test new A test last new successfully created');

    grid.expectCellTextPresent('A test new');

  },

  'School User List : Add an existing student' : function (client) {
    var alert = client.page.alert();
    var modalAlert = client.page.modalAlert();
    var grid = client.page.grid();
    var schoolAdmin = client.page.schoolAdmin();

    createdEmail = 'testemail' + Math.random() + '@example.com';

    schoolAdmin.fillUserForm('A test student', 'A test student', 'Student', createdEmail, 'a test password 12');

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('User A test student A test student successfully created');
    grid.expectCellTextPresent('A test student');
    //re-add the user with same email
    schoolAdmin.fillUserForm('A test name', 'A test last name', 'Student', createdEmail, 'a test password 12');

    modalAlert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('Error creating user: User already exists');

  },

  'School User List : Create user form for Teacher Role should not have SIN' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();
    var schoolAdmin = client.page.schoolAdmin();

    var createdEmail = 'testemail' + Math.random() + '@example.com';

    schoolAdmin
    .click('[ng-click="addUser()"]')
    .waitForElementVisible('[ng-click="$select.activate()"]', 10000)
    .api.pause(200)
    .click('.modal-dialog [ng-click="$select.activate()"]')
    .pause(200)
    .waitForElementVisible('.modal-dialog [class="ui-select-choices-row ng-scope active"]', 10000)
    .click('.modal-dialog [ng-click="$select.select(role)"]')
    .setValue('[ng-model="$select.search"]', 'Student')
    .waitForElementVisible('[ng-model="newUser.sin"]', 10000)
    .setValue('[ng-model="$select.search"]', 'Teacher')
    .waitForElementVisible('[ng-model="newUser.sin"]', 10000)
  },

  'School User List : Add new student with SIN and then filter by SIN' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();
    var schoolAdmin = client.page.schoolAdmin();

    var createdEmail = 'testemail' + Math.random() + '@example.com';

    schoolAdmin
    .click('[ng-click="addUser()"]')
    .waitForElementVisible('.modal-dialog [ng-click="$select.activate()"]', 10000)
    .api.pause(200)
    .click('.modal-dialog [ng-click="$select.activate()"]')
    .pause(300)
    .useXpath()
    .click("//div[contains(@class, 'modal-dialog')]//span[.='Student']/..")
    .useCss()
    .pause(300)
    .setValue('[ng-model="newUser.firstName"]', 'A first name with SIN')
    .setValue('[ng-model="newUser.lastName"]', 'A last name')
    .setValue('[ng-model="newUser.email"]', createdEmail)
    .setValue('[ng-model="newUser.password"]', 'a test password 12')
    .setValue('[ng-model="newUser.sin"]', '1234tttt1234')
    .click('.modal-dialog .btn-primary');

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('User A first name with SIN A last name successfully created');

    grid.expectCellTextPresent('A first name with SIN');
    grid.findAndClick('A first name with SIN', 'Edit');

    client.pause(2000);

    client.expect.element('[ng-model="newUser.firstName"]').value.to.equal('A first name with SIN');
    client.expect.element('[ng-model="newUser.sin"]').value.to.equal('1234tttt1234');

    client
    .click('.modal-dialog .btn-warning');

    client.pause(200);

    schoolAdmin
    .clearValue('[ng-model="userFilterBy"]')
    .setValue('[ng-model="userFilterBy"]', '1234tttt1234');

    client.elements('css selector', '.ui-grid-row', function(res){
      client.assert.ok(res.value.length === 1)
    });

  },

  'School User List : Edit user details' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();

    grid.findAndClick('Manik', 'Edit');

    client.pause(2000);

    client.expect.element('[ng-model="newUser.firstName"]').value.to.equal('Manik');
    client.expect.element('[ng-model="newUser.lastName"]').value.to.equal('Kakar');

    client.click('.modal-dialog [ng-click="$select.activate()"]')
    .setValue('.modal-dialog [ng-model="$select.search"]', 'Teacher')
    .click('.modal-dialog [ng-click="$select.select(role)"]')
    .clearValue('[ng-model="newUser.firstName"]')
    .clearValue('[ng-model="newUser.lastName"]')
    .setValue('[ng-model="newUser.firstName"]', 'Man')
    .setValue('[ng-model="newUser.lastName"]', 'Kakara')
    .click('.modal-dialog .btn-primary');

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('User Man Kakara successfully updated');

    grid.findAndClick('Man', 'Edit');
    client.expect.element('[ng-model="newUser.firstName"]').value.to.equal('Man');
    client.expect.element('[ng-model="newUser.lastName"]').value.to.equal('Kakara');

    client.click('.modal-dialog [ng-click="$select.activate()"]')
    .setValue('.modal-dialog [ng-model="$select.search"]', 'Teacher')
    .click('.modal-dialog [ng-click="$select.select(role)"]')
    .clearValue('[ng-model="newUser.firstName"]')
    .clearValue('[ng-model="newUser.lastName"]')
    .setValue('[ng-model="newUser.firstName"]', 'Manik')
    .setValue('[ng-model="newUser.lastName"]', 'Kakar')
    .click('.modal-dialog .btn-primary');
  },

  'School User List : Edit student SIN' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();

    grid.findAndClick('A first name with SIN', 'Edit');

    client.pause(2000);

    client.expect.element('[ng-model="newUser.firstName"]').value.to.equal('A first name with SIN');
    client.expect.element('[ng-model="newUser.sin"]').value.to.equal('1234tttt1234');

    client.click('.modal-dialog [ng-click="$select.activate()"]')
    .clearValue('[ng-model="newUser.sin"]')
    .setValue('[ng-model="newUser.sin"]', '1234mmmm1234')
    .click('.modal-dialog .btn-primary');

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('User A first name with SIN A last name successfully updated');

    grid.findAndClick('A first name with SIN', 'Edit');
    client.expect.element('[ng-model="newUser.firstName"]').value.to.equal('A first name with SIN');
    client.expect.element('[ng-model="newUser.sin"]').value.to.equal('1234mmmm1234');
  },

  'School User List : View student course sections' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();
    var schoolAdmin = client.page.schoolAdmin();

    grid.findAndClick('Manik', 'Course sections');
    client
    .waitForElementVisible('.modal-dialog', 2000)
    .useXpath()
    .expect.element("//li[contains(@class, 'list-group-item ng-scope')]//*[.='Math 102']").to.be.present;
    client
    .useCss();

    client.elements('css selector', '.add-student-modal .list-group-item', function(res){
      client.assert.ok(res.value.length > 1)
    });
  },

  'School User List : Delete student' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();
    var schoolAdmin = client.page.schoolAdmin();

    var createdEmail = 'usertobedeleted' + Math.random() + '@example.com';

    schoolAdmin.fillUserForm('usertobedeleted', 'usertobedeleted', 'Student', createdEmail, 'a test password 12');

    alert
    .waitForElementVisible('@alert', 10000);
    client
    .click('button.close')
    .pause(100)
    grid.findAndClick('usertobedeleted', 'Delete');
    client
    .waitForElementVisible('[ng-click="delete()"]', 10000)
    .click('[ng-click="delete()"]')

    alert
    .waitForElementVisible('@alert',8000)
    .expect.element('@alert').text.to.equal('User successfully deleted')
  },

  'School User List : Batch upload users' : function (client) {
    var alert = client.page.alert();
    var fileToUpload = './test/data/user-batch.csv';
    var absolutePath = path.resolve(fileToUpload);

    Promise
    .resolve()
    .then(function() {
      return fs.writeFile(fileToUpload, userData);
    })
    .then(function() {
      client.setValue('input[type="file"]', absolutePath);

      alert
      .waitForElementVisible('@alert', 8000)
      .expect.element('@alert').text.to.equal('2 users successfully uploaded');
    })
    .catch(function() {});
  },

  'School User List : Batch upload existing users' : function (client) {
    var alert = client.page.alert();
    var fileToUpload = './test/data/user-batch.csv';
    var absolutePath = path.resolve(fileToUpload);

    Promise
    .resolve()
    .then(function() {
      return fs.writeFile(fileToUpload, userData);
    })
    .then(function() {
      client.setValue('input[type="file"]', absolutePath);

      alert
      .waitForElementVisible('@alert', 8000)
      .expect.element('@alert').text.to.equal('The following users were not created:\nxxxx xxxx - User already exists\nyyyy yyyy - User already exists');
    })
    .catch(function() {});
  },

  'School User List : Batch upload corrupted users' : function (client) {
    var alert = client.page.alert();
    var fileToUpload = './test/data/user-batch.csv';
    var absolutePath = path.resolve(fileToUpload);

    Promise
    .resolve()
    .then(function() {
      return fs.writeFile(fileToUpload, corruptUserData);
    })
    .then(function() {
      client.setValue('input[type="file"]', absolutePath);
      alert
      .waitForElementVisible('@alert', 8000)
      .expect.element('@alert').text.to.equal('Too few fields: expected 6 fields but parsed 5');
    })
    .catch(function() {});
  },

  'School User List : Batch upload with an empty cvs row' : function (client) {
    var alert = client.page.alert();
    var fileToUpload = './test/data/user-batch.csv';
    var absolutePath = path.resolve(fileToUpload);

    Promise
    .resolve()
    .then(function() {
      return fs.writeFile(fileToUpload, userDataWithEmptyRow);
    })
    .then(function() {
      client.setValue('input[type="file"]', absolutePath);
      alert
      .waitForElementVisible('@alert', 8000)
      .expect.element('@alert').text.to.equal('1 users successfully uploaded');
    })
    .catch(function() {});
  },

  'School User List : Batch upload with an empty cvs line' : function (client) {
    var alert = client.page.alert();
    var fileToUpload = './test/data/user-batch.csv';
    var absolutePath = path.resolve(fileToUpload);

    Promise
    .resolve()
    .then(function() {
      return fs.writeFile(fileToUpload, userDataWithEmptyLine);
    })
    .then(function() {
      client.setValue('input[type="file"]', absolutePath);
      alert
      .waitForElementVisible('@alert', 8000)
      .expect.element('@alert').text.to.equal('1 users successfully uploaded');
    })
    .catch(function() {});
  },

  'School User List : Batch upload with some mandatory fields empty in row' : function (client) {
    var alert = client.page.alert();
    var fileToUpload = './test/data/user-batch.csv';
    var absolutePath = path.resolve(fileToUpload);

    Promise
    .resolve()
    .then(function() {
      return fs.writeFile(fileToUpload, userDataWithEmptyFields);
    })
    .then(function() {
      client.setValue('input[type="file"]', absolutePath);
      alert
      .waitForElementVisible('@alert', 8000)
      .expect.element('@alert').text.to.equal('The following users were not created:\n- child "firstName" fails because ["firstName" is not allowed to be empty]');
    })
    .catch(function() {});
  },

  'School User List : Batch upload students with SIN' : function (client) {
    var alert = client.page.alert();
    var fileToUpload = './test/data/user-batch.csv';
    var absolutePath = path.resolve(fileToUpload);

    Promise
    .resolve()
    .then(function() {
      return fs.writeFile(fileToUpload, studentsWithSin);
    })
    .then(function() {
      client.setValue('input[type="file"]', absolutePath);

      alert
      .waitForElementVisible('@alert', 8000)
      .expect.element('@alert').text.to.equal('2 users successfully uploaded');
    })
    .catch(function() {});
  },

  'School User List : Batch upload teachers with SIN' : function (client) {
    var alert = client.page.alert();
    var fileToUpload = './test/data/user-batch.csv';
    var absolutePath = path.resolve(fileToUpload);

    Promise
    .resolve()
    .then(function() {
      return fs.writeFile(fileToUpload, teachersWithSin);
    })
    .then(function() {
      client.setValue('input[type="file"]', absolutePath);

      alert
      .waitForElementVisible('@alert', 8000)
      .expect.element('@alert').text.to.equal('The following users were not created:\nqqqq qqqq - Teacher should not have Student Number\nrrrr rrrr - Teacher should not have Student Number');
    })
    .catch(function() {});
  }
};
