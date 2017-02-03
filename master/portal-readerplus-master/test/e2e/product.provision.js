module.exports = {

  beforeEach : function(client) {
    var auth = client.page.auth();

    auth.navigate()
    auth.loginSchoolAdmin();

  },

  afterEach : function(client, done) {
    var coverage = client.page.coverage();
    coverage.saveCoverage(done);
  },

  'Product Provision : I try to add a title to the course section without selecting title' : function (client) {
    var grid = client.page.grid();
    var modalAlert = client.page.modalAlert();

    grid.findAndClick('Math 101', 'Details');

    client
    .waitForElementVisible("[ng-click='addTitle()']", 5000)
    .click("[ng-click='addTitle()']")
    .waitForElementVisible('.modal-dialog h3', 10000)
    .expect.element('.modal-dialog h3').text.to.equal("Add Title to Course Section")

    client
    .click("[ng-click='add()']")

    modalAlert
    .waitForElementVisible('@alert', 10000)
    .expect.element('@alert').text.to.equal('Please select a title');

  },

  'Product Provision : I add a title to the course section with no products' : function (client) {
    var grid = client.page.grid();
    var alert = client.page.alert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Math 101', 'Details');

    client
    .waitForElementVisible("[ng-click='addTitle()']", 5000)
    .click("[ng-click='addTitle()']")
    .waitForElementVisible('.modal-dialog h3', 5000)
    .expect.element('.modal-dialog h3').text.to.equal("Add Title to Course Section")

    modalSelect.selectOption('All About Mummies');

    client
    .click("[ng-click='add()']")

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Title All About Mummies successfully added to course section');

    grid.expectCellTextPresent('All About Mummies');

  },

  'Product Provision : I add an exising title to the course section' : function (client) {
    var grid = client.page.grid();
    var alert = client.page.alert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Math 101', 'Details');

    client
    .waitForElementVisible("[ng-click='addTitle()']", 5000)
    .click("[ng-click='addTitle()']")
    .waitForElementVisible('.modal-dialog h3', 5000)
    .expect.element('.modal-dialog h3').text.to.equal("Add Title to Course Section");

    modalSelect.selectOption('All About Mummies');

    client
    .click("[ng-click='add()']")

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Provision already exists');

  },

  'Product Provision : I see details of an added product' : function (client) {
    var grid = client.page.grid();
    var alert = client.page.alert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Math 101', 'Details');

    client.pause(2000);

    grid.findAndClick('All About Mummies', 'Details');

    client
    .waitForElementVisible('.modal-dialog h3', 5000)
    .expect.element('.modal-dialog h3').text.to.equal("Title Details")

    client.expect.element(".product-title").text.to.equal('All About Mummies')
    client.expect.element(".product-author").text.to.equal('Dianne Irving')
    client.expect.element(".product-layout:first-child").text.to.equal('Portrait Single Page')
    client.expect.element(".product-layout:last-child").text.to.equal('Landscape Double Page')
    client.expect.element(".product-allowed-navigation").text.to.equal('Allowed page navigation: Horizontal')

    client.end();
  },

  'Product Provision : I remove an exising title from the course section' : function (client) {
    var grid = client.page.grid();
    var alert = client.page.alert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Math 101', 'Details');

    client.pause(2000);

    grid.findAndClick('All About Mummies', 'Remove');

    client
    .waitForElementVisible(".modal-dialog h3", 5000)
    .click(".modal-dialog [ng-click='remove()']")

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.contain('Title All About Mummies successfully removed from course section');

    grid.expectCellTextNotPresent('All About Mummies');

  },
  'Product Provision : I add same title to another course section having same license with same instructor' : function (client) {
    var grid = client.page.grid();
    var alert = client.page.alert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Afrikaans 400', 'Details');

    client
    .waitForElementVisible("[ng-click='addTitle()']", 5000)
    .expect.element('h4 :nth-child(5)').text.to.equal('Jane Smith');

    client
    .click("[ng-click='addTitle()']")
    .waitForElementVisible('.modal-dialog h3', 5000)
    .expect.element('.modal-dialog h3').text.to.equal("Add Title to Course Section")

    modalSelect.selectOption('Some Test Title');

    client
    .click("[ng-click='add()']")

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Title Some Test Title successfully added to course section');

    grid.expectCellTextPresent('Some Test Title');
    grid.expectCellTextPresent('49');

    client
    .waitForElementVisible('.main [ng-click="$select.activate()"]', 5000)
    .click('.main [ng-click="$select.activate()"]')
    .useXpath()
    .click("//div[contains(@ng-model, 'courseSection')]//span[.='Afrikaans 500']/..")
    .useCss();

    client
    .waitForElementVisible("[ng-click='addTitle()']", 5000)
    .expect.element('h4 :nth-child(5)').text.to.equal('Jane Smith');
    client
    .click("[ng-click='addTitle()']")
    .waitForElementVisible('.modal-dialog h3', 5000)
    .expect.element('.modal-dialog h3').text.to.equal("Add Title to Course Section")

    modalSelect.selectOption('Some Test Title');

    client
    .click("[ng-click='add()']")

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Title Some Test Title successfully added to course section');

    grid.expectCellTextPresent('Some Test Title');
    grid.expectCellTextPresent('49');

  },

  'Product Provision : I add same student to another course section having same license' : function (client) {
    var grid = client.page.grid();
    var alert = client.page.alert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Afrikaans 400', 'Details');

    client
    .waitForElementVisible("[ng-click='addTitle()']", 5000)
    .click("[ng-click='addStudentToCourseSection()']")
    .waitForElementVisible('.modal-dialog h3', 5000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Students to Course Section');

    client
    .useXpath()
    .click("//strong[.='Geetha Muthyam']/..")
    .useCss()
    .click("[ng-click='add()']")

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('User Geetha Muthyam successfully added to course section');

    grid.expectCellTextPresent('Geetha Muthyam');
    grid.expectCellTextPresent('48');

    client
    .waitForElementVisible('.main [ng-click="$select.activate()"]', 5000)
    .click('.main [ng-click="$select.activate()"]')
    .useXpath()
    .click("//div[contains(@ng-model, 'courseSection')]//span[.='Afrikaans 500']/..")
    .useCss();

    client
    .waitForElementVisible("[ng-click='addTitle()']", 5000)
    .click("[ng-click='addStudentToCourseSection()']")
    .waitForElementVisible('.modal-dialog h3', 5000)
    .expect.element('.modal-dialog h3').text.to.equal('Add Students to Course Section');

    client
    .useXpath()
    .click("//strong[.='Geetha Muthyam']/..")
    .useCss()
    .click("[ng-click='add()']")

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('User Geetha Muthyam successfully added to course section');

    grid.expectCellTextPresent('Geetha Muthyam');
    grid.expectCellTextPresent('48');
  },

  'Product Provision : I remove same student from another course section having same license' : function (client) {
    var grid = client.page.grid();
    var alert = client.page.alert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Afrikaans 400', 'Details');

    client
    .waitForElementVisible("[ng-click='addTitle()']", 5000)

    grid.findAndClick('Geetha Muthyam', 'Remove');

    client
    .waitForElementVisible(".modal-dialog h3", 5000)
    .click(".modal-dialog [ng-click='remove()']")

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.contain('Geetha Muthyam successfully removed from course section');

    grid.expectCellTextNotPresent('Geetha Muthyam');
    grid.expectCellTextPresent('48');
  },

  'Product Provision : I remove a student from another course section having same license' : function (client) {
    var grid = client.page.grid();
    var alert = client.page.alert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Afrikaans 500', 'Details');

    client
    .waitForElementVisible("[ng-click='addTitle()']", 5000)

    grid.findAndClick('Geetha Muthyam', 'Remove');

    client
    .waitForElementVisible(".modal-dialog h3", 5000)
    .click(".modal-dialog [ng-click='remove()']")

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.contain('Geetha Muthyam successfully removed from course section');

    grid.expectCellTextNotPresent('Geetha Muthyam');
    grid.expectCellTextPresent('49');
  },

  'Product Provision : I change instructor of another course section having same license and same instructor' : function (client) {
    var grid = client.page.grid();
    var alert = client.page.alert();
    var modalSelect = client.page.modalSelect();

    grid.findAndClick('Afrikaans 500', 'Details');

    client
    .waitForElementVisible("[ng-click='editSection()']", 5000)
    .click("[ng-click='editSection()']")
    .waitForElementVisible(".modal-dialog h3", 10000)
    .expect.element('.modal-dialog h3').text.to.equal('Edit Section');

    client
     .expect.element('.modal-dialog [ng-click="$select.activate()"]').text.to.equal('Jane Smith');


    client
    .click('.modal-dialog [ng-click="$select.activate()"]')
    .useXpath()
    .click("//span[.='Mehdi Avdi']/..")
    .useCss()
    .click("[ng-click='update()']")

    alert
    .waitForElementVisible('@alert', 5000)
    .expect.element('@alert').text.to.equal('Course section Afrikaans 500 successfully updated');

    client
    .expect.element('h4 :nth-child(5)').text.to.equal('Mehdi Avdi');

    grid.expectCellTextPresent('48');
  }

};
