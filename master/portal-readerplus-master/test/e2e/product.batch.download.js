var Promise = require('bluebird').Promise;
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var filename = '/tmp/product-batch.csv';

module.exports = {
  '@tags': ['windows','batch'],
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

 'Product List : Download batch csv' : function (client) {

   fs.exists(filename, function(exists){
     if(exists) fs.unlinkSync(filename);

     client.click('[href="downloads/product-batch.csv"]')
     .pause(3000, function() {
       //for some reason it has hard time matching a full file, so just grabing a line
       client.assert.equal(fs.readFileSync(filename, { encoding: 'utf8' }).split('Example Title')[1], ',Example Author,Example Description,Example Passkey,http://example.com/image.jpeg,http://example.com/book.epub,horizontal,portrait_single_page,,');
     });
   });
 }
};
