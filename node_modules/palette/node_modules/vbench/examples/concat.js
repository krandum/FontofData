
/**
 * Module dependencies.
 */

var vbench = require('../');

var suite = vbench.createSuite();

var n = 150
  , vals = [];

while (n--) vals.push('test');

suite.bench('Array#join()', function(next){
  var arr = [];
  for (var i = 0, len = vals.length; i < len; ++i) {
    arr.push(vals[i]);
  }
  var str = arr.join('');
  next();
});

suite.bench('+=', function(next){
  var str = '';
  for (var i = 0, len = vals.length; i < len; ++i) {
    str += vals[i];
  }
  next();
});

suite.run();