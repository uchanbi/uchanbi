var commands = {
  findAndClick: function(value, button) {

    return this.waitForElementVisible('@rows', 10000)
    .api.useXpath()
    .click("//div[contains(@class, 'ui-grid-row')]//*[.='" + value + "']/ancestor::div[contains(concat(' ', @class, ' '), ' ui-grid-row')]//a[.='" + button + "']")
    .useCss();

  },

  getRowCell: function(rowValue, cell) {
    return this.api.useXpath().expect.element("//div[contains(@class, 'ui-grid-row')]//*[.='" + rowValue + "']/ancestor::div[contains(concat(' ', @class, ' '), ' ui-grid-row')]//div[contains(concat(' ', @class, ' '), ' ui-grid-cell ')][" + cell + "]")
  },

  expectCellTextPresent: function(value) {

    this.waitForElementVisible('@rows', 10000)
    this.api.useXpath()
    this.expect.element("//div[contains(@class, 'ui-grid-row')]//*[.='" + value + "']").to.be.present

    return this.api.useCss();
  },

  expectCellTextNotPresent: function(value) {

    this.waitForElementVisible('@rows', 10000)
    this.api.useXpath()
    this.expect.element("//div[contains(@class, 'ui-grid-row')]//*[.='" + value + "']").to.not.be.present

    return this.api.useCss();
  }
};

module.exports = {
  url: 'http://localhost:3001',
  commands: [commands],
  elements: {
    rows: {
      selector: '.ui-grid-row'
    }
  }
};
