var portalCommands = {
  loginSchoolAdmin: function() {
    return this.waitForElementVisible('@cookieButton', 10000)
      .click('@cookieButton')
      .setValue('input[name=username]', 'test_school_admin@pearson.com')
      .setValue('input[type=password]', 'TldE996gbhoO')
      .click('@submitButton')
      .waitForElementVisible('.dropdown-toggle', 10000)
      .expect.element('.dropdown-toggle').text.to.equal('School Admin')
      //.waitForElementVisible('.ui-grid-row', 10000);
  },

  loginPearsonAdmin: function() {
    return this.waitForElementVisible('@cookieButton', 10000)
      .click('@cookieButton')
      .setValue('input[name=username]', 'rplus-admin@pearson.com')
      .setValue('input[type=password]', 'hudson102')
      .click('@submitButton')
      .waitForElementVisible('.dropdown-toggle', 10000)
      .expect.element('.dropdown-toggle').text.to.equal('ReaderPlus Admin')
      //.waitForElementVisible('.ui-grid-row', 10000);
  }
};

module.exports = {
  url: 'http://localhost:3001',
  commands: [portalCommands],
  elements: {
    submitButton: {
      selector: '.btn.btn-lg'
    },
    cookieButton: {
      selector: '.cookie-consent button'
    }
  }
};
