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

	var scope = new paper.PaperScope();
	scope.setup(canvas);

	var w = scope.view.size.width / 2;
	var h = scope.view.size.height / 2;

	var game_data = {
		fov: 220,
		view_dist: h / 1.4,
		tilt: -19,
		node_factions: [],
		node_connections: [],
		active_nodes: [],
		buffer_nodes: [],
		selected_nodes: [],
		action_index: -1,
		actions: [],
		animations: [],
		colors: {
			0: { // Background
				light: [61, 196, 255],
				dark: [35, 82, 175]
			},
			1: { // Neutral
				line: '#000000',
				num: '#000000',
				fill: '#cecece',
				selected: '#000000',
				glow: '#000000'
			},
			2: { // Red Rocks
				line: '#e52d00',
				num: '#e52d00',
				fill: '#faf9f9',
				selected: '#ff8300',
				glow: '#ff8300'
			},
			3: { // Green Elves
				line: '#3eb200',
				num: '#3eb200',
				fill: '#ffffd8',
				selected: '#40ed4b',
				glow: '#40ed4b'
			},
			4: { // Blue Jellyfish
				line: '#2188dd',
				num: '#2188dd',
				fill: '#C9f0ff',
				selected: '#9428ab',
				glow: '#9428ab'
			}
		},
		background: {},
		global_root: null,
		date: new Date()
	};

	function make_background() {
		var background = game_data.background;

		background.y_range = [h / 4, h / 8];
		background.x_range = [w / 8, w / 12];
		background.z_range = h / 4;
		background.z_force = h / 11;
		background.rows = [];
		background.add_row = function(base_y) {
			this.rows.push({
				first: this.rows.length != 0 ? false : true,
				points: [],
				triangles: []
			});
			var row_len = this.rows.length;
			var cur_x = -200;
			var var_y = Math.floor(Math.random() * this.y_range[1]) - this.y_range[1] / 2;
			var cur_shifted = new scope.Point(0, var_y + base_y);
			var z = Math.floor(Math.random() * this.z_range) + this.z_range / 2;
			rotate_point(cur_shifted);
			cur_shifted.x = cur_x;
			z = unrotate_point(cur_shifted, z);
			cur_x = cur_shifted.x;
			z = rotate_point(cur_shifted, z);
			while (cur_shifted.x <= 2*w) {
				var delta_x = this.x_range[0] + Math.floor(Math.random() * this.x_range[1]);
				var_y = Math.floor(Math.random() * this.y_range[1]) - this.y_range[1] / 2;
				var point = new scope.Point(cur_x + delta_x, base_y + var_y);
				z = rotate_point(point, z);
				this.rows[row_len-1].points.push({
					x: point.x,
					y: point.y,
					z: z
				});
				cur_x += delta_x;
				cur_shifted.x = cur_x;
				cur_shifted.y = var_y + base_y;
				var prev_z = z;
				while (Math.abs(prev_z - z) < this.z_force)
				z = Math.floor(Math.random() * this.z_range) - this.z_range / 2;
				rotate_point(cur_shifted, z);
			}
			return cur_shifted.y;
		};

		background.generate_rows = function(start) {
			var cur_y = start;
			var gotten_y = 0;
			while (gotten_y < 2*h + 100) {
				gotten_y = this.add_row(cur_y);
				cur_y += this.y_range[0];
			}
		};

		background.remake_grid = function() {
			if (this.rows.length < 2) {
				console.log("Error attempting to reset a grid with fewer than two rows");
				return;
			}
			var cur_row_up = 0, cur_row_down = 1;
			while (cur_row_down < this.rows.length) {
				var cur_col_up = 0, cur_col_down = 0, moving_up = true;
				while (cur_col_up < this.rows[cur_row_up].points.length
					&& cur_col_down < this.rows[cur_row_down].points.length) {
					var up = this.rows[cur_row_up].points[cur_col_up];
					var down = this.rows[cur_row_down].points[cur_col_down];
					if (cur_col_up > 0 || cur_col_down > 0) {
						var triangle = new scope.Path();
						var first_point;
						if (moving_up)
						first_point = this.rows[cur_row_up].points[cur_col_up - 1];
						else
						first_point = this.rows[cur_row_down].points[cur_col_down - 1];
						var second_point = this.rows[cur_row_up].points[cur_col_up];
						var third_point = this.rows[cur_row_down].points[cur_col_down];
						var edge1 = get_vector(second_point, first_point);
						var edge2 = get_vector(third_point, first_point);
						var normal = normalize(cross(edge1, edge2));
						var theta = get_angle(normal, normalize({
							x: 1,
							y: 0.5,
							z: 1
						}));
						var cos = Math.cos(theta);
						var r1 = 61, g1 = 196, b1 = 255;
						var r2 = 35, g2 = 82, b2 = 175;
						var red = Math.floor((r1 - r2) * cos) + r2;
						var green = Math.floor((g1 - g2) * cos) + g2;
						var blue = Math.floor((b1 - b2) * cos) + b2;
						var r_bit = red.toString(16);
						var g_bit = green.toString(16);
						var b_bit = blue.toString(16);
						var color = "#" + r_bit + g_bit + b_bit;
						triangle.add(new scope.Segment(first_point));
						triangle.add(new scope.Segment(second_point));
						triangle.add(new scope.Segment(third_point));
						triangle.closed = true;
						triangle.fillColor = color;
						triangle.strokeColor = color;
						triangle.strokeWidth = 1;
						triangle.strokeJoin = 'bevel';
						this.rows[cur_row_down].triangles.push(triangle);
					}
					if ((moving_up && up.x > down.x) || (!moving_up && down.x > up.x))
					moving_up = !moving_up;
					if (moving_up)
					cur_col_up++;
					else
					cur_col_down++;
				}
				cur_row_up++;
				cur_row_down++;
			}
		};
		background.generate_rows(-h);
		background.remake_grid();
	}

	//make_background();

	function rotate_point(point, z) {
		var rd, ca, sa, ry, rz, f;

		x = point.x - w;
		y = point.y - h;
		rd = game_data.tilt * Math.PI / 180;
		ca = Math.cos(rd);
		sa = Math.sin(rd);

		ry = y * ca;
		rz = y * sa;

		f = game_data.fov / (game_data.view_dist + rz);
		point.x = x * f + w;
		point.y = ry * f + h;
		return rz + z;
	}

	function unrotate_point(point, z) {
		var rd, ca, sa, ry, rz, f;

		x = point.x - w;
		y = point.y - h;
		rd = game_data.tilt * Math.PI / 180;
		ca = Math.cos(rd);
		sa = Math.sin(rd);

		point.y = y * game_data.view_dist / (ca * game_data.fov - sa * y);
		point.x = (x / (game_data.fov / (game_data.view_dist + point.y * sa))) + w;
		var rz = point.y * sa;
		point.y += h;
		return z - rz;
	}

	function get_angle(vec1, vec2) {
		var magn1 = Math.sqrt(vec1.x*vec1.x + vec1.y*vec1.y + vec1.z*vec1.z);
		var magn2 = Math.sqrt(vec2.x*vec2.x + vec2.y*vec2.y + vec2.z*vec2.z);
		var dot_product = dot(vec1, vec2) / (magn1 * magn2);
		return dot_product / (magn1 * magn2);
	}

	function get_vector(p1, p2) {
		var vector = {
			x: p2.x - p1.x,
			y: p2.y - p1.y,
			z: p2.z - p1.z
		};
		return vector;
	}

	function cross(vec1, vec2) {
		var vector = {
			x: vec1.y * vec2.z - vec1.z * vec2.y,
			y: vec1.z * vec2.x - vec1.x * vec2.z,
			z: vec1.x * vec2.y - vec1.y * vec2.x
		};
		return vector;
	}

	function dot(vec1, vec2) {
		return vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
	}

	function normalize(vec) {
		var magnitude = Math.sqrt(vec.x*vec.x + vec.y*vec.y + vec.z*vec.z);
		var vector = {
			x: vec.x / magnitude,
			y: vec.y / magnitude,
			z: vec.z / magnitude
		};
		return vector;
	}

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
		var width = scope.view.size.width;
		var height = scope.view.size.height;
		if (target.base == null) {
			target.base = new scope.Rectangle();
			target.base.width = target.relative_pos.size_dx * height;
			target.base.height = target.relative_pos.size_dy * height;
			target.base.x = target.relative_pos.x * width;
			target.base.y = target.relative_pos.y * height;
		}
		if (target.group.bounds.width < (1 + 0.2 * sigma_frac) * target.base.width) {
			target.group.bounds.width = (1 + 0.2 * sigma_frac) * target.base.width;
			target.group.bounds.height = (1 + 0.2 * sigma_frac) * target.base.height;
		}
		target.group.position.x = target.base.x;
		target.group.position.y = target.base.y;
	}

	var grow_stop = function(target) {
		var width = scope.view.size.width;
		var height = scope.view.size.height;
		if (target.base == null) {
			target.base = new scope.Rectangle();
			target.base.width = target.relative_pos.size_dx * height;
			target.base.height = target.relative_pos.size_dy * height;
			target.base.x = target.relative_pos.x * width;
			target.base.y = target.relative_pos.y * height;
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
		if (target.connect.group.bounds.width < sigma_frac * target.connect.base.width) {
			target.connect.group.bounds.width = sigma_frac * target.connect.base.width;
			target.connect.group.bounds.height = sigma_frac * target.connect.base.height;
		}
		target.connect.group.position.x = target.connect.base.x;
		target.connect.group.position.y = target.connect.base.y;
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
		if (target.connect.group.bounds.width < target.connect.base.width) {
			target.connect.group.bounds.width = target.connect.base.width;
			target.connect.group.bounds.height = target.connect.base.height;
		}
		target.connect.group.position.x = target.connect.base.x;
		target.connect.group.position.y = target.connect.base.y;
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
		if (target.connect.group.bounds.width > (1 - sigma_frac) * target.connect.base.width) {
			target.connect.group.bounds.width = (1 - sigma_frac) * target.connect.base.width;
			target.connect.group.bounds.height = (1 - sigma_frac) * target.connect.base.height;
		}
		target.connect.group.position.x = target.connect.base.x;
		target.connect.group.position.y = target.connect.base.y;
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
		if (target.connect.group.bounds.width > 0) {
			target.connect.group.bounds.width = 0;
			target.connect.group.bounds.height = 0;
		}
		target.connect.group.position.x = target.connect.base.x;
		target.connect.group.position.y = target.connect.base.y;
		target.move.group.removeChildren();
		target.move.group.remove();
		target.attack.group.removeChildren();
		target.attack.group.remove();
		target.connect.group.removeChildren();
		target.connect.group.remove();
		var index = game_data.actions.indexOf(target.move);
		if (typeof(index) != 'undefined' && index != null)
			game_data.actions.splice(index, 1);
		index = game_data.actions.indexOf(target.attack);
		if (typeof(index) != 'undefined' && index != null)
			game_data.actions.splice(index, 1);
		index = game_data.actions.indexOf(target.connect);
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
					var cur_connections = {
						dad: in_nodes[i]['dad'],
						bro: in_nodes[i]['bro']
					};
					game_data.node_connections[i] = cur_connections;
					i++;
				}
				game_data.active_nodes = build_nodes(6, scope.view.size.width,
					scope.view.size.height);
				i = 0;
				while (i < 63) {
					show_connections(game_data.active_nodes[i]);
					i++;
				}
				game_data.global_root = game_data.active_nodes[0];
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
						var cur_connections = {
							dad: in_nodes[j]['dad'],
							bro: in_nodes[j]['bro']
						};
						game_data.node_connections[j] = cur_connections;
						j++;
					}
					i++;
				}
				i = 0;
				while (i < game_data.active_nodes.length) {
					var cur_node = game_data.active_nodes[i];
					hide_connections(cur_node);
					i++;
				}
				add_animation(null, move_nodes, confirm_moved_nodes, 1000);
			}
		});
	}

	function shorten_line(line, start_trim, end_trim) {
		var start = line.firstSegment.point;
		var end = line.lastSegment.point;
		var theta = Math.atan((start.y - end.y) / (start.x - end.x));
		var x_sign = end.x > start.x ? 1 : -1;// from start to end
		var new_start = new scope.Point(start.x + x_sign * Math.cos(theta) * start_trim,
			start.y + x_sign * Math.sin(theta) * start_trim);
		var new_end = new scope.Point(end.x - x_sign * Math.cos(theta) * end_trim,
			end.y - x_sign * Math.sin(theta) * end_trim);
		line.firstSegment.point = new_start;
		line.lastSegment.point = new_end;
	}

	function tug_of_war(line, ratio, start_faction, end_faction) {
		var start = new scope.Point(line.firstSegment.point);
		var end = new scope.Point(line.lastSegment.point);
		var dx = Math.abs(start.x - end.x);
		var dy = Math.abs(start.y - end.y);
		var refx = Math.min(start.x, end.x);
		var refy = Math.min(start.y, end.y);
		var mid = new scope.Point(refx + dx * ratio, refy + dy * ratio);
		var thick = line.strokeWidth;
		line.remove();
		var first = new scope.Path.Line(start, mid);
		first.strokeWidth = thick;
		first.strokeColor = game_data.colors[start_faction.toString()].line;
		var second= new scope.Path.Line(mid, end);
		second.strokeWidth = thick;
		second.strokeColor = game_data.colors[end_faction.toString()].line;
		line = new scope.Group(first, second);
		return line;
	}

	function show_parent(parent, son) {
		var son_sign = son.value % 2 == 0 ? 1 : -1;
		var from = new scope.Point(parent.group.position.x, parent.group.position.y);
		var to = new scope.Point(son.group.position.x, son.group.position.y);
		var connection = new scope.Path.Line(from, to);
		shorten_line(connection, parent.rad * 1.2, son.rad * 0.7);
		connection.strokeWidth = (parent.group.firstChild.strokeWidth +
			son.group.firstChild.strokeWidth) / 2;
		if (game_data.node_factions[parent.value] == game_data.node_factions[son.value]) {
			var colors = game_data.colors[game_data.node_factions[parent.value].toString()];
			connection.strokeColor = colors.line;
		}
		else {
			connection = tug_of_war(connection, 0.5, game_data.node_factions[parent.value],
				game_data.node_factions[son.value]);
		}
		return connection;
	}

	function show_brother(brother, sis) {
		var sis_sign = sis.value % 2 == 0 ? 1 : -1;
		var from = new scope.Point(brother.group.position.x, brother.group.position.y);
		var to = new scope.Point(sis.group.position.x, sis.group.position.y);
		var connection = new scope.Path.Line(from, to);
		shorten_line(connection, brother.rad * 1.2, sis.rad * 1.2);
		connection.strokeWidth = (brother.group.firstChild.strokeWidth +
			sis.group.firstChild.strokeWidth) / 2;
		if (game_data.node_factions[brother.value] == game_data.node_factions[sis.value]) {
			var colors = game_data.colors[game_data.node_factions[brother.value].toString()];
			connection.strokeColor = colors.line;
		}
		else {
			connection = tug_of_war(connection, 0.5, game_data.node_factions[brother.value],
				game_data.node_factions[sis.value]);
		}
		return connection;
	}

	function show_connections(target) {
		target.connection_values.dad = game_data.node_connections[target.value]['dad'];
		target.connection_values.bro = game_data.node_connections[target.value]['bro'];
		connection_dad = null;
		connection_bro = null;
		if (target.connection_values.dad != null) {
			var dad = null
			var j = 0;
			while (j < game_data.active_nodes.length) {
				if (game_data.active_nodes[j].value == target.connection_values.dad) {
					dad = game_data.active_nodes[j];
					break;
				}
				j++;
			}
			if (dad != null)
				connection_dad = show_parent(dad, target);
		}
		if (target.connection_values.bro != null) {
			var bro = null;
			j = 0;
			while (j < game_data.active_nodes.length) {
				if (game_data.active_nodes[j].value == target.connection_values.bro) {
					bro = game_data.active_nodes[j];
					break;
				}
				j++;
			}
			if (bro != null)
				connection_bro = show_brother(bro, target);
		}
		connections_group = new scope.Group(connection_dad, connection_bro);
		target.connections = connections_group;
	}

	function hide_connections(target) {
		target.connections.remove();
	}

	function get_node(elem, center, size, thickness, parent, brother) {
		var num_digits = elem.toString().length;
		var node_color = game_data.colors[game_data.node_factions[elem].toString()];
		var half_size = size / 2;
		var sine_size = size / 2.3;
		var tan_size = size / 3.7;
		var quarter_size = size / 4;
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

		var num_w = sine_size * (2 - 1 / num_digits);
		var num_h = (num_w / num_digits) * 1.4;
		num = new scope.PointText(center);
		num.fillColor = node_color['num'];
		num.content = elem.toString();
		num.bounds = new scope.Rectangle({
			point: [center.x - num_w / 2, center.y - num_h / 2],
			size: [num_w, num_h]
		});

		var out_node = new scope.Group(basis, num);
		var selected = false;
		var myBounds = out_node.bounds;

		var relative_pos = {
			x: out_node.position.x / scope.view.size.width,
			y: out_node.position.y / scope.view.size.height,
			size_dx: out_node.bounds.width / scope.view.size.height,
			size_dy: out_node.bounds.height / scope.view.size.height
		};

		var leftie = elem % 2 == 0 ? false : true;

		var total_node = {
			value: elem,
			position: elem,
			group: out_node,
			rad: half_size,
			relative_pos: relative_pos,
			connection_values: {
				dad: parent,
				bro: brother
			},
			connections: null,
			selected: false,
			hovered: false,
			grown: false,
			moving: false,
			base: null,
			options: null,
			node: true,
			move_target: null,
			move_thickness: thickness,
			left_pointed: leftie
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
		var total_height = height * 25 / 33 - 54;
		var bottom_y = height * 27 / 33 - 32;
		var layer_height = total_height * 243 / 665;
		var node_height = layer_height * 3 / 4;
		var y = bottom_y - (layer_height / 2);
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
				var new_node = get_node(index, point, node_height, thickness,
					game_data.node_connections[index]['dad'],
					game_data.node_connections[index]['bro']);
				if (i == num_layers - 1) {
					var dot_w = new_node.group.bounds.width * 0.7246377;
					var dot_h = dot_w * 0.483333;
					new_node.group.lastChild.content = "...";
					new_node.group.lastChild.bounds.width = dot_w;
					new_node.group.lastChild.bounds.height = dot_h;
					new_node.group.lastChild.bounds.x = new_node.group.position.x - dot_w / 2;
					new_node.group.lastChild.bounds.y = new_node.group.position.y - dot_h / 2;
					new_node.group.firstChild.strokeWidth += 1;
				}
				nodes.push(new_node);
				point.x += width / num_sub;
				j++;
				index++;
			}
			node_height /= 1.5;
			y -= layer_height / 2;
			layer_height = node_height * 4 / 3;
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

	function give_bits(num, from, amount, add) {
		var bit_len = hob(num);
		var tail_num = bit_len - from;
		if (tail_num < 0 || tail_num > 4)
			return -1;
		var tail_mask = get_solid_mask(tail_num);
		var head_mask = get_solid_mask(from) << (tail_num);
		var tail = num & tail_mask;
		var head = (num & head_mask) << amount;
		var mid = add << tail_num;
		return head | mid | tail;
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
		var bit_base = hob(game_data.global_root.position);
		var bit_dif = hob(target.position) - bit_base;
		var i = 0;
		while (i < 63) {
			var cur_node = game_data.active_nodes[i];
			var target_position = take_bits(cur_node.position, bit_base, bit_dif, target.position);
			if (target_position == -1) {
				game_data.buffer_nodes.push(cur_node);
			}
			else {
				cur_node.move_target = game_data.active_nodes[target_position - 1].relative_pos;
				cur_node.move_position = target_position;
				cur_node.move_value = cur_node.value;
				cur_node.move_thickness = game_data.active_nodes[target_position - 1].group.firstChild.strokeWidth;
			}
			i++;
		}
		var relocs = []; // Stands for relocations. I don't know what to call it tbh
		var ranges = [];
		var amount = 32;
		i = 0;
		while (i < bit_dif) {
			var j = 0;
			while (j < amount) {
				relocs.push(j + amount);
				j++;
			}
			ranges.push({
				from: Math.pow(2, 5 - i) * target.value,
				to: Math.pow(2, 5 - i) * target.value + amount
			});
			i++;
			amount /= 2;
		}
		i = 0;
		var leftie = relocs[0];
		var j = 0;
		while (game_data.buffer_nodes.length > 0) {
			if (relocs[i] < leftie) {
				leftie = relocs[i];
				j = 0;
			}
			game_data.buffer_nodes[0].move_target = game_data.active_nodes[relocs[i] - 1].relative_pos;
			game_data.buffer_nodes[0].move_position = relocs[i];
			game_data.buffer_nodes[0].move_value = leftie * target.value + j;
			game_data.buffer_nodes[0].move_thickness = game_data.active_nodes[relocs[i] - 1].group.firstChild.strokeWidth;
			game_data.buffer_nodes.splice(0, 1);
			i++;
			j++;
		}
		i = 0;
		while (i < game_data.active_nodes.length) {
			game_data.active_nodes[i].position = game_data.active_nodes[i].move_position;
			i++;
		}
		sort_active_nodes(game_data.active_nodes, 0, game_data.active_nodes.length - 1);
		get_more_node_data(ranges);
	}

	function move_back(amount) {
		var base = game_data.global_root.value;
		var new_base_value = base >> amount;
		if (new_base_value <= 0)
			return;
		var bit_base = hob(base);
		var i = 0;
		var add = 0;
		while (i < amount) {
			add <<= 1;
			add |= base & 1;
			i++;
		}
		i = 0;
		while (i < 63) {
			var cur_node = game_data.active_nodes[i];
			var target_position = give_bits(cur_node.position, 1, amount, add);
			if (target_position == -1) {
				game_data.buffer_nodes.push(cur_node);
			}
			else {
				cur_node.move_target = game_data.active_nodes[target_position - 1].relative_pos;
				cur_node.move_position = target_position;
				cur_node.move_value = cur_node.value;
				cur_node.move_thickness = game_data.active_nodes[target_position - 1].group.firstChild.strokeWidth;
			}
			i++;
		}
		var relocs = [];
		var ranges = [];
		var total = 32;
		var len = 16;
		i = 0;
		var off = base % 2 == 0 ? len : 0;
		while (i <= 5) {
			var j = off;
			while (j < len + off) {
				relocs.push(j + total);
				j++;
			}
			ranges.push({
				from: Math.pow(2, 5 - i) * new_base_value + off,
				to: Math.pow(2, 5 - i) * new_base_value + len + off
			});
			i++;
			total /= 2;
			len /= 2;
			if (len < 1) {
				len = 1;
				off = 0;
			}
			else
				off = base % 2 == 0 ? len : 0;
		}
		i = 0;
		off = base % 2 == 0 ? 16 : 0;
		var leftie = relocs[0] - off;
		var j = 0;
		while (game_data.buffer_nodes.length > 0) {
			if (relocs[i] - off < leftie) {
				off /= 2;
				if (off < 1 && off > 0)
					off = 0;
				leftie = relocs[i] - off;
				j = 0;
			}
			game_data.buffer_nodes[0].move_target = game_data.active_nodes[relocs[i] - 1].relative_pos;
			game_data.buffer_nodes[0].move_position = relocs[i];
			game_data.buffer_nodes[0].move_value = leftie * new_base_value + j + off;
			game_data.buffer_nodes[0].move_thickness = game_data.active_nodes[relocs[i] - 1].group.firstChild.strokeWidth;
			game_data.buffer_nodes.splice(0, 1);
			i++;
			j++;
		}
		i = 0;
		while (i < game_data.active_nodes.length) {
			game_data.active_nodes[i].position = game_data.active_nodes[i].move_position;
			i++;
		}
		sort_active_nodes(game_data.active_nodes, 0, game_data.active_nodes.length - 1);
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
				cur_node.base.x = cur_node.relative_pos.x * width;
				cur_node.base.y = cur_node.relative_pos.y * height;
				cur_node.base.width = cur_node.relative_pos.size_dx * height;
				cur_node.base.height = cur_node.relative_pos.size_dy * height;
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
		while (i < game_data.active_nodes.length) {
			var cur_node = game_data.active_nodes[i];
			cur_node.group.position.x = cur_node.move_target.x * width;
			cur_node.group.position.y = cur_node.move_target.y * height;
			cur_node.group.bounds.width = cur_node.move_target.size_dx * height;
			cur_node.group.bounds.height = cur_node.move_target.size_dy * height;
			cur_node.value = cur_node.move_value;
			var leftie = cur_node.value % 2 == 0 ? false : true;
			if (leftie != cur_node.left_pointed) {
				cur_node.left_pointed = leftie;
				cur_node.group.firstChild.scale(-1, 1);
			}
			var node_color = game_data.colors[game_data.node_factions[cur_node.value].toString()];
			var num_digits = cur_node.value.toString().length;
			cur_node.relative_pos = cur_node.move_target;
			cur_node.base = null;
			cur_node.rad = cur_node.group.firstChild.bounds.width / 2;
			cur_node.group.lastChild.content = cur_node.value;
			cur_node.moving = false;
			cur_node.group.firstChild.strokeColor = node_color['line'];
			cur_node.group.firstChild.fillColor = node_color['fill'];
			cur_node.group.firstChild.strokeWidth = cur_node.move_thickness;
			if (i < 31) {
				var sine_size = cur_node.group.firstChild.bounds.width / 2.3;
				var num_w = sine_size * (2 - 1 / num_digits);
				var num_h = (num_w / num_digits) * 1.45;
				cur_node.group.lastChild.visible = true;
				cur_node.group.lastChild.fillColor = node_color['num'];
				cur_node.group.lastChild.content = cur_node.value.toString();
				cur_node.group.lastChild.bounds.width = num_w;
				cur_node.group.lastChild.bounds.height = num_h;
				cur_node.group.lastChild.bounds.x = cur_node.group.position.x - num_w / 2;
				cur_node.group.lastChild.bounds.y = cur_node.group.position.y - num_h / 2;
			}
			else {
				var dot_w = cur_node.group.firstChild.bounds.width * 0.7246377;
				var dot_h = dot_w * 0.483333;
				cur_node.group.lastChild.fillColor = node_color['num'];
				cur_node.group.lastChild.content = "...";
				cur_node.group.lastChild.bounds.width = dot_w;
				cur_node.group.lastChild.bounds.height = dot_h;
				cur_node.group.lastChild.bounds.x = cur_node.group.position.x - dot_w / 2;
				cur_node.group.lastChild.bounds.y = cur_node.group.position.y - dot_h / 2;
			}
			i++;
		}
		i = 0;
		while (i < game_data.active_nodes.length) {
			show_connections(game_data.active_nodes[i]);
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
				hide_connections(cur_node);
				cur_node.group.position.x = cur_node.relative_pos.x * width;
				cur_node.group.position.y = cur_node.relative_pos.y * height;
				cur_node.group.bounds.width = cur_node.relative_pos.size_dx * height;
				cur_node.group.bounds.height = cur_node.relative_pos.size_dy * height;
				i++;
			}
			i = 0;
			while (i < 63) {
				show_connections(game_data.active_nodes[i]);
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
		var x_sign = target.value % 2 == 0 ? -1 : 1;
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
		var attack_img = new scope.Raster('assets/icons/009-crosshair.png');
		attack_img.bounds.width = attack_rad * 2;
		attack_img.bounds.height = attack_rad * 2;
		attack_img.position.x = attack_point.x;
		attack_img.position.y = attack_point.y;
		var attack_option = new scope.Group(attack_circle, attack_img);
		var attack_base = new scope.Rectangle();
		attack_base.x = attack_option.position.x;
		attack_base.y = attack_option.position.y;
		attack_base.width = attack_option.bounds.width;
		attack_base.height = attack_option.bounds.height;
		attack_option.bounds.width = 0.0000001;
		attack_option.bounds.height = 0.0000001;
		var attack_relative_pos = {
			x: attack_base.x / scope.view.size.width,
			y: attack_base.y / scope.view.size.height,
			size_dx: attack_base.width / scope.view.size.height,
			size_dy: attack_base.height / scope.view.size.height
		};
		var connect_rad = move_rad;
		var connect_x = x_sign * (1.8 * move_rad + target.group.bounds.width / 2) * Math.sqrt(3) / 2;
		var connect_y = (1.8 * move_rad + target.group.bounds.height / 2) / -2;
		var connect_point = new scope.Point(ref_x + connect_x, ref_y + connect_y);
		var connect_circle = new scope.Path.Circle(connect_point, connect_rad);
		connect_circle.strokeWidth = ref_stroke_width / 2;
		connect_circle.strokeColor = colors['line'];
		connect_circle.fillColor = colors['fill'];
		var connect_char = new scope.PointText(connect_point);
		connect_char.position.x -= connect_rad / 2;
		connect_char.fillColor = colors['num'];
		connect_char.content = 'C';
		connect_char.bounds.width = connect_rad;
		connect_char.bounds.height = connect_rad * 4 / 3;
		var connect_option = new scope.Group(connect_circle, connect_char);
		var connect_base = new scope.Rectangle();
		connect_base.x = connect_option.position.x;
		connect_base.y = connect_option.position.y;
		connect_base.width = connect_option.bounds.width;
		connect_base.height = connect_option.bounds.height;
		connect_option.bounds.width = 0.0001;
		connect_option.bounds.height = 0.0001;
		var connect_relative_pos = {
			x: connect_base.x / scope.view.size.width,
			y: connect_base.y / scope.view.size.height,
			size_dx: connect_base.width / scope.view.size.height,
			size_dy: connect_base.height / scope.view.size.height
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
			connect: {
				group: connect_option,
				relative_pos: connect_relative_pos,
				base: connect_base,
				selected: false,
				hovered: false,
				grown: false,
				value: target.value
			}
		};
		game_data.actions.push(options.move);
		game_data.actions.push(options.attack);
		game_data.actions.push(options.connect);
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
			if (target == game_data.global_root) {
				move_back(1);
			}
			else {
				move_to(target);
			}
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
		connect_option.onMouseEnter = function(event) {
			options.connect.hovered = true;
			grow_node(options.connect);
		}
		connect_option.onMouseLeave = function(event) {
			options.connect.hovered = false;
			ungrow_node(options.connect);
		}
		connect_option.onClick = function(event) {
			select_action(options.connect);
		}
		// move_option.onClick = function(event) {
		// 	check_selection(move_option);
		// }
		target.options = options;
		add_animation(options, pop_action_animation, pop_action_stop, 150);
	}

	function take_action(origin, target) {
		if (game_data.action_index == 1) {
			$.ajax({
				type: "GET",
				url: "take_action",
				data: {
					origin: origin.value,
					target: target.value,
					effect: 1
				},
				datatype: "html",
				success: function (raw) {
					var data = JSON.parse(raw);
					if (data['status'] != 'success') {
						console.log(data);
						return;
					}
					var origin_fac = game_data.node_factions[origin.value];
					var target_fac = game_data.node_factions[target.value];
					var origin_change = data.origin;
					var target_change = data.target;
					if (origin_change == 'to_target') {
						game_data.node_factions[origin.value] = target_fac;
						var colors = game_data.colors[target_fac.toString()];
						origin.group.firstChild.strokeColor = colors.line;
						origin.group.firstChild.fillColor = colors.fill;
						origin.group.lastChild.fillColor = colors.num;
					}
					if (target_change == 'to_origin') {
						game_data.node_factions[target.value] = origin_fac;
						var colors = game_data.colors[origin_fac.toString()];
						target.group.firstChild.strokeColor = colors.line;
						target.group.firstChild.fillColor = colors.fill;
						target.group.lastChild.fillColor = colors.num;
					}
					if (origin.value == (target.value >> 1)) { // origin is dad
						game_data.node_connections[target.value].dad = origin.value;
						hide_connections(target);
						show_connections(target);
					}
					else if (origin.value == (target.value - 1)) { // origin is bro
						game_data.node_connections[target.value].bro = origin.value;
						hide_connections(target);
						show_connections(target);
					}
					else if (target.value == (origin.value >> 1)) { // target is dad
						game_data.node_connections[origin.value].dad = target.value;
						hide_connections(origin);
						show_connections(origin);
					}
					else if (target.value == (origin.value - 1)) { // target is bro
						game_data.node_connections[origin.value].bro = target.value;
						hide_connections(origin);
						show_connections(origin);
					}
					else {
						console.log("could not find relationsip between: (1/3)");
						console.log(origin);
						console.log(target);
						return;
					}
				}
			});
		}
		else if (game_data.action_index == 2) {
			$.ajax({
				type: "GET",
				url: "take_action",
				data: {
					origin: origin.value,
					target: target.value,
					effect: 4
				},
				datatype: "html",
				success: function (raw) {
					var data = JSON.parse(raw);
					if (data['status'] != 'success') {
						console.log(data);
						return;
					}
					if (origin.value == (target.value >> 1)) { // origin is dad
						game_data.node_connections[target.value].dad = origin.value;
						hide_connections(target);
						show_connections(target);
					}
					else if (origin.value == (target.value - 1)) { // origin is bro
						game_data.node_connections[target.value].bro = origin.value;
						hide_connections(target);
						show_connections(target);
					}
					else if (target.value == (origin.value >> 1)) { // target is dad
						game_data.node_connections[origin.value].dad = target.value;
						hide_connections(origin);
						show_connections(origin);
					}
					else if (target.value == (origin.value - 1)) { // target is bro
						game_data.node_connections[origin.value].bro = target.value;
						hide_connections(origin);
						show_connections(origin);
					}
					else {
						console.log("could not find relationsip between: (1/3)");
						console.log(origin);
						console.log(target);
						return;
					}
				}
			});
		}
	}

	function check_selection(target) {
		if (!target.selected) {
			select_node(target);
			if (game_data.selected_nodes.length >= 1 && game_data.action_index != -1) {
				game_data.selected_nodes.push(target);
				take_action(game_data.selected_nodes[0], target);
				remove_options(game_data.selected_nodes[0]);
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
		var animation = {
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

	function set_assets() {
		var icon_up = new scope.Raster('assets/icons/001-arrow-up.png');
		var icon_up_right = new scope.Raster('assets/icons/002-arrow-up-right.png');
		var icon_right = new scope.Raster('assets/icons/003-arrow-right.png');
		var icon_down_right = new scope.Raster('assets/icons/004-arrow-down-right.png');
		var icon_down = new scope.Raster('assets/icons/005-arrow-down.png');
		var icon_down_left = new scope.Raster('assets/icons/006-arrow-down-left.png');
		var icon_left = new scope.Raster('assets/icons/007-arrow-left.png');
		var icon_up_left = new scope.Raster('assets/icons/008-arrow-up-left.png');
		var icon_attack = new scope.Raster('assets/icons/009-crosshair.png');
		icon_up.visible = false;
		icon_up_right.visible = false;
		icon_right.visible = false;
		icon_down_right.visible = false;
		icon_down.visible = false;
		icon_down_left.visible = false;
		icon_left.visible = false;
		icon_up_left.visible = false;
		icon_attack.visible = false;
	}

	function init() {
		get_initial_node_data();
		set_resize();
		set_assets();
		scope.view.onFrame = function(event) {
			tick(event);
		};
	}

	function init_debug() {
		console.log("Starting init...");
		get_initial_node_data(); // Sets up the initial map
		console.log("Initial node data loaded");
		set_resize();
		console.log("Setting up assets...");
		set_assets();
		console.log("Canvas resize set up");
		scope.view.onFrame = function(event) {
			tick(event);
		};
		console.log("Ticking now...");
	}

	init_debug();

});
