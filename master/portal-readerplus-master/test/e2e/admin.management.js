var createdEmail;

module.exports = {

  beforeEach : function(client) {
    var auth = client.page.auth();

    auth.navigate()
    auth.loginPearsonAdmin();

    client.url('http://localhost:3001/#/pearson-admin/admin')
    .waitForElementVisible('.ui-grid-row', 10000);
  },

  afterEach : function(client, done) {
    var coverage = client.page.coverage();
    coverage.saveCoverage(done);
  },

  'Pearson admin : The page loads listing admins' : function (client) {

    client.elements('css selector', '.ui-grid-row', function(res){
      client.assert.ok(res.value.length >= 3)
    });

  },

  'Filter admins' : function (client) {
    var filter = client.page.filter();

    filter.setFilter('Not');

    client.elements('css selector', '.ui-grid-row', function(res){
      client.assert.ok(res.value.length === 1)
    });

  },

  'Pearson admin : Add new admin without countryCode' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();

    createdEmail = 'testemail' + Math.random() + '@example.com';

    client
    .click('[ng-click="addAdmin()"]')
    .waitForElementVisible('[ng-model="newUser.firstName"]', 10000)
    .setValue('[ng-model="newUser.firstName"]', 'A test name')
    .setValue('[ng-model="newUser.lastName"]', 'A test last name')
    .setValue('[ng-model="newUser.email"]', createdEmail)
    .setValue('[ng-model="newUser.password"]', 'a test password 12')
    .click('.modal-dialog .btn-primary')

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('Country code is required');
  },

  'Pearson admin : Add new admin with countryCode' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();

    createdEmail = 'testemail' + Math.random() + '@example.com';

    client
    .click('[ng-click="addAdmin()"]')
    .waitForElementVisible('[ng-model="newUser.firstName"]', 10000)
    .setValue('[ng-model="newUser.firstName"]', 'A test name')
    .setValue('[ng-model="newUser.lastName"]', 'A test last name')
    .setValue('[ng-model="newUser.email"]', createdEmail)
    .click('.modal-dialog [ng-click="$select.activate()"]')
    .setValue('[ng-model="$select.search"]', 'Teacher')
    .click('[ng-click="$select.select(country)"]')
    .setValue('[ng-model="newUser.password"]', 'a test password 12')
    .click('.modal-dialog .btn-primary')

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('Admin A test name A test last name successfully created');

    grid.expectCellTextPresent('A test name');

  },

  'Pearson admin : Add new admin with no email filled in' : function (client) {
    var alert = client.page.alert();

    client.click('[ng-click="addAdmin()"]')
    .waitForElementVisible('[ng-model="newUser.firstName"]', 2000)
    .setValue('[ng-model="newUser.firstName"]', 'A test name')
    .setValue('[ng-model="newUser.lastName"]', 'A test last name')
    .setValue('[ng-model="newUser.password"]', 'a test password 12')
    .click('.modal-dialog .btn-primary')

    alert
    .waitForElementVisible('@alert', 2000)
    .expect.element('@alert').text.to.equal('child "email" fails because ["email" is required]');

  },

  'Pearson admin : Add new admin with no password filled in' : function (client) {
    var alert = client.page.alert();

    client.click('[ng-click="addAdmin()"]')
    .waitForElementVisible('[ng-model="newUser.firstName"]', 10000)
    .setValue('[ng-model="newUser.firstName"]', 'A test name')
    .setValue('[ng-model="newUser.lastName"]', 'A test last name')
    .setValue('[ng-model="newUser.email"]', createdEmail)
    .click('.modal-dialog .btn-primary')

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('child "password" fails because ["password" is required]');

  },

  'Pearson admin : Edit admin details' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();

    grid.findAndClick('test_school_admin@pearson.com', 'Edit');

    client
    .waitForElementVisible('[ng-model="newUser.firstName"]', 10000)
    .clearValue('[ng-model="newUser.firstName"]')
    .setValue('[ng-model="newUser.firstName"]', 'xxxx')
    .clearValue('[ng-model="newUser.lastName"]')
    .setValue('[ng-model="newUser.lastName"]', 'yyyy')
    .click('.modal-dialog .btn-primary')

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('Admin xxxx yyyy successfully updated');

    grid.expectCellTextPresent('xxxx');

  },

  'Pearson admin : Revert back the admin details from last step' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();

    grid.findAndClick('test_school_admin@pearson.com', 'Edit');

    client
    .waitForElementVisible('[ng-model="newUser.firstName"]', 10000)
    .clearValue('[ng-model="newUser.firstName"]')
    .setValue('[ng-model="newUser.firstName"]', 'School')
    .clearValue('[ng-model="newUser.lastName"]')
    .setValue('[ng-model="newUser.lastName"]', 'Admin')
    .click('.modal-dialog .btn-primary')

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('Admin School Admin successfully updated');

    grid.expectCellTextPresent('Admin');

  },

  'Pearson admin : Update admin password' : function (client) {
    var alert = client.page.alert();
    var auth = client.page.auth();
    var grid = client.page.grid();

    var password = 'Qer#1p8TYmK&fI@L';

    grid.findAndClick(createdEmail, 'Edit');

    client
    .waitForElementVisible('[ng-model="newUser.password"]', 10000)
    .clearValue('[ng-model="newUser.password"]')
    .setValue('[ng-model="newUser.password"]', password)
    .click('.modal-dialog .btn-primary')

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('Admin A test name A test last name successfully updated');


    client
    .url('http://localhost:3001/#/logout')
    .waitForElementVisible('.form-signin', 10000)

    auth.navigate()
    .waitForElementVisible('@submitButton', 10000)
    .setValue('input[name=username]', createdEmail)
    .setValue('input[type=password]', password)
    .click('@submitButton')

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('Error: User is not registered to a school');

  },

  // 'Delete admin' : function (client) {
  //   var alert = client.page.alert();
  //   var auth = client.page.auth();
  //   var grid = client.page.grid();
  //
  //   grid.findAndClick(createdEmail, 'Delete');
  //
  //   client
  //   .waitForElementVisible('.modal-dialog .btn-danger', 10000)
  //   .click('.modal-dialog .btn-danger')
  //
  //   alert
  //   .waitForElementVisible('@alert', 10000)
  //   .expect.element('@alert').text.to.equal('Admin successfully deleted');
  //
  // }

};
