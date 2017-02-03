var Promise = require('bluebird').Promise;
var path = require('path');

module.exports = {
  '@tags': ['upload'],
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

  'Book upload : Should get error uploading without book' : function (client) {
    var alert = client.page.alert();
    var modalAlert = client.page.modalAlert();
    var grid = client.page.grid();

    client.click('[ng-click="addProduct()"]')
    .waitForElementVisible('.modal-dialog h3', 10000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Product')

    client
    .setValue('[ng-model="newProduct.title"]', 'Product with book')
    .setValue('[ng-model="newProduct.author"]', 'Author name')
    .setValue('[ng-model="newProduct.description"]', 'A test description')
    .click('[ng-click="save()"]')
    .waitForElementNotPresent('.modal-dialog', 20000)

    alert
    .click('button.close');

    grid.findAndClick('Product with book', 'Add');

    client
    .waitForElementVisible('.modal-dialog h3', 5000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Book');

    alert
    .click(".modal-dialog [ng-click='save()']");

    modalAlert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('Please select a valid book');

  },

  'Book upload : Should get error uploading without book cover image' : function (client) {
    var alert = client.page.alert();
    var modalAlert = client.page.modalAlert();
    var grid = client.page.grid();
    var epubPath = path.resolve('./test/data/sample.epub');

    //  User book created in previous step
    grid.findAndClick('Product with book', 'Add');

    client
    .waitForElementVisible('.modal-dialog h3', 5000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Book');

    client.expect.element('#epubUpload > input[type="file"]').to.be.present;
    client.setValue('#epubUpload > input[type="file"]', epubPath);
    client.click('input[name="studentEpubTyp"]');

    client
    .click('[ng-model="layout.selected"]')
    .click('[ng-model="newBook.allowedPageNavigation"]')

    alert
    .click(".modal-dialog [ng-click='save()']");

    modalAlert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('Please select a cover image');
  },

  'Book upload : Add epub to product' : function (client) {
    var alert = client.page.alert();
    var modalAlert = client.page.modalAlert();
    var grid = client.page.grid();
    var epubPath = path.resolve('./test/data/sample.epub');
    var coverPath = path.resolve('./test/data/warandpeace.jpg');

    //  User book created in previous step
    grid.findAndClick('Product with book', 'Add');

    client
    .waitForElementVisible('.modal-dialog h3', 5000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Book');

    client.expect.element('#epubUpload > input[type="file"]').to.be.present;
    client.setValue('#epubUpload > input[type="file"]', epubPath);
    client.setValue('input[name="epubCoverUpload"]', coverPath);
    client.click('input[name="studentEpubTyp"]');

    client
    .click('[ng-model="layout.selected"]')
    .click('[ng-model="newBook.allowedPageNavigation"]')

    alert
    .click(".modal-dialog [ng-click='save()']");

    grid.getRowCell('Product with book', 3).text.to.equal('Processing...').after(10000);
    grid.getRowCell('Product with book', 3).text.to.equal('Complete').after(600000)
    client.useCss();
  },

  'Book upload : Add pdf to product' : function (client) {
    var alert = client.page.alert();
    var modalAlert = client.page.modalAlert();
    var grid = client.page.grid();
    var pdfPath = path.resolve('./test/data/warandpeace.pdf');
    var pdfCoverPath = path.resolve('./test/data/warandpeace.jpg');

    client.click('[ng-click="addProduct()"]')
    .waitForElementVisible('.modal-dialog h3', 10000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Product')

    client
    .setValue('[ng-model="newProduct.title"]', 'Product with pdf')
    .setValue('[ng-model="newProduct.author"]', 'Author name')
    .setValue('[ng-model="newProduct.description"]', 'A test description')
    .click('[ng-click="save()"]')
    .waitForElementNotPresent('.modal-dialog', 20000)

    alert
    .click('button.close');

    grid.findAndClick('Product with pdf', 'Add');

    client
    .waitForElementVisible('.modal-dialog h3', 5000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Book');

    client
    .click('li[heading="PDF"]');

    client.expect.element('#pdfUpload input[type="file"]').to.be.present;
    client.setValue('#pdfUpload input[type="file"]', pdfPath);
    client.setValue('input[name="pdfCoverUpload"]', pdfCoverPath);
    client.click('input[name="pdfTyp"]');//to unselect pdf zip
    alert
    .click(".modal-dialog [ng-click='save()']");

    grid.getRowCell('Product with pdf', 3).text.to.equal('Complete').after(600000)
    client.useCss();
  },
  'Book upload : Add same epub parallely to product' : function (client) {
    var alert = client.page.alert();
    var modalAlert = client.page.modalAlert();
    var grid = client.page.grid();

    client.click('[ng-click="addProduct()"]')
    .waitForElementVisible('.modal-dialog h3', 10000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Product')

    client
    .setValue('[ng-model="newProduct.title"]', 'Product with 2 books')
    .setValue('[ng-model="newProduct.author"]', 'Author name')
    .setValue('[ng-model="newProduct.description"]', 'A test description')
    .click('[ng-click="save()"]')
    .waitForElementNotPresent('.modal-dialog', 20000)

    alert
    .click('button.close');
    var epubPath = path.resolve('./test/data/sample.epub');
    var coverPath = path.resolve('./test/data/warandpeace.jpg');

    grid.findAndClick('Product with 2 books', 'Add');

    client
    .waitForElementVisible('.modal-dialog h3', 5000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Book');

    client.expect.element('#epubUpload > input[type="file"]').to.be.present;
    client.setValue('#epubUpload > input[type="file"]', epubPath);
    client.setValue('input[name="epubCoverUpload"]', coverPath);
    client.click('input[name="studentEpubTyp"]');

    client
    .click('[ng-model="layout.selected"]')
    .click('[ng-model="newBook.allowedPageNavigation"]')

    alert
    .click(".modal-dialog [ng-click='save()']");

    client.waitForElementVisible('[ng-click="addProduct()"]', 5000)
    .useXpath()
    .click("(//div[contains(@class, 'ui-grid-row')]//*[.='Product with 2 books']/ancestor::div[contains(concat(' ', @class, ' '), ' ui-grid-row')]//a[.='Add'])[2]")
    .useCss();

    client
    .waitForElementVisible('.modal-dialog h3', 5000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Book');

    client.expect.element('#epubUpload > input[type="file"]').to.be.present;
    client.setValue('#epubUpload > input[type="file"]', epubPath);
    client.setValue('input[name="epubCoverUpload"]', coverPath);
    client.click('input[name="studentEpubTyp"]');

    client
    .click('[ng-model="layout.selected"]')
    .click('[ng-model="newBook.allowedPageNavigation"]')

    alert
    .click(".modal-dialog [ng-click='save()']");

    grid.getRowCell('Product with 2 books', 4).text.to.equal('Complete').after(600000);
    grid.getRowCell('Product with 2 books', 3).text.to.equal('Complete').after(5000)
    client.useCss();
  }
};
