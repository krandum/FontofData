// # Place all the behaviors and hooks related to the matching controller here.
// # All this logic will automatically be available in application.js.
// # You can use CoffeeScript in this file: http://coffeescript.org/

$(document).on('ready page:load', function() {
	var play_check = document.getElementById('play');
	if (typeof(play_check) == 'undefined' || play_check == null) {
		console.log('aborting play.js due to no element with id play');
		return;
	}

	var canvas = document.getElementById("myCanvas");

	function mouseDown(e) {
		if (parseInt(navigator.appVersion) > 3) {
			var evt = e ? e : window.event;
			var delta = evt.wheelDelta ? evt.wheelDelta / 120
				: evt.detail ? -evt.detail : 0;
			/* For canvas scrolling */
			if (delta > 0) { // Scroll up
				console.log("Scrolling up");
			} else { // Scroll down
				console.log("Scrolling down");
			}
		}
		return true;
	}

	if (parseInt(navigator.appVersion) > 3) {
		canvas.onmousewheel = mouseDown;
		if (navigator.appName == "Netscape"
			&& parseInt(navigator.appVersion) == 4) {
			canvas.captureEvents(Event.MOUSEDOWN);
		}
	}

	var scope = new paper.PaperScope();
	scope.setup(canvas);

	var game_data = {
		node_factions: [],
		active_nodes: [],
		buffer_nodes: [],
		selected_nodes: [],
		action_index: -1,
		actions: [],
		animations: [],
		colors: {
			1: { // Neutral
				line: '#ffffff',
				num: '#ffffff',
				fill: '#8E8E8E',
				selected: '#ffffff',
				glow: '#ffffff'
			},
			2: { // Red Rocks
				line: '#e52d00',
				num: '#e52d00',
				fill: '#FAF9F9',
				selected: '#e98a15',
				glow: '#e98a15'
			},
			3: { // Green Elves
				line: '#edeec0',
				num: '#edeec0',
				fill: '#5eb22e',
				selected: '#97FC9C',
				glow: '#97FC9C'
			},
			4: { // Blue Jellyfish
				line: '#C9f0ff',
				num: '#C9f0ff',
				fill: '#2188dd',
				selected: '#8c2bbc',
				glow: '#8c2bbc'
			}
		},
		global_root: null,
		current_target: null,
		global_target: null
	};

	function get_initial_node_data() {
		$.ajax({
			type: "GET",
			url: "request_nodes",
			data: {
				ranges: [{
					from: 1,
					to: 63
				}]
			},
			datatype: "html",
			success: function (raw) {
				var data = JSON.parse(raw);
				in_nodes = data['nodes'];
				var i = 1;
				while (i < 64)
				{
					game_data.node_factions[i] = in_nodes[i]['faction_id'];
					i++;
				}
				game_data.active_nodes = build_nodes(6, scope.view.size.width,
					scope.view.size.height);
				console.log(game_data.active_nodes);
			},
			async: true
		});
	}

	function get_node(elem, center, size, thickness) {
		var num_digits = elem.toString().length;
		var node_color = game_data.colors[game_data.node_factions[elem].toString()];
		var half_size = size / 2;
		var sine_size = size / 2.3;
		var tan_size = size / 3.7;
		let quarter_size = size / 4;
		var basis = new scope.Path();
		var p1, p2, p3, p4, p5, p6, p7;
		var proper1, proper2, proper3, proper4;
		var partial1, partial2;
		if (elem % 2 == 0)
		{
			p1 = new scope.Point(center.x, center.y + half_size);
			p2 = new scope.Point(center.x - half_size, center.y);
			p3 = new scope.Point(center.x, center.y - half_size);
			p4 = new scope.Point(center.x + half_size, center.y);
			p5 = new scope.Point(center.x + sine_size, center.y + quarter_size);
			p6 = new scope.Point(center.x + quarter_size, center.y + sine_size);
			p7 = new scope.Point(center.x + sine_size, center.y + sine_size);
			proper1 = new scope.Segment(p1, new scope.Point(size / 10, 0), new scope.Point(-tan_size, 0));
			proper2 = new scope.Segment(p2, new scope.Point(0, tan_size), new scope.Point(0, -tan_size));
			proper3 = new scope.Segment(p3, new scope.Point(-tan_size, 0), new scope.Point(tan_size, 0));
			proper4 = new scope.Segment(p4, new scope.Point(0, -tan_size), new scope.Point(0, size/10));
			partial1 = new scope.Segment(p5, new scope.Point(size/20, -size/12.5), new scope.Point(-size/25, size/16.7));
			partial2 = new scope.Segment(p6, new scope.Point(size/16.7, -size/25), new scope.Point(-size/12.5, size/20));
		}
		else
		{
			p1 = new scope.Point(center.x, center.y + half_size);
			p2 = new scope.Point(center.x + half_size, center.y);
			p3 = new scope.Point(center.x, center.y - half_size);
			p4 = new scope.Point(center.x - half_size, center.y);
			p5 = new scope.Point(center.x - sine_size, center.y + quarter_size);
			p6 = new scope.Point(center.x - quarter_size, center.y + sine_size);
			p7 = new scope.Point(center.x - sine_size, center.y + sine_size);
			proper1 = new scope.Segment(p1, new scope.Point(-size / 10, 0), new scope.Point(tan_size, 0));
			proper2 = new scope.Segment(p2, new scope.Point(0, tan_size), new scope.Point(0, -tan_size));
			proper3 = new scope.Segment(p3, new scope.Point(tan_size, 0), new scope.Point(-tan_size, 0));
			proper4 = new scope.Segment(p4, new scope.Point(0, -tan_size), new scope.Point(0, size / 10));
			partial1 = new scope.Segment(p5, new scope.Point(-size/20, -size/12.5), new scope.Point(size/25, size/16.7));
			partial2 = new scope.Segment(p6, new scope.Point(-size/16.7, -size/25), new scope.Point(size/12.5, size/20));
		}
		basis.add(proper1);
		basis.add(proper2);
		basis.add(proper3);
		basis.add(proper4);
		basis.add(partial1);
		basis.add(p7);
		basis.add(partial2);
		basis.closed = true;

		basis.strokeWidth = thickness;
		basis.strokeColor = node_color['line'];
		basis.fillColor = node_color['fill'];

		var num_w = sine_size * Math.pow(1.2, num_digits);
		var num_h = (num_w / num_digits) * 1.4;
		num = new scope.PointText(center);
		num.fillColor = node_color['num'];
		num.content = elem.toString();
		num.bounds = new scope.Rectangle({
			point: [center.x - num_w / 2, center.y - num_h / 2],
			size: [num_w, num_h]
		});

		let out_node = new scope.Group(basis, num);
		let selected = false;
		let myBounds = out_node.bounds;

		out_node.onMouseEnter = function(event) {
			out_node.scale(1.1);
		}

		out_node.onMouseLeave = function(event) {
			out_node.scale(0.9090909);
		}

		var relative_pos = {
			x: center.x / scope.view.size.width,
			y: center.y / scope.view.size.height,
			size_dx: out_node.bounds.width / scope.view.size.height,
			size_dy: out_node.bounds.height / scope.view.size.height
		};

		let total_node = {
			value: elem,
			group: out_node,
			relative_pos: relative_pos,
			selected: false
		};

		out_node.onClick = function(event) {
			select_node(total_node);
		}

		return total_node;
	}

	function build_nodes(num_layers, width, height) {
		var nodes = [];
		var layer_height = height / 3;
		var node_height = height / 4;
		var y = height - (layer_height / 2);
		var point = new scope.Point();
		var index = 1;
		var i = 0;
		var thickness = 5;
		while (i < num_layers) {
			var num_sub = Math.pow(2, i);
			var j = 0;
			point.y = y;
			point.x = (width / num_sub) / 2;
			while (j < num_sub) {
				var new_node = get_node(index, point, node_height, thickness);
				nodes.push(new_node);
				point.x += width / num_sub;
				j++;
				index++;
			}
			node_height /= 1.5;
			y -= layer_height / 2;
			layer_height /= 1.5;
			y -= layer_height / 2;
			i++;
			if (thickness > 1)
			{
				thickness--;
			}
		}
		return nodes;
	}

	function set_resize() {
		scope.view.onResize = function(event) {
			var width = scope.view.size.width;
			var height = scope.view.size.height;
			var i = 0;
			while (i < 63) {
				cur_node = game_data.active_nodes[i];
				cur_node.group.position.x = cur_node.relative_pos.x * width;
				cur_node.group.position.y = cur_node.relative_pos.y * height;
				cur_node.group.bounds.width = cur_node.relative_pos.size_dx * height;
				cur_node.group.bounds.height = cur_node.relative_pos.size_dy * height;
				i++;
			}
		}
	}

	function select_node(target) {
		var node_color = game_data.colors[game_data.node_factions[target.value].toString()];
		var quarter_size = target.relative_pos.size_dy * scope.view.size.height / 4;

		if (!target.selected) {
			target.group.shadowColor = node_color['glow'];
			target.group.shadowBlur = quarter_size;
			target.group.firstChild.strokeColor = node_color['selected'];
			target.group.lastChild.fillColor = node_color['selected'];
			target.selected = true;
		}
		else {
			target.group.shadowColor = 0;
			target.group.shadowBlur = 0;
			target.group.firstChild.strokeColor = node_color['line'];
			target.group.lastChild.fillColor = node_color['num'];
			target.selected = false;
		}
	}

	function add_animation(target, fractional_render, length_ms) {
		game_data.animations.push({
			target: target,
			fractional_render: fractional_render,
			length: length_ms
		});
	}

	function init() {
		get_initial_node_data();
		set_resize();
	}

	function init_debug() {
		console.log("Starting init...");
		get_initial_node_data(); // Sets up the initial map
		console.log("Initial node data loaded");
		set_resize();
		console.log("Canvas resize set up");
	}

	init_debug();

});
