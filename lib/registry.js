var path = require('path')
var mongoose = require('mongoose')
var fs = require('fs-extra')

var yaml = require('js-yaml')

var TemplateSchema = {
  'name': { type: String, index: { unique: true } },
  'image-name': String,
  'image-source': String,
  'limits': {
    'memory': String,
    'cpu': String
  },
  'services': [{
    'name': String,
    'version': String,
    'params': mongoose.Schema.Types.Mixed
  }],
  'time-created': { type: Date, default: Date.now },
  'time-modified': { type: Date, default: Date.now },
  'command': [String],
  'port': Number
}

var createTemplate = function (model, name, source, dir, cb) {
  fs.readdir(dir, function (err, files) {
    if (err) return cb(err)
    var template = {
      'image-name': name,
      'name': name,
      'image-source': source,
      'port': 8888
    }
    _storeTemplate(model, template, cb)
  })
}

var _storeTemplate = function (model, template, cb) {
  var conditions = { name: template.name }
  var updateParams = { upsert: true, new: true, overwrite: true }
  model.findOneAndUpdate(conditions, template, updateParams, function (err, obj) {
    if (err) return cb(err)
    return cb(null, {
      'time-created': obj['time-created'],
      'time-modified': obj['time-modified'],
      'name': obj['name']
    })
  })
}

var getTemplate = function (model, name, cb) {
  model.findOne({ name: name }, function (err, template) {
    if (err) return cb(err)
    return cb(null, template)
  })
}

var getAllTemplates = function (model, cb) {
  model.find({}, function (err, templates) {
    if (err) return cb(err)
    return cb(null, templates)
  })
}

module.exports = {
  TemplateSchema: TemplateSchema,
  createTemplate: createTemplate,
  getTemplate: getTemplate,
  getAllTemplates: getAllTemplates
}
