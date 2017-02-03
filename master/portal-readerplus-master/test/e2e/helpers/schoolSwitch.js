var commands = {
  selectSchool: function(value) {
    this.api.pause(300);

    return this.waitForElementVisible('.navbar [ng-click="$select.activate()"]', 10000)
    .click('.navbar [ng-click="$select.activate()"]')
    .api.useXpath()
    .click("//nav[contains(@class, 'navbar')]//span[.='" + value + "']/..")
    .useCss();
  }
};

module.exports = {
  url: 'http://localhost:3001',
  commands: [commands],
  elements: {}
};
