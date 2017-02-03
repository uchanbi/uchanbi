var winston = require('winston')
var config = require('../config');

function Logger(){
  var transports = [
    new winston.transports.File({
      filename: config.get('logger:filename'),
      maxsize: 1048576,
      maxFiles: 3,
      level: config.get('logger:level'),
      logstash: true
    })
  ];

  return new (winston.Logger)({
    transports: transports
  });
}

module.exports = Logger();