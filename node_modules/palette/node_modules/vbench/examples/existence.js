
/**
 * Module dependencies.
 */

var vbench = require('../');

var suite = vbench.createSuite({ min: 500 });

var foo = { c: 'hey' }
  , bar = { __proto__: foo, b: 'hey' }
  , obj = { __proto__: bar, a: 'hey' };

suite.bench('in', function(next){
  'a' in obj;
  'b' in obj;
  'c' in obj;
  next();
});

suite.bench('.prop', function(next){
  obj.a;
  obj.b;
  obj.c;
  next();
});

suite.bench('hasOwnProperty()', function(next){
  obj.hasOwnProperty('a');
  obj.hasOwnProperty('b');
  obj.hasOwnProperty('c');
  next();
});

suite.run();