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
				line: '#000000',
				num: '#000000',
				fill: '#CECECE',
				selected: '#000000',
				glow: '#000000'
			},
			2: { // Red Rocks
				line: '#e52d00',
				num: '#e52d00',
				fill: '#FAF9F9',
				selected: '#e98a15',
				glow: '#e98a15'
			},
			3: { // Green Elves
				line: '#5eb22e',
				num: '#5eb22e',
				fill: '#edeec0',
				selected: '#97FC9C',
				glow: '#97FC9C'
			},
			4: { // Blue Jellyfish
				line: '#2188dd',
				num: '#2188dd',
				fill: '#C9f0ff',
				selected: '#9428ab',
				glow: '#9428ab'
			}
		},
		global_root: null,
		current_target: null,
		global_target: null,
		date: new Date()
	};

	var scope = new paper.PaperScope();
	scope.setup(canvas);

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

	function select_node(target) {
		if (target.moving)
			return;
		var node_color = game_data.colors[game_data.node_factions[target.value].toString()];
		var quarter_size = target.relative_pos.size_dy * scope.view.size.height / 4;
		target.group.shadowColor = node_color['glow'];
		target.group.shadowBlur = quarter_size;
		target.group.firstChild.strokeColor = node_color['selected'];
		target.group.lastChild.fillColor = node_color['selected'];
		target.selected = true;
		grow_node(target);
	}

	function unselect_node(target) {
		if (target.moving)
			return;
		var node_color = game_data.colors[game_data.node_factions[target.value].toString()];
		target.group.shadowColor = 0;
		target.group.shadowBlur = 0;
		target.group.firstChild.strokeColor = node_color['line'];
		target.group.lastChild.fillColor = node_color['num'];
		target.selected = false;
		ungrow_node(target);
	}

	function grow_node(target) {
		if (target.moving)
			return;
		if (!target.grown && (target.selected || target.hovered)) {
			if (has_animation(target)) {
				remove_animations(target);
			}
			add_animation(target, grow_animation, grow_stop, 100);
			target.grown = true;
		}
	}

	function ungrow_node(target) {
		if (target.moving)
			return;
		if (target.grown && !target.selected && !target.hovered) {
			if (has_animation(target)) {
				remove_animations(target);
			}
			add_animation(target, ungrow_animation, ungrow_stop, 100);
			target.grown = false;
		}
	}

	var grow_animation = function(target, sigma_frac, delta_frac) {
		if (target.base == null) {
			target.base = new scope.Rectangle();
			target.base.width = target.group.bounds.width;
			target.base.height = target.group.bounds.height;
			target.base.x = target.group.position.x;
			target.base.y = target.group.position.y;
		}
		if (target.group.bounds.width < (1 + 0.2 * sigma_frac) * target.base.width) {
			target.group.bounds.width = (1 + 0.2 * sigma_frac) * target.base.width;
			target.group.bounds.height = (1 + 0.2 * sigma_frac) * target.base.height;
		}
		target.group.position.x = target.base.x;
		target.group.position.y = target.base.y;
	}

	var grow_stop = function(target) {
		if (target.base == null) {
			target.base = new scope.Rectangle();
			target.base.width = target.group.bounds.width;
			target.base.height = target.group.bounds.height;
			target.base.x = target.group.position.x;
			target.base.y = target.group.position.y;
		}
		if (target.group.bounds.width < 1.2 * target.base.width) {
			target.group.bounds.width = 1.2 * target.base.width;
			target.group.bounds.height = 1.2 * target.base.height;
		}
		target.group.position.x = target.base.x;
		target.group.position.y = target.base.y;
		return false;
	}

	var ungrow_animation = function(target, sigma_frac, delta_frac) {
		var width = scope.view.size.width;
		var height = scope.view.size.height;
		if (target.base == null) {
			target.base = new scope.Rectangle();
			target.base.width = target.relative_pos.size_dx * height;
			target.base.height = target.relative_pos.size_dy * height;
			target.base.x = target.relative_pos.x * width;
			target.base.y = target.relative_pos.y * height;
		}
		if (target.group.bounds.width > (1.2 - 0.2 * sigma_frac) * target.base.width) {
			target.group.bounds.width = (1.2 - 0.2 * sigma_frac) * target.base.width;
			target.group.bounds.height = (1.2 - 0.2 * sigma_frac) * target.base.height;
		}
		target.group.position.x = target.base.x;
		target.group.position.y = target.base.y;
	}

	var ungrow_stop = function(target) {
		var width = scope.view.size.width;
		var height = scope.view.size.height;
		if (target.base == null) {
			target.base = new scope.Rectangle();
			target.base.width = target.relative_pos.size_dx * height;
			target.base.height = target.relative_pos.size_dy * height;
			target.base.x = target.relative_pos.x * width;
			target.base.y = target.relative_pos.y * height;
		}
		if (target.group.bounds.width > target.base.width) {
			target.group.bounds.width = target.base.width;
			target.group.bounds.height = target.base.height;
		}
		target.group.position.x = target.base.x;
		target.group.position.y = target.base.y;
		if (typeof(target.node) != 'undefined' && target.node != null) {
			target.base = null;
		}
		return false;
	}

	var pop_action_animation = function(target, sigma_frac, delta_frac) {
		if (target.move.group.bounds.width < sigma_frac * target.move.base.width) {
			target.move.group.bounds.width = sigma_frac * target.move.base.width;
			target.move.group.bounds.height = sigma_frac * target.move.base.height;
		}
		target.move.group.position.x = target.move.base.x;
		target.move.group.position.y = target.move.base.y;
		if (target.attack.group.bounds.width < sigma_frac * target.attack.base.width) {
			target.attack.group.bounds.width = sigma_frac * target.attack.base.width;
			target.attack.group.bounds.height = sigma_frac * target.attack.base.height;
		}
		target.attack.group.position.x = target.attack.base.x;
		target.attack.group.position.y = target.attack.base.y;
		if (target.give.group.bounds.width < sigma_frac * target.give.base.width) {
			target.give.group.bounds.width = sigma_frac * target.give.base.width;
			target.give.group.bounds.height = sigma_frac * target.give.base.height;
		}
		target.give.group.position.x = target.give.base.x;
		target.give.group.position.y = target.give.base.y;
	}

	var pop_action_stop = function(target) {
		if (target.move.group.bounds.width < target.move.base.width) {
			target.move.group.bounds.width = target.move.base.width;
			target.move.group.bounds.height = target.move.base.height;
		}
		target.move.group.position.x = target.move.base.x;
		target.move.group.position.y = target.move.base.y;
		if (target.attack.group.bounds.width < target.attack.base.width) {
			target.attack.group.bounds.width = target.attack.base.width;
			target.attack.group.bounds.height = target.attack.base.height;
		}
		target.attack.group.position.x = target.attack.base.x;
		target.attack.group.position.y = target.attack.base.y;
		if (target.give.group.bounds.width < target.give.base.width) {
			target.give.group.bounds.width = target.give.base.width;
			target.give.group.bounds.height = target.give.base.height;
		}
		target.give.group.position.x = target.give.base.x;
		target.give.group.position.y = target.give.base.y;
		return false;
	}

	var unpop_action_animation = function(target, sigma_frac, delta_frac) {
		if (target.move.group.bounds.width > (1 - sigma_frac) * target.move.base.width) {
			target.move.group.bounds.width = (1 - sigma_frac) * target.move.base.width;
			target.move.group.bounds.height = (1 - sigma_frac) * target.move.base.height;
		}
		target.move.group.position.x = target.move.base.x;
		target.move.group.position.y = target.move.base.y;
		if (target.attack.group.bounds.width > (1 - sigma_frac) * target.attack.base.width) {
			target.attack.group.bounds.width = (1 - sigma_frac) * target.attack.base.width;
			target.attack.group.bounds.height = (1 - sigma_frac) * target.attack.base.height;
		}
		target.attack.group.position.x = target.attack.base.x;
		target.attack.group.position.y = target.attack.base.y;
		if (target.give.group.bounds.width > (1 - sigma_frac) * target.give.base.width) {
			target.give.group.bounds.width = (1 - sigma_frac) * target.give.base.width;
			target.give.group.bounds.height = (1 - sigma_frac) * target.give.base.height;
		}
		target.give.group.position.x = target.give.base.x;
		target.give.group.position.y = target.give.base.y;
	}

	var unpop_action_stop = function(target) {
		if (target.move.group.bounds.width > 0) {
			target.move.group.bounds.width = 0;
			target.move.group.bounds.height = 0;
		}
		target.move.group.position.x = target.move.base.x;
		target.move.group.position.y = target.move.base.y;
		if (target.attack.group.bounds.width > 0) {
			target.attack.group.bounds.width = 0;
			target.attack.group.bounds.height = 0;
		}
		target.attack.group.position.x = target.attack.base.x;
		target.attack.group.position.y = target.attack.base.y;
		if (target.give.group.bounds.width > 0) {
			target.give.group.bounds.width = 0;
			target.give.group.bounds.height = 0;
		}
		target.give.group.position.x = target.give.base.x;
		target.give.group.position.y = target.give.base.y;
		target.move.group.remove();
		target.attack.group.remove();
		target.give.group.remove();
		var index = game_data.actions.indexOf(target.move);
		if (typeof(index) != 'undefined' && index != null)
			game_data.actions.splice(index, 1);
		index = game_data.actions.indexOf(target.attack);
		if (typeof(index) != 'undefined' && index != null)
			game_data.actions.splice(index, 1);
		index = game_data.actions.indexOf(target.give);
		if (typeof(index) != 'undefined' && index != null)
			game_data.actions.splice(index, 1);
		return false;
	}

	if (parseInt(navigator.appVersion) > 3) {
		canvas.onmousewheel = mouseDown;
		if (navigator.appName == "Netscape"
			&& parseInt(navigator.appVersion) == 4) {
			canvas.captureEvents(Event.MOUSEDOWN);
		}
	}

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
				var in_nodes = data['nodes'];
				var i = 1;
				while (i < 64) {
					game_data.node_factions[i] = in_nodes[i]['faction_id'];
					i++;
				}
				game_data.active_nodes = build_nodes(6, scope.view.size.width,
					scope.view.size.height);
				game_data.global_root = game_data.active_nodes[0];
				console.log(game_data.active_nodes);
				console.log(game_data.global_root);
			},
			async: true
		});
	}

	function get_more_node_data(ranges) {
		$.ajax({
			type: "GET",
			url: "request_nodes",
			data: {
				ranges: ranges
			},
			datatype: "html",
			success: function (raw) {
				var data = JSON.parse(raw);
				var in_nodes = data['nodes'];
				var i = 0;
				while (i < ranges.length) {
					var j = ranges[i].from;
					while (j < ranges[i].to) {
						game_data.node_factions[j] = in_nodes[j]['faction_id'];
						j++;
					}
					i++;
				}
				add_animation(null, move_nodes, confirm_moved_nodes, 1000);
			}
		})
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

		var relative_pos = {
			x: center.x / scope.view.size.width,
			y: center.y / scope.view.size.height,
			size_dx: out_node.bounds.width / scope.view.size.height,
			size_dy: out_node.bounds.height / scope.view.size.height
		};

		let total_node = {
			value: elem,
			position: elem,
			group: out_node,
			relative_pos: relative_pos,
			selected: false,
			hovered: false,
			grown: false,
			moving: false,
			base: null,
			options: null,
			node: true,
			move_target: null,
			move_thickness: thickness
		};

		out_node.onMouseEnter = function(event) {
			total_node.hovered = true;
			grow_node(total_node);
		}

		out_node.onMouseLeave = function(event) {
			total_node.hovered = false;
			ungrow_node(total_node);
		}

		out_node.onClick = function(event) {
			check_selection(total_node);
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

	function hob(num) {
		if (!num)
			return 0;
		var out = 1;
		while (num >>= 1)
			out += 1;
		return out;
	}

	function get_solid_mask(len) {
		if (len <= 0)
			return 0;
		var out = 1;
		var i = 1;
		while (i < len) {
			out <<= 1;
			out |= 1;
			i++;
		}
		return out;
	}

	function take_bits(num, from, amount, base) {
		var bit_len = hob(num);
		var tail_num = bit_len - from - amount;
		if (tail_num < 0)
			return -1;
		var tail_mask = get_solid_mask(tail_num);
		var check_mask = get_solid_mask(amount);
		var compare = base & check_mask;
		check_mask <<= tail_num;
		var head_mask = get_solid_mask(from) << (tail_num + amount);
		var check = (num & check_mask) >> tail_num;
		var tail = num & tail_mask;
		var head = (num & head_mask) >> amount;
		if (check != compare) {
			return -1;
		}
		return head | tail;
	}

	function swap(arr, index1, index2) {
		var tmp = arr[index1];
		arr[index1] = arr[index2];
		arr[index2] = tmp;
	}

	function partition(arr, lo, hi) {
		var pivot = arr[lo].position;
		var i = lo - 1;
		var j = hi + 1;
		while (true) {
			do {
				i++;
			} while (arr[i].position < pivot);
			do {
				j--;
			} while (arr[j].position > pivot);
			if (i >= j) {
				return j;
			}
			swap(arr, i, j);
		}
	}

	function sort_active_nodes(arr, lo, hi) {
		if (lo < hi) {
			var pivot = partition(arr, lo, hi);
			sort_active_nodes(arr, lo, pivot);
			sort_active_nodes(arr, pivot + 1, hi);
		}
	}

	function move_to(target) {
		// Go through each node in game_data.active_nodes, then:
			// If you can remove the right bits, set motion target
			// If not, add to buffer_nodes
		// Create array of remaining positions
		// Go through buffer_nodes
			// Assign each node's motion target to the remaining positions
		// Move buffer nodes onto active_nodes again
		// Assign all elements actual values equal to their motion target values
		// Sort active nodes by their positions
		// Create animation for entire process
		// Motion target should include:
			// size and location of each node
			// value to be set to at last animation
		if (target == game_data.global_root)
			return;
		var bit_base = hob(game_data.global_root.position);
		console.log(bit_base);
		var bit_dif = hob(target.position) - bit_base;
		console.log(bit_dif);
		var i = 0;
		while (i < 63) {
			var cur_node = game_data.active_nodes[i];
			var target_position = take_bits(cur_node.position, bit_base, bit_dif, target.position);
			if (target_position == -1) {
				console.log("moving node " + cur_node.position + " to buffer");
				game_data.buffer_nodes.push(cur_node);
			}
			else {
				console.log("moving node " + cur_node.position + " to " + target_position);
				cur_node.move_target = game_data.active_nodes[target_position - 1].relative_pos;
				cur_node.move_position = target_position;
				cur_node.move_value = cur_node.value;
				cur_node.move_thickness = game_data.active_nodes[target_position - 1].group.firstChild.strokeWidth;
				console.log("  - move value: " + cur_node.move_value);
			}
			i++;
		}
		var relocs = []; // Stands for relocations. I don't know what to call it tbh
		var ranges = [];
		var amount = 32;
		i = 0;
		while (i < bit_dif) {
			j = 0;
			while (j < amount) {
				relocs.push(j + amount);
				j++;
			}
			ranges.push({
				from: Math.pow(2, 5 - i) * target.value,
				to: Math.pow(2, 5 - i) * target.value + amount
			})
			i++;
			amount /= 2;
		}
		i = 0;
		console.log("Moving from buffer now");
		var prev_base = game_data.global_root.value;
		var leftie = relocs[0];
		var j = 0;
		while (game_data.buffer_nodes.length > 0) {
			if (relocs[i] < leftie) {
				leftie = relocs[i];
				j = 0;
			}
			console.log("Moving " + game_data.buffer_nodes[0].value + " to " + relocs[i]);
			game_data.buffer_nodes[0].move_target = game_data.active_nodes[relocs[i] - 1].relative_pos;
			game_data.buffer_nodes[0].move_position = relocs[i];
			game_data.buffer_nodes[0].move_value = leftie * target.value + j;
			game_data.buffer_nodes[0].move_thickness = game_data.active_nodes[relocs[i] - 1].group.firstChild.strokeWidth;
			console.log("  - move value: " + game_data.buffer_nodes[0].move_value);
			game_data.buffer_nodes.splice(0, 1);
			i++;
			j++;
		}
		i = 0;
		while (i < game_data.active_nodes.length) {
			game_data.active_nodes[i].position = game_data.active_nodes[i].move_position;
			i++;
		}
		console.log(game_data.active_nodes);
		sort_active_nodes(game_data.active_nodes, 0, game_data.active_nodes.length - 1);
		console.log(game_data.active_nodes);
		get_more_node_data(ranges);
	}

	var move_nodes = function(target, sigma_frac, delta_frac) {
		var width = scope.view.size.width;
		var height = scope.view.size.height;
		var i = 0;
		while (i < game_data.active_nodes.length) {
			var cur_node = game_data.active_nodes[i];
			if (cur_node.base == null) {
				cur_node.base = new scope.Rectangle();
				cur_node.base.width = cur_node.relative_pos.size_dx * height;
				cur_node.base.height = cur_node.relative_pos.size_dy * height;
				cur_node.base.x = cur_node.relative_pos.x * width;
				cur_node.base.y = cur_node.relative_pos.y * height;
			}
			cur_node.group.position.x = cur_node.base.x + sigma_frac
				* (cur_node.move_target.x * width - cur_node.base.x);
			cur_node.group.position.y = cur_node.base.y + sigma_frac
				* (cur_node.move_target.y * height - cur_node.base.y);
			cur_node.group.bounds.width = cur_node.base.width + sigma_frac
				* (cur_node.move_target.size_dx * height - cur_node.base.width);
			cur_node.group.bounds.height = cur_node.base.height + sigma_frac
				* (cur_node.move_target.size_dy * height - cur_node.base.height);
			i++;
			cur_node.moving = true;
		}
	}

	var confirm_moved_nodes = function(target) {
		var width = scope.view.size.width;
		var height = scope.view.size.height;
		var i = 0;
		console.log(game_data.active_nodes);
		console.log(game_data.node_factions);
		while (i < game_data.active_nodes.length) {
			var cur_node = game_data.active_nodes[i];
			cur_node.group.position.x = cur_node.move_target.x * width;
			cur_node.group.position.y = cur_node.move_target.y * height;
			cur_node.group.bounds.width = cur_node.move_target.size_dx * height;
			cur_node.group.bounds.height = cur_node.move_target.size_dy * height;
			cur_node.value = cur_node.move_value;
			var node_color = game_data.colors[game_data.node_factions[cur_node.value].toString()];
			var num_digits = cur_node.value.toString().length;
			cur_node.relative_pos = cur_node.move_target;
			cur_node.base = null;
			cur_node.group.lastChild.content = cur_node.value;
			cur_node.moving = false;
			cur_node.group.firstChild.strokeColor = node_color['line'];
			cur_node.group.firstChild.fillColor = node_color['fill'];
			cur_node.group.firstChild.strokeWidth = cur_node.move_thickness;
			var sine_size = cur_node.group.bounds.width / 2.3;
			var num_w = sine_size * Math.pow(1.2, num_digits);
			var num_h = (num_w / num_digits) * 1.4;
			cur_node.group.lastChild.fillColor = node_color['num'];
			cur_node.group.lastChild.content = cur_node.value.toString();
			cur_node.group.lastChild.bounds.width = num_w;
			cur_node.group.lastChild.bounds.height = num_h;
			cur_node.group.lastChild.bounds.x = cur_node.group.position.x - num_w / 2;
			cur_node.group.lastChild.bounds.y = cur_node.group.position.y - num_h / 2;
			i++;
		}
		game_data.global_root = game_data.active_nodes[0];
		return false;
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

	function remove_options(target) {
		add_animation(target.options, unpop_action_animation, unpop_action_stop, 150);
		target.options = null;
	}

	function add_options(target) {
		var colors = game_data.colors[game_data.node_factions[target.value].toString()];
		var x_sign = target.value % 2 != 0 ? -1 : 1;
		var ref_x = target.group.position.x;
		var ref_y = target.group.position.y;
		var ref_stroke_width = target.group.firstChild.strokeWidth;
		var move_rad = target.group.bounds.width / 8;
		var move_x = x_sign * (1.8 * move_rad + target.group.bounds.width / 2) * Math.sqrt(3) / 2;
		var move_y = (1.8 * move_rad + target.group.bounds.height / 2) / 2;
		var move_point = new scope.Point(ref_x + move_x, ref_y + move_y);
		var move_circle = new scope.Path.Circle(move_point, move_rad);
		move_circle.strokeWidth = ref_stroke_width / 2;
		move_circle.strokeColor = colors['line'];
		move_circle.fillColor = colors['fill'];
		var move_char = new scope.PointText(move_point);
		move_char.position.x -= move_rad / 2;
		move_char.fillColor = colors['num'];
		move_char.content = 'M';
		move_char.bounds.width = move_rad;
		move_char.bounds.height = move_rad * 4 / 3;
		var move_option = new scope.Group(move_circle, move_char);
		var move_base = new scope.Rectangle();
		move_base.x = move_option.position.x;
		move_base.y = move_option.position.y;
		move_base.width = move_option.bounds.width;
		move_base.height = move_option.bounds.height;
		move_option.bounds.width = 0.0001;
		move_option.bounds.height = 0.0001;
		var move_relative_pos = {
			x: move_base.x / scope.view.size.width,
			y: move_base.y / scope.view.size.height,
			size_dx: move_base.width / scope.view.size.height,
			size_dy: move_base.height / scope.view.size.height
		};
		var attack_rad = move_rad;
		var attack_x = x_sign * (1.8 * attack_rad + target.group.bounds.width / 2);
		var attack_y = 0;
		var attack_point = new scope.Point(ref_x + attack_x, ref_y + attack_y);
		var attack_circle = new scope.Path.Circle(attack_point, attack_rad);
		attack_circle.strokeWidth = ref_stroke_width / 2;
		attack_circle.strokeColor = colors['line'];
		attack_circle.fillColor = colors['fill'];
		var attack_char = new scope.PointText(attack_point);
		attack_char.position.x -= attack_rad / 2;
		attack_char.fillColor = colors['num'];
		attack_char.content = 'A';
		attack_char.bounds.width = attack_rad;
		attack_char.bounds.height = attack_rad * 4 / 3;
		var attack_option = new scope.Group(attack_circle, attack_char);
		var attack_base = new scope.Rectangle();
		attack_base.x = attack_option.position.x;
		attack_base.y = attack_option.position.y;
		attack_base.width = attack_option.bounds.width;
		attack_base.height = attack_option.bounds.height;
		attack_option.bounds.width = 0.0001;
		attack_option.bounds.height = 0.0001;
		var attack_relative_pos = {
			x: attack_base.x / scope.view.size.width,
			y: attack_base.y / scope.view.size.height,
			size_dx: attack_base.width / scope.view.size.height,
			size_dy: attack_base.height / scope.view.size.height
		};
		var give_rad = move_rad;
		var give_x = x_sign * (1.8 * move_rad + target.group.bounds.width / 2) * Math.sqrt(3) / 2;
		var give_y = (1.8 * move_rad + target.group.bounds.height / 2) / -2;
		var give_point = new scope.Point(ref_x + give_x, ref_y + give_y);
		var give_circle = new scope.Path.Circle(give_point, give_rad);
		give_circle.strokeWidth = ref_stroke_width / 2;
		give_circle.strokeColor = colors['line'];
		give_circle.fillColor = colors['fill'];
		var give_char = new scope.PointText(give_point);
		give_char.position.x -= give_rad / 2;
		give_char.fillColor = colors['num'];
		give_char.content = 'G';
		give_char.bounds.width = give_rad;
		give_char.bounds.height = give_rad * 4 / 3;
		var give_option = new scope.Group(give_circle, give_char);
		var give_base = new scope.Rectangle();
		give_base.x = give_option.position.x;
		give_base.y = give_option.position.y;
		give_base.width = give_option.bounds.width;
		give_base.height = give_option.bounds.height;
		give_option.bounds.width = 0.0001;
		give_option.bounds.height = 0.0001;
		var give_relative_pos = {
			x: give_base.x / scope.view.size.width,
			y: give_base.y / scope.view.size.height,
			size_dx: give_base.width / scope.view.size.height,
			size_dy: give_base.height / scope.view.size.height
		};
		var options = {
			target: target,
			move: {
				group: move_option,
				relative_pos: move_relative_pos,
				base: move_base,
				selected: false,
				hovered: false,
				grown: false,
				value: target.value
			},
			attack: {
				group: attack_option,
				relative_pos: attack_relative_pos,
				base: attack_base,
				selected: false,
				hovered: false,
				grown: false,
				value: target.value
			},
			give: {
				group: give_option,
				relative_pos: give_relative_pos,
				base: give_base,
				selected: false,
				hovered: false,
				grown: false,
				value: target.value
			}
		};
		game_data.actions.push(options.move);
		game_data.actions.push(options.attack);
		game_data.actions.push(options.give);
		move_option.onMouseEnter = function(event) {
			options.move.hovered = true;
			grow_node(options.move);
		}
		move_option.onMouseLeave = function(event) {
			options.move.hovered = false;
			ungrow_node(options.move);
		}
		move_option.onClick = function(event) {
			game_data.action_index = -1;
			remove_options(target);
			unselect_node(target);
			var index = game_data.selected_nodes.indexOf(target);
			game_data.selected_nodes.splice(index, 1);
			move_to(target);
		}
		attack_option.onMouseEnter = function(event) {
			options.attack.hovered = true;
			grow_node(options.attack);
		}
		attack_option.onMouseLeave = function(event) {
			options.attack.hovered = false;
			ungrow_node(options.attack);
		}
		attack_option.onClick = function(event) {
			select_action(options.attack);
		}
		give_option.onMouseEnter = function(event) {
			options.give.hovered = true;
			grow_node(options.give);
		}
		give_option.onMouseLeave = function(event) {
			options.give.hovered = false;
			ungrow_node(options.give);
		}
		give_option.onClick = function(event) {
			select_action(options.give);
		}
		// move_option.onClick = function(event) {
		// 	check_selection(move_option);
		// }
		target.options = options;
		add_animation(options, pop_action_animation, pop_action_stop, 150);
	}

	function take_action() { // TODO
		console.log('Calling an event!');
	}

	function check_selection(target) {
		if (!target.selected) {
			select_node(target);
			if (game_data.selected_nodes.length >= 1 && game_data.action_index != -1) {
				game_data.selected_nodes.push(target);
				remove_options(game_data.selected_nodes[0]);
				take_action();
				setTimeout(function() {
					game_data.selected_nodes.forEach(function(e) {
						unselect_node(e);
					});
					game_data.selected_nodes.splice(0, game_data.selected_nodes.length);
					game_data.action_index = -1;
				}, 300);
			}
			else if (game_data.selected_nodes.length >= 1) {
				remove_options(game_data.selected_nodes[0]);
				unselect_node(game_data.selected_nodes[0]);
				game_data.selected_nodes[0] = target;
				add_options(game_data.selected_nodes[0]);
			}
			else {
				game_data.selected_nodes.push(target);
				add_options(target);
			}
		}
		else {
			unselect_node(target);
			var index = game_data.selected_nodes.indexOf(target);
			if (typeof(index) != 'undefined' && index != null)
				game_data.selected_nodes.splice(index, 1);
			remove_options(target);
			game_data.action_index = -1;
		}
	}

	function select_action(target) {
		if (target.selected) {
			game_data.action_index = -1;
			unselect_node(target);
		}
		else {
			if (game_data.action_index != -1)
				unselect_node(game_data.actions[game_data.action_index]);
			select_node(target);
			game_data.action_index = game_data.actions.indexOf(target);
		}
	}

	function has_animation(target) {
		var i = 0;
		var len = game_data.animations.length;
		while (i < len) {
			if (target == game_data.animations[i].target) {
				return true;
			}
			i++;
		}
		return false;
	}

	function remove_animations(target) {
		var i = 0;
		var len = game_data.animations.length;
		while (i < len) {
			if (target == game_data.animations[i].target) {
				game_data.animations.splice(i, 1);
				len--;
				continue;
			}
			i++;
		}
	}

	function add_animation(target, fractional_render, last_render, length_ms) {
		game_data.date = new Date();
		var now = game_data.date.getTime();
		let animation = {
			target: target,
			fractional_render: fractional_render,
			last_render: last_render,
			length: length_ms,
			start: now,
			last: now
		};
		game_data.animations.push(animation);
	}

	function tick(event) {
		game_data.date = new Date();
		var tick_time = game_data.date.getTime();
		var i = 0;
		var len = game_data.animations.length;
		while (i < len) {
			var anim = game_data.animations[i];
			var total_timespan = tick_time - anim.start;
			var current_timespan = tick_time - anim.last;
			var sigma_frac = total_timespan / anim.length; // Total time spent
			var delta_frac = current_timespan / anim.length; // Time since last tick
			var survive = true;
			if (total_timespan >= anim.length) {
				survive = anim.last_render(anim.target);
				if (!survive) {
					var index = game_data.animations.indexOf(anim);
					game_data.animations.splice(index, 1);
					len--;
					continue;
				}
				else {
					anim.start += anim.length;
				}
			}
			else {
				anim.fractional_render(anim.target, sigma_frac, delta_frac);
			}
			anim.last = tick_time;
			i++;
		}
	}

	function init() {
		get_initial_node_data();
		set_resize();
		scope.view.onFrame = function(event) {
			tick(event);
		};
	}

	function init_debug() {
		console.log("Starting init...");
		get_initial_node_data(); // Sets up the initial map
		console.log("Initial node data loaded");
		set_resize();
		console.log("Canvas resize set up");
		scope.view.onFrame = function(event) {
			tick(event);
		};
		console.log("Ticking now...");
	}

	init_debug();

});
