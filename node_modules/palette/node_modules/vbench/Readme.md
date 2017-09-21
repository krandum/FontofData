
# vbench

  visual benchmarking for node.js using [node-canvas](http://github.com/learnboost/node-canvas).

  ![](http://f.cl.ly/items/2h0G231k1E2B0s183f2S/Screenshot.png)

## Usage

  vbench uses the [uubench](https://github.com/akdubya/uubench) library, and node-canvas for charting. You may pass uubench `Suite` options to `vbench.createSuite()`, as well as vbench-specific options such as `path`.

```js
var vbench = require('../')
  , suite = vbench.createSuite({ path: 'my-benchmark.png' });

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
```

## Running Examples

     $ node examples/args-to-array.js && open out.png

## License 

(The MIT License)

Copyright (c) 2011 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.