var server = require('./server');
var logger = require('./logger');

server.start(function () {
  console.log('server started: ', server.info);
  logger.info('server started: ', server.info);
});