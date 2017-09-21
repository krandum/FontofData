
/**
 * Module dependencies.
 */

var vbench = require('../');

var suite = vbench.createSuite();

var n = 150
  , vals = [];

while (n--) vals.push('test');

function foo() {
  
}

suite.bench('()', function(next){
  foo(1,2,3);
  next();
});

suite.bench('.call()', function(next){
  foo.call(this, 1,2,3);
  next();
});

suite.bench('.apply()', function(next){
  foo.apply(this, [1,2,3]);
  next();
});


suite.run();