module.exports = {

  'Dont accept site cookie' : function (client) {
  	var auth = client.page.auth();

    auth.navigate()
	  .waitForElementVisible('.cookie-consent button', 1000)
	  .expect.element('.cookie-consent button').to.be.present;

		auth.setValue('input[name=username]', 'test_school_admin@pearson.com')
    .setValue('input[type=password]', 'TldE996gbhoO')
    .click('@submitButton');

		client.refresh()
		client.assert.urlContains('login');

    client.end();

  },

  'Accept site cookie' : function (client) {
  	var auth = client.page.auth();

    auth.navigate()
	  .waitForElementVisible('.cookie-consent button', 1000)
	  .click('.cookie-consent button')
	  .expect.element('.cookie-consent button').to.not.be.present;

    // client.end()
  }
};
