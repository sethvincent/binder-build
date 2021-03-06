var fs = require('fs')
var URL = require('url')
var path = require('path')

var _ = require('lodash')
var request = require('request')
var format = require('string-format')
var urljoin = require('url-join')
var gunzip = require('gunzip-maybe')
var tar = require('tar')
var rimraf = require('rimraf')

var canProcess = function (name) {
  var url = URL.parse(name)
  return _.endsWith(url.hostname, 'github.com')
}

var fetchSource = function (source, dir, next) {
  var tarUrl = urljoin(source, '/archive/master.tar.gz')
  function fetch () {
    request(tarUrl)
      .pipe(gunzip())
      .pipe(tar.Extract({ path: dir, strip: 1 }))
    .on('error', function (err) {
      return next(err)
    })
    .on('end', function () {
      next(null, dir)
    })
  }
  fs.exists(dir, function (exists) {
    if (exists) {
      rimraf(path.resolve(dir), function (err) {
        if (err) return next(err)
        fetch()
      })
    } else {
      fetch()
    }
  })
}
var _processPath = function (source) {
  var url = URL.parse(source)
  return _.startsWith(url.pathname, '/') ? url.pathname.slice(1) : url.pathname
}

var generateName = function (source) {
  return _processPath(source).split('/').join('-')
}

var generateDisplayName = function (source) {
  return _processPath(source)
}

module.exports = {
  canProcess: canProcess,
  fetchSource: fetchSource,
  generateName: generateName,
  generateDisplayName: generateDisplayName
}

