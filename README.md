# ious [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> use express middleware on socket.io namespaces

## Installation

```sh
$ npm install --save ious
```

## Usage

```js
// setup
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var ious = require('ious')(io);

// some friendly connect/express middlewares
var cookieParser = require('cookie-parser');
var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;

passport.use(new JwtStrategy({
  secretOrKey: 'YourSecretIsSafeWithMe',
  jwtFromRequest: function(request) {
    var token = null;
    if (request && request.cookies) {
      token = request.cookies.jwt;
    }
    return token;
  }
}, function (credentials, done) {
  // something like this
  require('./user').findOne({ id: credentials.userId }, function(error, user) {
    if(error) {
      return done(error);
    }
    if(user) {
      return done(null, user);
    }
    done(null, false);
  });
}));

// now we're cooking with fire
ious(cookieParser());
ious(passport.intialize());

// carry on...

io.on('connection', function (socket) {
  // only allow admin roles on this handler
  socket.on('do something as an admin', function (callback) {
    passport.authenticate('jwt', function (error, user, info) {
      if (error) {
        return callback(error);
      }
      if (info instanceof Error) {
        return callback(info);
      }
      if (!user || user.role !== 'admin') {
        return callback('User Not Authenticated');
      }
      // user is authenticated and authorized
      return require('./admin').doSomething(callback);
    })(socket.request, socket.request.res, callback);
  });
});
```
## License

ISC © [Buster Collings](https://about.me/buster)


[npm-image]: https://badge.fury.io/js/ious.svg
[npm-url]: https://npmjs.org/package/ious
[travis-image]: https://travis-ci.org/busterc/ious.svg?branch=master
[travis-url]: https://travis-ci.org/busterc/ious
[daviddm-image]: https://david-dm.org/busterc/ious.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/busterc/ious
