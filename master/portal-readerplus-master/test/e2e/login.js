module.exports = {

  afterEach : function(client, done) {
    var coverage = client.page.coverage();
    coverage.saveCoverage(done);
  },

  'Login : The page loads' : function (client) {
    var auth = client.page.auth();

    auth.navigate();

    client.expect.element(".form-signin").to.be.present;
    client.expect.element("input[type=text]").to.be.present;
    client.expect.element("input[type=password]").to.be.present;
    client.expect.element("button.btn-primary").to.be.present;

  },

  'Login : Will redirect to login if user has not signed in' : function (client) {
    var auth = client.page.auth();

    client.url('http://localhost:3001/#/pearson-admin/admin')
    .waitForElementVisible('body', 10000)
    .assert.urlContains('login');

  },

  'Login : Sign in as a student' : function (client) {
    var auth = client.page.auth();
    var alert = client.page.alert();

    auth.navigate();

    auth
    .setValue('input[name=username]', 'Joyce.Campbell@randomemail.com')
    .setValue('input[type=password]', 'hudson102')
    .click('@submitButton');

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('Error: Only admin users allowed to use the portal');

  },

  'Login : Sign in as a Pearson admin' : function (client) {
    var auth = client.page.auth();
    var alert = client.page.alert();

    auth.navigate();
    auth.loginPearsonAdmin();

    client.assert.urlContains('pearson-admin');

  },

  'Login : Sign in as a Pearson admin but browse to school dashboard' : function (client) {
    var auth = client.page.auth();
    var alert = client.page.alert();

    auth.navigate();
    auth.loginPearsonAdmin();

    client.url('http://localhost:3001/#/school-admin')
    .waitForElementVisible('body', 10000)
    .assert.urlContains('login');

  },

 'Login : Sign in as a school admin' : function (client) {
    var auth = client.page.auth();
    var alert = client.page.alert();

    auth.navigate();
    auth.loginSchoolAdmin();

    client.assert.urlContains('school-admin');

  },

  'Login : Will not stay in root when logged in' : function (client) {
    var auth = client.page.auth();
    var alert = client.page.alert();

    auth.navigate();
    auth.loginSchoolAdmin();

    client.url('http://localhost:3001/#/')
    .waitForElementVisible('body', 10000)
    .assert.urlContains('school-admin');

  },

  'Login : Sign in as a School admin but browse to pearson admin dashboard' : function (client) {
    var auth = client.page.auth();
    var alert = client.page.alert();

    auth.navigate();
    auth.loginSchoolAdmin();

    client.url('http://localhost:3001/#/pearson-admin')
    .waitForElementVisible('body', 10000)
    .assert.urlContains('login');

  },

  'Login : Sign in as school admin who is not assigned to a school' : function (client) {
    var auth = client.page.auth();
    var alert = client.page.alert();

    auth.navigate();

    auth
    .setValue('input[name=username]', 'admin@not.assigned.com')
    .setValue('input[type=password]', 'hudson102')
    .click('@submitButton');

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('Error: User is not registered to a school');

  },

  'Login : Validate required fields' : function (client) {
    var auth = client.page.auth();
    var alert = client.page.alert();

    auth.navigate();

    auth
    .setValue('input[name=username]', '')
    .setValue('input[type=password]', '')
    .click('@submitButton');

    alert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('Error: Please enter required fields');
  },
  'Login : Logout as school admin' : function (client) {
    var auth = client.page.auth();
    var alert = client.page.alert();

    auth.navigate();
    auth.loginSchoolAdmin()

    client.waitForElementVisible('.logout .dropdown-toggle', 10000)
      .click('.logout .dropdown-toggle')
      .waitForElementVisible('.logout .dropdown-menu', 10000)
      .click('.logout .dropdown-menu')
      .pause(500);

    client.assert.urlContains('login');

  }
};



