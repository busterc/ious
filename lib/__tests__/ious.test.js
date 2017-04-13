'use strict';

var doneTesting = function () {
  throw new Error('Tests finished improperly.');
};

test('ious', function (done) {
  doneTesting = done;

  var eachAsync = require('async-each-series');
  var app = require('express')();
  var server = require('http').createServer(app);
  var io = require('socket.io')(server);
  var ioClient = require('socket.io-client');

  var port = process.env.PORT || 3000;
  var ioc = ioClient('http://localhost:' + port);

  var cookieParser = require('cookie-parser');
  var passport = require('passport');
  var jwt = require('jsonwebtoken');
  var JwtStrategy = require('passport-jwt').Strategy;

  var SECRET = 'WhatchaLookinAt?';

  passport.use(new JwtStrategy({
    secretOrKey: SECRET,
    jwtFromRequest: jwtCookieExtractor
  }, function (credentials, done) {
    var validUserId = 123;
    if (validUserId === credentials.userId) {
      return done(null, credentials);
    }
    return done(null, false, 'Invalid User ID');
  }));

  function jwtCookieExtractor(request) {
    var token = null;
    if (request && request.cookies) {
      token = request.cookies.jwt;
    }
    return token;
  }

  var ious = require('../index')(io);
  ious(cookieParser());
  ious(passport.initialize());

  server.listen(port, function () {
    ioc.on('start', function () {
      var emits = [
        'has socket.request.cookies',
        'set an invalid jwt cookie',
        'detects an invalid jwt cookie',
        'set a valid jwt cookie',
        'authenticates a valid jwt cookie'
      ];
      eachAsync(emits, function (ev, next) {
        ioc.emit(ev, function (error) {
          next(error);
        });
      }, function (error) {
        cleanup();
        if (error) {
          throw error;
        }
        doneTesting();
      });
    });

    io.on('connection', function (socket) {
      socket.on('has socket.request.cookies', function (callback) {
        var error;
        if (!socket.request.cookies) {
          error = 'socket.request.cookies exists';
        }
        callback(error);
      });

      socket.on('set an invalid jwt cookie', function (callback) {
        socket.request.cookies.jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOiJhZG1pbiIsImlhdCI6MTQ5MjAyNjY2N30.tkZXQ6xmo6WNBLoRzoS6qWhHZMn9Pzb9ZXRDrf1CjdI';
        callback();
      });

      socket.on('set a valid jwt cookie', function (callback) {
        var credentials = {
          userId: 123,
          username: 'admin',
          role: 'admin'
        };
        var token = jwt.sign(credentials, SECRET);
        socket.request.cookies.jwt = token;
        callback();
      });

      socket.on('detects an invalid jwt cookie', function (callback) {
        passport.authenticate('jwt', function (error, user, info) {
          if (error) {
            return callback(error);
          }
          if (info instanceof Error) {
            // Found an invalid cookie, as expected, so carry on
            return callback();
          }
          if (!user) {
            return callback('User Not Authenticated');
          }
          return callback();
        })(socket.request, socket.request.res, callback);
      });

      socket.on('authenticates a valid jwt cookie', function (callback) {
        passport.authenticate('jwt', function (error, user, info) {
          if (error) {
            return callback(error);
          }
          if (info instanceof Error) {
            return callback(info);
          }
          if (!user) {
            return callback('User Not Authenticated');
          }
          return callback();
        })(socket.request, socket.request.res, callback);
      });

      socket.emit('start');
    });

    function cleanup() {
      ioc.close();
      io.close();
    }
  });
});
