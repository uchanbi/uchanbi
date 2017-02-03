var Promise = require('bluebird').Promise;
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

module.exports = {

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

  'Product List : The page loads listing products' : function (client) {

    client.elements('css selector', '.ui-grid-row', function(res){
      client.assert.ok(res.value.length >= 3)
    });

  },

  'Product List : Filter products' : function (client) {
   var filter = client.page.filter();

    filter.setFilter('Mumm');

    client.elements('css selector', '.ui-grid-row', function(res){
      client.assert.ok(res.value.length === 1)
    });

  },

  'Product List : Add new product without epub' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();


    client.click('[ng-click="addProduct()"]')
    .waitForElementVisible('.modal-dialog h3', 10000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Product')

    client
    .setValue('[ng-model="newProduct.title"]', 'A test product')
    .setValue('[ng-model="newProduct.author"]', 'Author name')
    .setValue('[ng-model="newProduct.description"]', 'A test description')
    .click('[ng-click="save()"]')

    alert
    .waitForElementVisible('@alert', 50000)
    .expect.element('@alert').text.to.equal('Product A test product successfully created');

    grid.expectCellTextPresent('A test product');

  },

  'Product List : Edit existing product' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();

    client.click('[ng-click="addProduct()"]')
    .waitForElementVisible('.modal-dialog h3', 10000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Product')

    client
    .setValue('[ng-model="newProduct.title"]', 'A test to be edited product')
    .setValue('[ng-model="newProduct.author"]', 'Author name')
    .setValue('[ng-model="newProduct.description"]', 'A test description')
    .click('[ng-click="save()"]')
    .waitForElementNotPresent('.modal-dialog', 20000)

    alert
    .click('button.close')

    grid.findAndClick('A test to be edited product', 'Edit');
    client
    .clearValue('[ng-model="newProduct.title"]')
    .setValue('[ng-model="newProduct.title"]', 'New Title')
    .clearValue('[ng-model="newProduct.author"]')
    .clearValue('[ng-model="newProduct.description"]')
    .click('[ng-click="update()"]')
    .waitForElementNotPresent('.modal-dialog', 20000);

     alert
    .waitForElementVisible('@alert', 50000)
    .expect.element('@alert').text.to.equal('Product New Title successfully updated');
  },

  // 'Product List : Delete existing product' : function (client) {
  //   var alert = client.page.alert();
  //   var grid = client.page.grid();
  //
  //   client.click('[ng-click="addProduct()"]')
  //   .waitForElementVisible('.modal-dialog h3', 5000)
  //   .expect.element('.modal-dialog h3').text.to.equal('Add Product')
  //
  //   client
  //   .setValue('[ng-model="newProduct.title"]', 'A test to be deleted product')
  //   .setValue('[ng-model="newProduct.author"]', 'Author name')
  //   .setValue('[ng-model="newProduct.description"]', 'A test description')
  //   .click('[ng-click="save()"]')
  //   .waitForElementNotPresent('.modal-dialog', 20000)
  //
  //   grid.findAndClick('A test to be deleted product', 'Delete');
  //
  //   client
  //   .waitForElementVisible('[ng-click="delete()"]', 5000)
  //   .click('[ng-click="delete()"]');
  //
  //   client.pause(2000);
  //
  //   alert
  //   .waitForElementVisible('@alert', 5000)
  //   .expect.element('@alert').text.to.equal('Successfully deleted product');
  //
  // },

  'Product List : Batch upload products' : function (client) {
    var alert = client.page.alert();
    var fileToUpload = './test/data/product-batch.csv';
    var absolutePath = path.resolve(fileToUpload);
    var data = 'Title,Author,Description,Passkey,Cover Image URL,ePub URL,Page Navigation,Layout,Has Teacher Version,Teacher ePub URL\n'
             + 'Example Title 1,Example Author 1,Example Description 1,Example Passkey 1,http://example.com/image1.jpeg,http://example.com/book1.epub,horizontal,portrait_single_page,,\n'
             + 'Example Title 2,Example Author 2,Example Description 2,Example Passkey 2,http://example.com/image2.jpeg,http://example.com/book2.epub,horizontal,portrait_single_page,Yes,http://www.example.com/123';

    Promise
    .resolve()
    .then(function() {
      return fs.writeFile(fileToUpload, data);
    })
    .then(function() {
      client.setValue('input[type="file"]', absolutePath);

      alert
      .waitForElementVisible('@alert', 20000)
      .expect.element('@alert').text.to.equal('2 products successfully uploaded');
    })
    .catch(function() {});
  },

  'Product List : Batch upload products wrong data' : function (client) {
    var alert = client.page.alert();
    var fileToUpload = './test/data/product-batch.csv';
    var absolutePath = path.resolve(fileToUpload);
    var data = 'Title,Author,Description,Passkey,Cover Image URL,ePub URL,Page Navigation,Layout,Has Teacher Version,Teacher ePub URL\n'
             + 'Example Title 1,Example Author 1,Example Description 1,Example Passkey 1,http://example.com/image1.jpeg,http://example.com/book1.epub,wronglayout,portrait_single_page,,';

    Promise
    .resolve()
    .then(function() {
      return fs.writeFile(fileToUpload, data);
    })
    .then(function() {
      client.setValue('input[type="file"]', absolutePath);
      alert
      .waitForElementVisible('@alert', 20000)
      .expect.element('@alert').text.to.equal('The following products were not created:\nExample Title 1 - Product validation failed');
    })
    .catch(function() {});
  },

  'Product List : Batch upload products corrupt data' : function (client) {
    var alert = client.page.alert();
    var fileToUpload = './test/data/product-batch.csv';
    var absolutePath = path.resolve(fileToUpload);
    var data = 'Title,Author,Description,Passkey,Cover Image URL,ePub URL,Page Navigation,Layout,Has Teacher Version,Teacher ePub URL\n'
             + 'Example Title 1,Example Author 1,Example Description 1,Example Passkey 1,http://example.com/image1.jpeg,,';

    Promise
    .resolve()
    .then(function() {
      return fs.writeFile(fileToUpload, data);
    })
    .then(function() {
      client.setValue('input[type="file"]', absolutePath);

      alert
      .waitForElementVisible('@alert', 20000)
      .expect.element('@alert').text.to.equal('Too few fields: expected 10 fields but parsed 7');
    })
    .catch(function() {});
  },

  'Product List : Batch upload products with an empty cvs row' : function (client) {
    var alert = client.page.alert();
    var fileToUpload = './test/data/product-batch.csv';
    var absolutePath = path.resolve(fileToUpload);
    var data = 'Title,Author,Description,Passkey,Cover Image URL,ePub URL,Page Navigation,Layout,Has Teacher Version,Teacher ePub URL\n'
             + 'Example Title 1,Example Author 1,Example Description 1,Example Passkey 1,http://example.com/image1.jpeg,http://example.com/book1.epub,horizontal,portrait_single_page,,\n'
             + ',,,,,,,,,';

    Promise
    .resolve()
    .then(function() {
      return fs.writeFile(fileToUpload, data);
    })
    .then(function() {
      client.setValue('input[type="file"]', absolutePath);

      alert
      .waitForElementVisible('@alert', 20000)
      .expect.element('@alert').text.to.equal('1 products successfully uploaded');
    })
    .catch(function() {});
  },

  'Product List : Batch upload products with some mandatory fields empty in a row' : function (client) {
    var alert = client.page.alert();
    var fileToUpload = './test/data/product-batch.csv';
    var absolutePath = path.resolve(fileToUpload);
    var data = 'Title,Author,Description,Passkey,Cover Image URL,ePub URL,Page Navigation,Layout,Has Teacher Version,Teacher ePub URL\n'
             + 'Example Title 1,Example Author 1,Example Description 1,Example Passkey 1,http://example.com/image1.jpeg,http://example.com/book1.epub,horizontal,portrait_single_page,,\n'
             + ',,Example Description 1,Example Passkey 1,http://example.com/image1.jpeg,,,,,';

    Promise
    .resolve()
    .then(function() {
      return fs.writeFile(fileToUpload, data);
    })
    .then(function() {
      client.setValue('input[type="file"]', absolutePath);

      alert
      .waitForElementVisible('@alert', 20000)
      .expect.element('@alert').text.to.equal('The following products were not created:\n- child "epubURL" fails because ["epubURL" is not allowed to be empty]');
    })
    .catch(function() {});
  },

  'Product List : Batch upload products with only optional fields empty in a row' : function (client) {
    var alert = client.page.alert();
    var fileToUpload = './test/data/product-batch.csv';
    var absolutePath = path.resolve(fileToUpload);
    var data = 'Title,Author,Description,Passkey,Cover Image URL,ePub URL,Page Navigation,Layout,Has Teacher Version,Teacher ePub URL\n'
             + 'Example Title 1,Example Author 1,Example Description 1,Example Passkey 1,http://example.com/image1.jpeg,http://example.com/book1.epub,horizontal,portrait_single_page,,\n'
             + 'Example Title 2,,,,http://example.com/image1.jpeg,http://example.com/book1.epub,horizontal,portrait_single_page,,';

    Promise
    .resolve()
    .then(function() {
      return fs.writeFile(fileToUpload, data);
    })
    .then(function() {
      client.setValue('input[type="file"]', absolutePath);

      alert
      .waitForElementVisible('@alert', 20000)
      .expect.element('@alert').text.to.equal('2 products successfully uploaded');
    })
    .catch(function() {});
  }

};
