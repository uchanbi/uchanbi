_ = require('lodash');

var createdEmail;

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

  'Course Section Detail : View Afrikaans 100' : function (client) {
    var grid = client.page.grid();

    grid.findAndClick('Afrikaans 100', 'Details');

    client
    .waitForElementVisible('.main .ui-select-match :nth-child(2) span', 5000)
    .expect.element('.main .ui-select-match :nth-child(2) span').text.to.equal('Afrikaans 100');

    client.expect.element('h4').text.to.equal('Course Period : 14 Feb 2014 - 14 Oct 2014\nInstructor : Jane Smith\nCode :')

  },

  'Course Section Detail : The course section has no students' : function (client) {
    var grid = client.page.grid();

    grid.findAndClick('Afrikaans 200', 'Details');

    client
    .waitForElementVisible('.user-grid .gridStyleMessage', 5000)
    .expect.element('.user-grid .gridStyleMessage').text.to.equal('This course does not have any students assigned yet');

  },

  'Course Section Detail : The course section has no products' : function (client) {
    var grid = client.page.grid();

    grid.findAndClick('Afrikaans 300', 'Details');

    client
    .waitForElementVisible('.product-grid .gridStyleMessage', 5000)
    .expect.element('.product-grid .gridStyleMessage').text.to.equal('This course does not have any products assigned yet');

  },

  'Course Section Detail : Edit Course Section Dialog' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();

    grid.findAndClick('Afrikaans 300', 'Details');

    client
    .waitForElementVisible("[ng-click='editSection()']", 5000)
    .click("[ng-click='editSection()']")
    .waitForElementVisible(".modal-dialog h3", 10000)
    .expect.element('.modal-dialog h3').text.to.equal('Edit Section');

    client.expect.element('.modal-dialog [ng-click="$select.activate()"]').text.to.equal('Jane Smith')


    client
    .clearValue('[ng-model="newCourseSection.name"]')
    .setValue('[ng-model="newCourseSection.name"]', 'Afrikaans 301')
    .click('.modal-dialog [ng-click="$select.activate()"]')
    .useXpath()
    .click("//span[.='Mehdi Avdi']/..")
    .useCss()
    .click("[ng-click='update()']")

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Course section Afrikaans 301 successfully updated');

    client.expect.element('.main .ui-select-match :nth-child(2) span').text.to.equal('Afrikaans 301');
    client.expect.element('h4 :nth-child(5)').text.to.equal('Mehdi Avdi');

  },

  'Course Section Detail : Add single student to course section' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();

    grid.findAndClick('Afrikaans 200', 'Details');

    client
    .waitForElementVisible("[ng-click='addStudentToCourseSection()']", 5000)
    .click("[ng-click='addStudentToCourseSection()']")
    .waitForElementVisible(".modal-dialog h3", 5000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Students to Course Section');

    client.pause(300);


    client
    .useXpath()
    .click("//strong[.='Manik Kakar']/..")
    .useCss()
    .click("[ng-click='add()']")

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('User Manik Kakar successfully added to course section');

    grid.expectCellTextPresent('Manik Kakar');

  },

  'Course Section Detail : Add multiple students to course section' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();

    grid.findAndClick('Afrikaans 200', 'Details');

    client
    .waitForElementVisible("[ng-click='addStudentToCourseSection()']", 5000)
    .click("[ng-click='addStudentToCourseSection()']")
    .waitForElementVisible(".modal-dialog h3", 5000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Students to Course Section');

    client.pause(200);

    client
    .useXpath()
    .click("//strong[.='Geetha Muthyam']/..")
    .click("//strong[.='Billy Bob']/..")
    .useCss()
    .click("[ng-click='add()']")

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.contain('successfully added to course section');

    alert.expect.element('@alert').text.to.contain('Billy Bob');
    alert.expect.element('@alert').text.to.contain('Geetha Muthyam');

    grid.expectCellTextPresent('Geetha Muthyam');
    grid.expectCellTextPresent('Billy Bob');

  },

  'Course Section Detail : Cant see already added students as options' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();

    grid.findAndClick('Afrikaans 200', 'Details');

    client
    .waitForElementVisible("[ng-click='addStudentToCourseSection()']", 5000)
    .click("[ng-click='addStudentToCourseSection()']")
    .waitForElementVisible(".modal-dialog h3", 5000)

    client.pause(300);

    client
    .useXpath()
    .expect.element("//strong[.='Geetha Muthyam']/..").to.not.be.present;

    client
    .useXpath()
    .expect.element("//strong[.='Billy Bob']/..").to.not.be.present;

    client.useCss();

  },

  'Course Section Detail : Remove student from course section' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();

    grid.findAndClick('Afrikaans 100', 'Details');

    client
    .waitForElementVisible(".user-grid .ui-grid-row", 5000);

    grid.findAndClick('Manik Kakar', 'Remove');

    client
    .waitForElementVisible(".modal-dialog h3", 5000)
    .click(".modal-dialog [ng-click='remove()']")

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.contain('Manik Kakar successfully removed from course section');

  },

  'Course Section Detail : Edit student in course section' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();

    grid.findAndClick('Afrikaans 100', 'Details');

    client
    .waitForElementVisible(".user-grid .ui-grid-row", 5000);

    grid.findAndClick('Geetha Muthyam', 'Edit');
    client
    .waitForElementVisible(".modal-dialog h3", 5000)
    .expect.element('[ng-model="newUser.firstName"]').value.to.equal('Geetha');

    client.expect.element('[ng-model="newUser.lastName"]').value.to.equal('Muthyam');

    client.click('[ng-click="$select.activate()"]')
    .setValue('[ng-model="$select.search"]', 'Teacher')
    .click('[ng-click="$select.select(role)"]')
    .clearValue('[ng-model="newUser.firstName"]')
    .clearValue('[ng-model="newUser.lastName"]')
    .setValue('[ng-model="newUser.firstName"]', 'Geet')
    .setValue('[ng-model="newUser.lastName"]', 'Muthya')
    .click('.modal-dialog .btn-primary');

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('User Geet Muthya successfully updated');

    grid.findAndClick('Geet Muthya', 'Edit');
    client.expect.element('[ng-model="newUser.firstName"]').value.to.equal('Geet');
    client.expect.element('[ng-model="newUser.lastName"]').value.to.equal('Muthya');

    client.click('[ng-click="$select.activate()"]')
    .setValue('[ng-model="$select.search"]', 'Teacher')
    .click('[ng-click="$select.select(role)"]')
    .clearValue('[ng-model="newUser.firstName"]')
    .clearValue('[ng-model="newUser.lastName"]')
    .setValue('[ng-model="newUser.firstName"]', 'Geetha')
    .setValue('[ng-model="newUser.lastName"]', 'Muthyam')
    .click('.modal-dialog .btn-primary');

  },

  'Course Section Detail : Search for student for adding to course section' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();

    grid.findAndClick('Afrikaans 200', 'Details');

    client
    .waitForElementVisible("[ng-click='addStudentToCourseSection()']", 5000)
    .click("[ng-click='addStudentToCourseSection()']")
    .waitForElementVisible(".modal-dialog h3", 5000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Students to Course Section');

    client
    .waitForElementVisible('.add-student-modal [ng-model="filter"]', 5000)
    .setValue('.add-student-modal [ng-model="filter"]', 'test')
    .expect.element('.list-group-item:nth-child(1) strong').text.to.equal('test two');
  }
};
