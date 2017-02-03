var Promise = require('bluebird').Promise;
var path = require('path');

module.exports = {
  '@tags': ['windows','upload'],
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

  'Book remove : Remove an epub from a product' : function (client) {

    var alert = client.page.alert();
    var modalAlert = client.page.modalAlert();
    var grid = client.page.grid();
    var epubPath = path.resolve('./test/data/sample.epub');
    var coverPath = path.resolve('./test/data/warandpeace.jpg');

    //  Create the product
    client.click('[ng-click="addProduct()"]')
    .waitForElementVisible('.modal-dialog h3', 10000)

    client
    .setValue('[ng-model="newProduct.title"]', 'Book remove product')
    .setValue('[ng-model="newProduct.author"]', 'Author name')
    .setValue('[ng-model="newProduct.description"]', 'A test description')
    .click('[ng-click="save()"]')
    .waitForElementNotPresent('.modal-dialog', 20000)

    alert
    .click('button.close');


    //  Add the book
    grid.findAndClick('Book remove product', 'Add');

    client
    .waitForElementVisible('.modal-dialog h3', 5000)

    client.setValue('#epubUpload input', epubPath);
    client.setValue('input[name="epubCoverUpload"]', coverPath);
    client.click('input[name="studentEpubTyp"]');

    client
    .click('[ng-model="layout.selected"]')
    .click('[ng-model="newBook.allowedPageNavigation"]');

    alert
    .click(".modal-dialog [ng-click='save()']");

    grid.getRowCell('Book remove product', 3).text.to.equal('Complete').after(240000)

    client.refresh();

    //  Remove the book
    grid.findAndClick('Book remove product', 'Remove');

    client
    .waitForElementVisible('.modal-dialog h3', 5000)
    .expect.element('.modal-dialog h3').text.to.equal('Remove book')

    client
    .click('.modal-dialog [ng-click="delete()"]')
    .waitForElementNotPresent('.modal-dialog', 20000)

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Successfully deleted book');

    client
    .useXpath().expect.element("//div[contains(@class, 'ui-grid-row')]//*[.='Book remove product']/ancestor::div[contains(concat(' ', @class, ' '), ' ui-grid-row')]//div[contains(concat(' ', @class, ' '), ' ui-grid-cell ')][Remove]").to.not.be.present
  }


};
