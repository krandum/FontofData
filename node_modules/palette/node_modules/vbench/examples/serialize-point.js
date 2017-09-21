
/**
 * Module dependencies.
 */

var vbench = require('../');

var suite = vbench.createSuite({ min: 500 });

function serialize(name, point){
  return name + '|' + point.x + '|' + point.y;
}

function parse(str) {
  var parts = str.split('|');
  return [parts[0], ~~parts[1], ~~parts[2]];
}

suite.bench('serialize()', function(next){
  serialize('mousemove', { x: 50, y: 100 });
  next();
});

suite.bench('JSON.stringify()', function(next){
  JSON.stringify(['mousemove', { x: 50, y: 100 }]);
  next();
});

var str = serialize('mousemove', { x: 50, y: 100 });
suite.bench('parse()', function(next){
  parse(str);
  next();
});

var str = JSON.stringify(['mousemove', { x: 50, y: 100 }]);
suite.bench('JSON.parse()', function(next){
  JSON.parse(str);
  next();
});


suite.run();