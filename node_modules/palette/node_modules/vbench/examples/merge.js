
/**
 * Module dependencies.
 */

var vbench = require('../');

var suite = vbench.createSuite({ min: 500 });

var obj = { foo: 'bar', bar: 'bar', baz: 'baz' };

suite.bench('for/in', function(next){
  var other = {};
  for (var key in obj) other[key] = obj[key];
  next();
});

suite.bench('Object.keys()', function(next){
  var other = {};
  Object.keys(obj).forEach(function(key){
    other[key] = obj[key];
  });
  next();
});

suite.bench('Object.keys() for', function(next){
  var other = {}
    , keys = Object.keys(obj);

  for (var i = 0, len = keys.length; i < len; ++i) {
    other[keys[i]] = obj[keys[i]];
  }

  next();
});

suite.run();