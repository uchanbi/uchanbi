_ = require('lodash');

var createdEmail;

module.exports = {

  beforeEach : function(client) {
    var auth = client.page.auth();

    auth.navigate()
    auth.loginPearsonAdmin();
  },

  afterEach : function(client, done) {
    var coverage = client.page.coverage();
    coverage.saveCoverage(done);
  },

  'School Detail : View Durban Heights Primary School' : function (client) {
    var grid = client.page.grid();

    grid.findAndClick('Durban Heights Primary School', 'View');

    client
    .waitForElementVisible('h1', 5000)
    .expect.element('h1').text.to.equal('Durban Heights Primary School');

  },

  'School Detail : School with No assigned admins or licenses' : function (client) {
    var grid = client.page.grid();

    grid.findAndClick('Test School QA', 'View');

    client
    .waitForElementVisible('.admin-grid .gridStyleMessage', 5000)
    .expect.element('.admin-grid .gridStyleMessage').text.to.equal('This school does not have any admins assigned yet');

    client
    .expect.element('.license-grid .gridStyleMessage').text.to.equal('This school does not have any licenses assigned yet');

  },

  'School Detail : Add a license to a school without product' : function (client) {
    var grid = client.page.grid();
    var modalAlert = client.page.modalAlert();

    grid.findAndClick('Test School QA', 'View');

    client
    .waitForElementVisible('.admin-grid .gridStyleMessage', 5000)
    .click("[ng-click='addLicense()']")
    .waitForElementVisible(".modal-dialog h3", 10000)
    .expect.element('.modal-dialog h3').text.to.equal('Add License');

    client
    .setValue('[ng-model="newLicense.seats"]', '50')

    client
    .click('[ng-model="newLicense.start"]')
    .click('.ui-state-default')
    .pause(300)
    .click('[ng-model="newLicense.end"]')
    .pause(300)
    .click('.ui-datepicker-calendar tbody tr:last-of-type .ui-state-default')
    .pause(300)
    .click('.modal-dialog .btn-primary')

    modalAlert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Please select a product');

  },

  'School Detail : Add a license to a school without seats' : function (client) {
    var grid = client.page.grid();
    var modalAlert = client.page.modalAlert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Test School QA', 'View');

    client
    .waitForElementVisible('.admin-grid .gridStyleMessage', 5000)
    .click("[ng-click='addLicense()']")
    .waitForElementVisible(".modal-dialog h3", 5000)

    modalSelect.selectOption("Degrees of Flight");

    client
    .click('[ng-model="newLicense.start"]')
    .click('.ui-state-default')
    .pause(300)
    .click('[ng-model="newLicense.end"]')
    .pause(300)
    .click('.ui-datepicker-calendar tbody tr:last-of-type .ui-state-default')
    .pause(300)
    .click('.modal-dialog .btn-primary')

    modalAlert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('child "seats" fails because ["seats" is required]');

  },

  'School Detail : Add a license to a school' : function (client) {
    var grid = client.page.grid();
    var alert = client.page.alert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Test School QA', 'View');

    client.pause(10000)

    client
    .waitForElementVisible('.admin-grid .gridStyleMessage', 5000)
    .click("[ng-click='addLicense()']")
    .waitForElementVisible(".modal-dialog h3", 5000)

    client.pause(20000)

    modalSelect.selectOption("Degrees of Flight");

    client
    .setValue('[ng-model="newLicense.seats"]', '50')
    .click('[ng-model="newLicense.start"]')
    .click('.ui-state-default')
    .pause(300)
    .click('[ng-model="newLicense.end"]')
    .pause(300)
    .click('.ui-datepicker-calendar tbody tr:last-of-type .ui-state-default')
    .pause(300)
    .click('.modal-dialog .btn-primary')

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('License successfully created for Degrees of Flight');

  },

  'School Detail : Add an existing license to a school' : function (client) {
    var grid = client.page.grid();
    var alert = client.page.alert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Test School QA', 'View');

    client
    .waitForElementVisible('.admin-grid .gridStyleMessage', 5000)
    .click("[ng-click='addLicense()']")
    .waitForElementVisible(".modal-dialog h3", 10000)

    modalSelect.selectOption("Degrees of Flight");

    client
    .setValue('[ng-model="newLicense.seats"]', '50')
    .click('[ng-model="newLicense.start"]')
    .click('.ui-state-default')
    .pause(300)
    .click('[ng-model="newLicense.end"]')
    .pause(300)
    .click('.ui-datepicker-calendar tbody tr:last-of-type .ui-state-default')
    .pause(300)
    .click('.modal-dialog .btn-primary')

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Product already licensed to school');

  },

  'School Detail : Add a license to a school with end date before start date' : function (client) {
    var grid = client.page.grid();
    var modalAlert = client.page.modalAlert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Test School QA', 'View');

    client
    .waitForElementVisible('.admin-grid .gridStyleMessage', 5000)
    .click("[ng-click='addLicense()']")
    .waitForElementVisible(".modal-dialog h3", 10000)

    modalSelect.selectOption("Degrees of Flight");

    client
    .setValue('[ng-model="newLicense.seats"]', '50')
    .setValue('[ng-model="newLicense.start"]', '31 Jul 2018')
    .clearValue('[ng-model="newLicense.end"]')
    .setValue('[ng-model="newLicense.end"]', '31 Jul 2015')
    //.click('.ui-datepicker-calendar tbody .ui-state-default')
    .click('.modal-dialog .btn-primary')

    modalAlert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('License end date is before start date');

  },

  'School Detail : Edit a license' : function (client) {
    var grid = client.page.grid();
    var alert = client.page.alert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Test School QA', 'View');

    client.pause(2000);

    grid.findAndClick('Degrees of Flight', 'Edit');

    client.pause(2000);

    modalSelect.selectOption("All About Mummies");

    client
    .clearValue('[ng-model="newLicense.seats"]')
    .setValue('[ng-model="newLicense.seats"]', '200')
    .clearValue('[ng-model="newLicense.start"]')
    .setValue('[ng-model="newLicense.start"]', '31 Jul 2016')
    .clearValue('[ng-model="newLicense.end"]')
    .setValue('[ng-model="newLicense.end"]', '31 Jul 2017')
    //.click('.ui-datepicker-calendar tbody .ui-state-default')
    .click('.modal-dialog .btn-primary');

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('License for All About Mummies successfully updated');

    client
    .click('button.close')
    .expect.element('.alert-success').to.not.be.present;

  },

  'School Detail : Edit a license with end date before start date' : function (client) {
    var grid = client.page.grid();
    var modalAlert = client.page.modalAlert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Durban Heights Primary School', 'View');

    client.pause(2000);

    grid.findAndClick('Degrees of Flight', 'Edit');

    client.pause(2000);

    modalSelect.selectOption("All About Mummies");

    client
    .clearValue('[ng-model="newLicense.start"]')
    .setValue('[ng-model="newLicense.start"]', '31 Jul 2016')
    .clearValue('[ng-model="newLicense.end"]')
    .setValue('[ng-model="newLicense.end"]', '31 Jul 2012')
    .click('.ui-datepicker-calendar tbody .ui-state-default')
    .clearValue('[ng-model="newLicense.seats"]')
    .setValue('[ng-model="newLicense.seats"]', '200');

    client
    .click('[ng-click="update()"]');


    modalAlert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('License end date is before start date');

  },

  'School Detail : Add new admin and dismiss message' : function (client) {
    var grid = client.page.grid();
    var alert = client.page.alert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Test School QA', 'View');

    client
    .waitForElementVisible("[ng-click='addAdmin()']", 5000)
    .click("[ng-click='addAdmin()']")
    .waitForElementVisible(".modal-dialog h3", 10000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Admin to School');

    modalSelect.selectOption("Just Anadmin");

    client
    .click('.modal-dialog .btn-primary');

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Admin Just successfully added to school');

    client
    .click('button.close')
    .expect.element('.alert-success').to.not.be.present;

  },

  'School Detail : Add admin that is already assigned' : function (client) {
    var grid = client.page.grid();
    var modalAlert = client.page.modalAlert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Test School QA', 'View');

    client
    .waitForElementVisible("[ng-click='addAdmin()']", 5000)
    .click("[ng-click='addAdmin()']")
    .waitForElementVisible(".modal-dialog h3", 10000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Admin to School');

    modalSelect.selectOption("Not Assigned");

    client
    .click('.modal-dialog .btn-primary');

    // trying to add for second time
    client
    .waitForElementVisible("[ng-click='addAdmin()']", 5000)
    .click("[ng-click='addAdmin()']")
    .waitForElementVisible(".modal-dialog h3", 10000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Admin to School');

    modalSelect.selectOption("Not Assigned");

    client
    .click('.modal-dialog .btn-primary');

    modalAlert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Enrollment already exists');

  },

  'School Detail : Remove admin from school and dismiss message' : function (client) {
    var grid = client.page.grid();
    var alert = client.page.alert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Test School QA', 'View');

    client.pause(2000);

    grid.findAndClick('Just', 'Remove');

    client
    .waitForElementVisible(".modal-dialog h3", 10000)
    .expect.element('.modal-dialog h3').text.to.equal('Remove admin from the school')

    client.pause(2000);

    client
    .click(".modal-dialog [ng-click='remove()']");

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Admin successfully removed from school');

  },
};
