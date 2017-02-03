var Promise = require('bluebird').Promise;
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var filename = '/tmp/product-batch.csv';

module.exports = {
  '@tags': ['timeout','long-running'],
  beforeEach : function(client) {
    var auth = client.page.auth();

    auth.navigate()
    auth.loginPearsonAdmin();

    client.url('http://localhost:3001/#/pearson-admin/product')
    .waitForElementVisible('.ui-grid-row', 5000);
  },

  afterEach : function(client, done) {
    var coverage = client.page.coverage();
    coverage.saveCoverage(done);
  },
  'Product List : Save product when session timeout' : function (client) {
    var alert = client.page.alert();

    client.click('[ng-click="addProduct()"]')
    .waitForElementVisible('.modal-dialog h3', 8000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Product')

    client
    .setValue('[ng-model="newProduct.title"]', 'A test product')
    .setValue('[ng-model="newProduct.author"]', 'Author name')
    .setValue('[ng-model="newProduct.description"]', 'A test description')
    .click('[ng-model="navData.selectedNav"]')
    .click('[ng-model="layout.selected"]')

    client
    .click('.manual-student')
    .click('.manual-teacher')
    .setValue('[ng-model="newProduct.coverImageURL"]', 'http://www.example.com')
    .setValue('[ng-model="newProduct.epubURL"]', 'http://www.example.com')
    .click('[ng-model="newProduct.teacherVersion"]')
    .setValue('[ng-model="newProduct.teacherEpubURL"]', 'http://www.example.com')
    .pause(30000) //value in ms, should be based on services:idm:refreshInterval
    // could not test for 6 hrs expiry scenario. The firefox closed abrubtly after 30 mins
    // set the local gloss-api config services:idm:refreshInterval to 60000
    .click('[ng-click="save()"]');

    client
    .waitForElementNotVisible('.modal-dialog h3', 8000)
    .assert.urlContains('login');

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Your session has expired, please login again.');
  }
};
