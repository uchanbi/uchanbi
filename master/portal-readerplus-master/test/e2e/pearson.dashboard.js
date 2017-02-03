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

  'Pearson Dashboard : The page loads with schools' : function (client) {

    client.elements('css selector', '.ui-grid-row', function(res){
      client.assert.ok(res.value.length === 3)
    });

  },

  'Pearson Dashboard : School filter by name' : function (client) {
   var filter = client.page.filter();

    filter.setFilter('Test School QA');

    client.elements('css selector', '.ui-grid-row', function(res){
      client.assert.ok(res.value.length === 1)
    });
  },

  'Pearson Dashboard : Add new school' : function (client) {
    var alert = client.page.alert();
    var grid = client.page.grid();

    var schoolName = 'A test school ' + Math.random();

    client.click('[ng-click="addSchool()"]')
    .waitForElementVisible('[ng-model="newSchool.name"]', 1000)
    .setValue('[ng-model="newSchool.name"]', schoolName)
    .setValue('[ng-model="newSchool.address1"]', 'Address 1')
    .setValue('[ng-model="newSchool.address2"]', 'Address 2')
    .setValue('[ng-model="newSchool.address3"]', 'Address 3')
    .setValue('[ng-model="newSchool.city', 'London')
    .setValue('[ng-model="newSchool.state', 'London')
    .setValue('[ng-model="newSchool.postcode', 'W1 6SD')
    .setValue('[ng-model="newSchool.website', 'http://www.example.com')
    .setValue('[ng-model="newSchool.phone', '0044111111111')
    .setValue('[ng-model="newSchool.fax', '0044111111112')
    .setValue('[ng-model="newSchool.email', 'info@exmaple.com')
    //.setValue('[ng-model="newSchool.image', 'http://www.example.com/pearson.jpg')
    .setValue('[ng-model="servers[0].url', 'https://server1.com')
    .click('.modal-dialog [ng-click="$select.activate()"]')
    .click('.ui-select-choices li a')
    .click('[ng-click="save(schoolForm)"]')

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('School ' + schoolName + ' successfully created');

    grid.expectCellTextPresent(schoolName);
    grid.expectCellTextPresent('["https://server1.com"]');
  },

  'Pearson Dashboard : View a school' : function (client) {
    var grid = client.page.grid();

    grid.findAndClick('Broadfields Primary School', 'View');

    client
    .waitForElementVisible('h1', 1000)
    .expect.element('h1').text.to.equal('Broadfields Primary School');

  },

};
