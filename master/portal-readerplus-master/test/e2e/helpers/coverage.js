var fs = require('fs');
var coveragePath = require('path').resolve('./test/coverage/reports');

var commands = {
  saveCoverage: function(done) {

    var me = this;

    me.api.execute(getCoverage, function(res) {

      if(res.state === 'success' && res.value) {
        fs.writeFileSync(coveragePath + '/coverage.' + Math.random() + '.json', JSON.stringify(res.value));
      } else {
        console.log('Error writing coverage');
      }
      me.api.end(done)
    });
  }
};

module.exports = {
  url: 'http://localhost:3001',
  commands: [commands],
  elements: {}
};

var getCoverage = function() {
  return window.__coverage__;
}