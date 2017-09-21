
/*!
 * vbench
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var uubench = require('uubench')
  , Canvas = require('canvas')
  , fs = require('fs');

/**
 * Library version.
 */

exports.version = '0.1.0';

/**
 * Default color map.
 */

exports.colors = {
    'chart.background': '#e8eef6'
  , 'chart.bar.background': '#8da7d2'
  , 'chart.bar.highlight': '#99B1D8'
  , 'chart.border': '#eee'
  , 'chart.label.font': '12px Helvetica'
  , 'chart.label.color': '#888'
  , 'chart.label.highlight': '#C3D4EE'
};

/**
 * Create a `uubench.Suite` with the given `options`,
 * including vbench-specific options.
 *
 * Options:
 *
 *   - `path`  png output path defaulting to "./out.png"
 *   - `size`  canvas size (height) defaulting to 400 
 *
 * @param {Object} options
 * @api public
 */

exports.createSuite = function(options){
  var options = options || {}
    , path = options.path || 'out.png'
    , size = options.size || 400
    , data = {};

  options.start = function(){
    console.log();
  };

  options.result = function(name, stats){
    var ops = stats.iterations / stats.elapsed * 100;
    console.log('  \033[90m%s:\033[36m %s ops/s\033[0m'
      , pad(name, 25)
      , humanize(ops | 0));
    data[name] = ops | 0;
  };

  options.done = function(){
    var keys = Object.keys(data);
    var canvas = render(data, size);
    fs.writeFile(path, canvas.toBuffer());
    console.log();
  };

  return new uubench.Suite(options);
};

function pad(str, width) {
  return Array(width - str.length).join(' ') + str;
}

/**
 * Return the ops/s sorted descending.
 *
 * @param {Object} data
 * @return {Number}
 * @api private
 */

function sort(data) {
  return Object.keys(data).map(function(key){
    return data[key];
  }).sort(function(a, b){
    return b - a;
  });
}

/**
 * Humanize the given `n`.
 *
 * @param {Number} n
 * @return {String}
 * @api private
 */

function humanize(n) {
  var n = String(n).split('.')
  n[0] = n[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  return n.join('.')
}

/**
 * Render the given benchmark `data` with
 * the given canvas `size`.
 *
 * @param {Object} data
 * @param {Number} size
 * @api private
 */

function render(data, size) {
  var keys = Object.keys(data)
    , len = keys.length
    , ops = sort(data)
    , high = ops[0]
    , low = ops[ops.length - 1]
    , pad = 40
    , bw = 80
    , bp = 10.5
    , canvas = new Canvas(pad * 2 + (bw + bp)  * len - bp, size)
    , ctx = canvas.getContext('2d')
    , w = canvas.width
    , h = canvas.height;

  // border
  ctx.strokeStyle = exports.colors['chart.border'];
  ctx.strokeRect(pad + .5, pad + .5, w - pad * 2, h - pad * 2);

  // background
  ctx.fillStyle = exports.colors['chart.background'];
  ctx.fillRect(pad + 2, pad + 2, w - pad * 2 - 3, h - pad * 2 - 3);

  // bars
  var x = pad
    , max = size - pad * 2 - pad / 2;
  keys.forEach(function(key){
    var ops = data[key]
      , bh = max * (ops / high)
      , bx = x + bp
      , by = h - pad - bh - bp;

    // highlights
    ctx.strokeStyle = exports.colors['chart.bar.highlight'];
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bw, by);
    ctx.stroke();

    ctx.moveTo(bx + 1, by);
    ctx.lineTo(bx + 1, by + bh);
    ctx.stroke();

    // bar
    ctx.fillStyle = exports.colors['chart.bar.background'];
    ctx.fillRect(bx, by + 1, bw, bh);

    // ops/s label
    ctx.font = exports.colors['chart.label.font'];
    ctx.fillStyle = exports.colors['chart.label.highlight'];
    ops = humanize(ops);
    var width = ctx.measureText(ops).width;
    ctx.fillText(ops, bx + bw / 2 - width / 2, by + 20);

    // label
    ctx.fillStyle = exports.colors['chart.label.color'];
    var width = ctx.measureText(key).width
      , em = ctx.measureText('M').width;
    ctx.fillText(key, x + bw / 2 - width / 2, h - pad / 2 + em / 2);

    x += bw + 1.5;
  });

  return canvas;
}