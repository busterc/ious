const assert = require('assert');
const ious = require('../index.js');

var SocketMock = function (namespace) {
  return {
    request: {
      res: {}
    },
    on: function (e, callback) {
      namespace.middlewares.forEach(function (middleware) {
        middleware(namespace.socket);
      });
      callback();
    },
    emit: function (e, callback) {
      this.on(e, callback);
    }
  };
};

var IoMock = function () {
  var io = {
    next: function () { },
    middlewares: [],
    use: function (fn) {
      this.middlewares.push(fn);
    }
  };
  io.socket = new SocketMock(io);
  return io;
};

var middlewareMock = function (secret) {
  return function (req, res) {
    req.secret = secret;
    res.worked = true;
  };
};

var anotherMiddlewareMock = function (secret) {
  return function (req, res) {
    req.anotherSecret = secret;
    res.workedAgain = true;
  };
};

describe('ious', function () {
  it('works when intialized only with a namespace, for currying', function () {
    var ioMock = new IoMock();
    var use = ious(ioMock);
    use(middlewareMock('icu'));
    use(anotherMiddlewareMock('icu2'));

    var socket = ioMock.socket;
    socket.on('whisper', function () {
      assert(true, socket.request.secret === 'icu');
      assert(true, socket.request.anotherSecret === 'icu2');
    });

    socket.emit('whisper', function () {
      assert(true, socket.request.res.worked);
      assert(true, socket.request.res.workedAgain);
    });
  });

  it('works when called statically with a namespace and middleware', function () {
    var ioMock = new IoMock();
    ious(ioMock, middlewareMock('icu'));

    var socket = ioMock.socket;
    socket.on('whisper', function () {
      assert(true, socket.request.secret === 'icu');
    });

    socket.emit('whisper', function () {
      assert(true, socket.request.res.worked);
    });
  });
});
