var routes = require('./routes');
var Hapi = require('hapi');
var Inert = require('inert');
var h2o2 = require('h2o2');
var npid = require('npid');
var _ = require('underscore');
var config = require('./config');
var fs = require('fs');

//pid-file
if(!_.contains(['development', 'jenkins', 'test'], config.getEnv())) {
  var pid = npid.create('/var/run/gloss/web_portal.pid', true);
  pid.removeOnExit();
  console.log('pid', pid);
  process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
    process.exit(1);
  });
}

options = {
  cors : true,
  timeout : {
    socket : false
  }
}

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({
  host: '0.0.0.0',
  port: config.get('hapi:port'),
  routes: {
    cors: {
      origin : ['*'],
      headers : ['Authorization', 'Content-Type', 'If-None-Match', 'appid', 'token']
    }
  }
});

server.register(Inert, function () {});
server.register(h2o2, function () {});

//  Temporary route to get config
server.route({
  method: 'GET',
  path: '/utils/getbuild',
  config: {
    tags : ['api'],
    handler : function(request, reply) {
      reply(require('../build.json').build);
    }
  }
});

server.route({
  method: '*',
  path: '/api/{p*}',
  config : {
    payload: { maxBytes: 1000000000 },
    handler: {
      proxy: {
        timeout: 1800000,
        passThrough: true,
        mapUri: function(req, cb) {

          var baseUri = config.get('GLS:uri');
          var resourceUri = req.raw.req.url.replace('/api', '');

          cb(null, baseUri+resourceUri);
        }
      }
    }
  }
});

server.route({
  method: 'GET',
  path: '/',
  config: {
    handler : function(request, reply) {
      fs.readFile(config.get('app:baseURL') + '/index.html', 'utf8', function(err, html){
        if(!html) return reply('Cannot find index.html');
        var configScript = '    <script>window.glsConfig={ appId:"' + config.get('GLS:appId') + '"};</script>\n  </head>';
        reply(html.replace('</head>', configScript));
      });
    }
  }
});

//  Force file to be downloaded
server.route({
    method: 'GET',
    path: '/downloads/batch.csv',
    handler: {
      file: {
        path: 'dist/downloads/batch.csv',
        filename: 'batch.csv',
        mode: 'attachment'
      }
    }
});

server.route([
  { method: '*', path: '/{path*}', handler : {directory: { path: config.get('app:baseURL'), listing: false, index: false }}}
]);

module.exports = server;