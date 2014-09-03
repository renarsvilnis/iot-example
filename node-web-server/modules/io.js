// io.emit('web_user_count', [clientsWebCount, Object.keys(clientsInterspace).length]);
// socket.emit('id_init', [currentWebId]); // one user
// socket.broadcast.emit('pw_click_emit', [data[0], data[1]]);

module.exports.listen = function(app) {
  var server = exports.server =  require('http').Server(app);
  var io = exports.io = require('socket.io')(server);

  module.exports.io = io;
  module.exports.server = server;
}