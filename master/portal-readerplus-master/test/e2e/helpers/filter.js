var commands = {
  setFilter: function(value) {
    this.api.pause(1000);
    return this.waitForElementVisible('@filterField', 5000)
      .setValue('@filterField', value);
  }
};

module.exports = {
  url: 'http://localhost:3001',
  commands: [commands],
  elements: {
    filterField: {
      selector: '.table-header input'
    }
  }
};
