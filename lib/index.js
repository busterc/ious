'use strict';

module.exports = function (namespace, middleware) {
  if (namespace && middleware) {
    return connect(namespace, middleware);
  }
  if (namespace) {
    return function (middleware) {
      return connect(namespace, middleware);
    };
  }
};

function connect(namespace, middleware) {
  namespace.use(function (socket, next) {
    return middleware(socket.request, socket.request.res, next);
  });
}
