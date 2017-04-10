# ious [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
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
var passport = require('passport'); // <- i recommend using the JWT strategy

// this is how we do it
ious(cookieParser());
ious(passport.intialize());

// carry on...
```
## License

ISC © [Buster Collings](https://about.me/buster)


[npm-image]: https://badge.fury.io/js/ious.svg
[npm-url]: https://npmjs.org/package/ious
[travis-image]: https://travis-ci.org/busterc/ious.svg?branch=master
[travis-url]: https://travis-ci.org/busterc/ious
[daviddm-image]: https://david-dm.org/busterc/ious.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/busterc/ious
[coveralls-image]: https://coveralls.io/repos/busterc/ious/badge.svg
[coveralls-url]: https://coveralls.io/r/busterc/ious
