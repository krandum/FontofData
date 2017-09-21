
/**
 * Module dependencies.
 */

var vbench = require('../');

var suite = vbench.createSuite();

suite.bench('500ms', function(next){
  setTimeout(next, 500);
});

suite.bench('1s', function(next){
  setTimeout(next, 1000);
});

suite.bench('2s', function(next){
  setTimeout(next, 2000);
});

suite.run();