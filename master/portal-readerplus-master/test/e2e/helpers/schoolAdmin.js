var commands = {

  fillUserForm: function(firstName, lastName, role, email, password) {
    return this
    .click('[ng-click="addUser()"]')
    .waitForElementVisible('.modal-dialog [ng-click="$select.activate()"]', 10000)
    .api.pause(200)
    .click('.modal-dialog [ng-click="$select.activate()"]')
    .pause(300)
    .useXpath()
    .click("//div[contains(@class, 'modal-dialog')]//span[.='" + role + "']/..")
    .useCss()
    .setValue('[ng-model="newUser.firstName"]', firstName)
    .setValue('[ng-model="newUser.lastName"]', lastName)
    .setValue('[ng-model="newUser.email"]', email)
    .setValue('[ng-model="newUser.password"]', password)
    .click('.modal-dialog .btn-primary');
  }
};

module.exports = {
  url: 'http://localhost:3001/#/school-admin/user',
  commands: [commands],
  elements: {
    rows: {
      selector: '.ui-grid-row'
    }
  }
};
