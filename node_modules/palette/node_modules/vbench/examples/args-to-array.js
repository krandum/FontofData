
/**
 * Module dependencies.
 */

var vbench = require('../');

var suite = vbench.createSuite();

var args = (function(){ return arguments })('foo', 'bar', 'baz', 'raz');

var slice = [].slice;
suite.bench('[].slice.call()', function(next){
  slice.call(args);
  next();
});

function toArray(args) {
  var arr = [];
  for (var i = 0, len = args.length; i < len; ++i) {
    arr.push(args[i]);
  }
  return arr;
}

suite.bench('toArray()', function(next){
  toArray(args);
  next();
});

function toArrayLen(args) {
  var len = args.length
    , arr = new Array(len);
  for (var i = 0; i < len; ++i) {
    arr[i] = args[i];
  }
  return arr;
}

suite.bench('toArrayLen()', function(next){
  toArrayLen(args);
  next();
});

suite.bench('[].push.apply()', function(next){
  var arr = [];
  arr.push.apply(arr, args);
  next();
});

suite.run();