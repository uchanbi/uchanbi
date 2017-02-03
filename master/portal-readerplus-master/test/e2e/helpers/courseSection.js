

var commands = {
  addCourseSection: function(name, code, instructor) {


    // console.log(this.api.page)
    var modalSelect = this.api.page.modalSelect();


    // this.api.pause(300);

    this
    .click('[ng-click="addSection()"]')
    .waitForElementVisible(".modal-dialog h3", 5000)
    .expect.element('.modal-dialog h3').text.to.equal('Create New Section')

    this
    .setValue('[ng-model="newCourseSection.name"]', name)
    .setValue('[ng-model="newCourseSection.sectionCode"]', code)

    modalSelect.selectOption(instructor);

    return this
    .click('[ng-model="newCourseSection.start"]')
    .click('.ui-state-default')
    .api.pause(500)
    .click('[ng-model="newCourseSection.end"]')
    .pause(500)
    .click('.ui-datepicker-calendar tbody tr:last-of-type .ui-state-default')
    .pause(500)
    .click('.modal-dialog .btn-primary')

  }
};

module.exports = {
  url: 'http://localhost:3001/#/school-admin',
  commands: [commands],
  elements: {}
};
