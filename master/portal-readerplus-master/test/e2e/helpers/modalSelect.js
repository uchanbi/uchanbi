var commands = {
  selectOption: function(value) {
    this.api.pause(300);

    return this.waitForElementVisible('.modal-dialog [ng-click="$select.activate()"]', 10000)
    .click('.modal-dialog [ng-click="$select.activate()"]')
    .api.useXpath()
    .click("//div[contains(@class, 'modal-dialog')]//span[.='" + value + "']/..")
    .useCss();

  }
};

module.exports = {
  url: 'http://localhost:3001',
  commands: [commands],
  elements: {}
};
