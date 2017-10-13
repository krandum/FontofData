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
	var wl = -0.4 * w;
	var wh = 2.4 * w;
	var h = scope.view.size.height / 2;
	var hh = 2.5 * h;
	var m = Math.min(w, h);

	var game_data = {
		fov: 400,
		view_dist: 300,
		tilt: -23,
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
		user_info: {},
		user_interface: {},
		global_root: null,
		old_root: null,
		date: new Date()
	};

	var g_theta = game_data.tilt * Math.PI / 180;

	// function make_ui() {
	// 	var ui = game_data.user_interface;
	//
	// 	ui.card = {};
	//
	// 	ui.set_card = function() {
	// 		// THINGS THAT WILL BE REPLACED WITH ACTUAL DATABASE REQUEST STUFF
	//
	// 		// END OF THOSE THINGS
	// 	};
	// 	ui.init = function() {
	// 		ui.set_card();
	// 	};
	// }
// Getting user information
// function get_user_info() {
// 	$.ajax({
// 		type: "GET",
// 		url: "request_userdata",
// 		data: {
// 				//current session user
// 		},
// 		datatype: "html",
// 		success: function (raw) {
// 			var data = JSON.parse(raw);
// 			var user_info = game_data.user_info;
// 			user_info.name = data['user']['name'];
// 			user_info.picture = data['user']['picture'];
// 			user_info.faction_id = data['user']['faction_id'];
// 			user_info.resources = data['user']['resources'];
// 			user_info.gem_placeholder = data['user']['gems'];
// 		},
// 		async: true
// 	});
// }

	function make_ui() {
		var user = game_data.user_info;
		user.faction_id = 3;//remove with query
		var ui = game_data.user_interface;
		ui.color_palette = {
			1: {//Ancient
				primary: '#1B466B',
				secondary: '#999999',
				basis: '#090446',
				accent: '#004299',
				highlight: '#BCDEFF'
			},
			2: {//Rocks
				primary: '#7F0812',
				secondary: '#E52D00',
				basis: '#0F0202',
				accent: '#FF8300',
				highlight: '#FAF9F9'
			},
			3: {//Elves
				primary: '#588401',
				secondary: '#3EB200',
				basis: '#352E09',
				accent: '#40ED4B',
				highlight: '#FFFFD8'
			},
			4: {//Jellyfish
				primary: '#2188DD',
				secondary: '#AE45C7',
				basis: '#094074',
				accent: '#E2E544',
				highlight: '#C9F0FF'
			}
		};
		ui.card = {};
		function hex_to_rgba(hex, alpha) {
			var r = parseInt(hex.slice(1, 3), 16),
			g = parseInt(hex.slice(3, 5), 16),
			b = parseInt(hex.slice(5, 7), 16);

			if (alpha) {
				return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
			} else {
				return "rgb(" + r + ", " + g + ", " + b + ")";
			}
		}
		ui.set_colors = function() {
			var cur_div = document.getElementById('info_pane');
			cur_div.style.backgroundColor = hex_to_rgba(ui.color_palette[user.faction_id].primary, .75);
			cur_div.style.borderColor = ui.color_palette[user.faction_id].accent;
			cur_div.style.color = ui.color_palette[user.faction_id].highlight;
			cur_div = document.getElementsByClassName('search_bar')[0];
			cur_div.style.backgroundColor = hex_to_rgba(ui.color_palette[user.faction_id].basis, .75);
			cur_div.style.borderColor = ui.color_palette[user.faction_id].accent;
			cur_div = document.getElementsByClassName('quest_pane')[0];
			cur_div.style.backgroundColor = hex_to_rgba(ui.color_palette[user.faction_id].basis, .75);
			cur_div.style.borderColor = ui.color_palette[user.faction_id].accent;
			cur_div = document.getElementsByClassName('status_bar')[0];
			cur_div.style.backgroundColor = hex_to_rgba(ui.color_palette[user.faction_id].basis, .75);
			cur_div.style.borderColor = ui.color_palette[user.faction_id].accent;
			cur_div.style.color = ui.color_palette[user.faction_id].highlight;
		};
		ui.set_card = function() {
			// THINGS THAT WILL BE REPLACED WITH ACTUAL DATABASE REQUEST STUFF

			// END OF THOSE THINGS
		};
		ui.init = function() {
			ui.set_colors();
			ui.set_card();
		};
		ui.init();
	}

	function make_background() {
		var background = game_data.background;

		var d_off = game_data.view_dist / Math.tan(-g_theta);
		var h_off = d_off / Math.cos(-g_theta);
		var num = 9;
		var basis = (((d_off + 2*h - 40) / Math.cos(-g_theta)) - h_off) / num;

		background.y_range = { base: basis, range: basis / 3.1 };
		background.y_range.base -= background.y_range.range;
		background.y_range.mid = background.y_range.base + background.y_range.range / 2;
		background.x_range = { base: basis, range: basis / 3.1 };
		background.x_range.base -= background.x_range.range;
		background.x_range.mid = background.x_range.base + background.x_range.range / 2;
		background.z_range = { range: basis, force: basis / 4.1 };

		background.triangles = [];
		background.y_fade = 40;
		var shifter = { x: w, y: background.y_fade, z: 0 }, tmp;
		change_actual_of_seen(shifter, { x: 0, y: -background.y_range.mid, z: 0 });
		background.y_lim = shifter.y;
		shifter = { x: w, y: 2*h, z: 0};
		change_actual_of_seen(shifter, { x: 0, y: basis, z: 0 });
		console.log(2*h);
		hh = shifter.y;
		console.log(hh);
		background.light_ray = normalize({ x: 0.7, y: 0.5, z: 1 });
		background.map = { top: 1, bot: 0, moved_top: false, moved_bot: false };
		background.rows = [];

		background.add_point = function(row, x, y, z) {
			var point = { x: x, y: y, z: z };
			point.triangles = [];
			var i = row.points.length;
			while (--i >= 0 && row.points[i].x > x);
			if (++i == row.points.length)
				row.points.push(point);
			else
				row.points.splice(i, 0, point);
			return point;
		};
		function has_triangle(p1, p2, p3) {
			if (p1.x > p2.x){ tmp = p1; p1 = p2; p2 = tmp; }
			if (p2.x > p3.x){ tmp = p2; p2 = p3; p3 = tmp; }
			if (p1.y > p2.y){ tmp = p1; p1 = p2; p2 = tmp; }
			var cur = -1;
			while (++cur < p1.triangles.length) {
				var cur_triangle = p1.triangles[cur];
				if (cur_triangle.points[0] == p1 &&
					cur_triangle.points[1] == p2 &&
					cur_triangle.points[2] == p3)
					return true;
			}
			return false;
		}
		background.add_triangle = function(p1, p2, p3, base, dir) {
			var path = new scope.Path();
			if (p1.x > p2.x){ tmp = p1; p1 = p2; p2 = tmp; }
			if (p2.x > p3.x){ tmp = p2; p2 = p3; p3 = tmp; }
			if (p1.y > p2.y){ tmp = p1; p1 = p2; p2 = tmp; }
			var edge1 = get_vector(p2, p1);
			var edge2 = get_vector(p3, p1);
			var normal = normalize(cross(edge1, edge2));
			var theta = get_angle(normal, this.light_ray);
			var cos = Math.cos(theta);
			// Grayscale
			var alpha = Math.floor(192 * cos);
			var bit = alpha.toString(16);
			var color = "#" + bit + bit + bit;
			// Color gradient
			// var c1 = game_data.colors['0'].light;
			// var c2 = game_data.colors['0'].dark;
			// var red = Math.floor((c1[0] - c2[0]) * cos) + c2[0];
			// var green = Math.floor((c1[1] - c2[1]) * cos) + c2[1];
			// var blue = Math.floor((c1[2] - c2[2]) * cos) + c2[2];
			// var r_bit = red.toString(16);
			// var g_bit = green.toString(16);
			// var b_bit = blue.toString(16);
			// var color = "#" + r_bit + g_bit + b_bit;
			path.add(new scope.Segment(new scope.Point(p1.x, p1.y)));
			path.add(new scope.Segment(new scope.Point(p2.x, p2.y)));
			path.add(new scope.Segment(new scope.Point(p3.x, p3.y)));
			path.closed = true;
			path.fillColor = color;
			path.strokeColor = color;
			path.strokeWidth = 1;
			path.strokeJoin = "bevel";
			path.sendToBack();
			var triangle = {
				path: path,
				points: [p1, p2, p3],
				base: base,
				dir: dir,
				cos: cos
			};
			this.triangles.push(triangle);
			p1.triangles.push(triangle);
			p2.triangles.push(triangle);
			p3.triangles.push(triangle);
			return triangle;
		};
		background.change_colors = function(light, dark) {
			game_data.colors['0'].dark = dark;
			game_data.colors['0'].light = light;
			var i = -1, cur_triangle;
			var red, green, blue, r_bit, g_bit, b_bit, color;
			while (++i < this.triangles.length) {
				cur_triangle = this.triangles[i];
				red = Math.floor((light[0] - dark[0]) * cur_triangle.cos) + dark[0];
				green = Math.floor((light[1] - dark[1]) * cur_triangle.cos) + dark[1];
				blue = Math.floor((light[2] - dark[2]) * cur_triangle.cos) + dark[2];
				r_bit = red.toString(16);
				g_bit = green.toString(16);
				b_bit = blue.toString(16);
				color = "#" + r_bit + g_bit + b_bit;
				cur_triangle.path.fillColor = color;
				cur_triangle.path.strokeColor = color;
			}
		};
		background.set_grayscale = function() {
			var i = -1, cur_triangle, alpha, bit;
			while (++i < this.triangles.length) {
				cur_triangle = this.triangles[i];
				alpha = Math.floor(192 * cur_triangle.cos);
				bit = alpha.toString(16);
				color = "#" + bit + bit + bit;
				cur_triangle.path.fillColor = color;
				cur_triangle.path.strokeColor = color;
			}
		}
		background.add_row = function(base_y, y_mod) {
			if (y_mod != 1 && y_mod != -1)
				return;
			var cur = { x: w, y: base_y, z: 0 };
			var change = { x: 0, y: y_mod * this.y_range.mid, z: 0 };
			change_actual_of_seen(cur, change);
			var base = { mid: cur.y };
			change.y = -this.y_range.range / 2;
			change_actual_of_seen(cur, change);
			base.min = cur.y;
			change.y = this.y_range.range;
			change_actual_of_seen(cur, change);
			base.max = cur.y;
			var row = {
				base: base,
				points: [],
				left_above: -1,
				left_below: -1,
				right_above: -1,
				right_below: -1
			};
			var ref_row = null;
			var row_index;
			if (y_mod == -1) {
				if (this.map.moved_top)
					ref_row = this.rows[this.map.top];
				this.map.moved_top = true;
				this.map.top--;
				this.rows[this.map.top] = row;
				row_index = this.map.top;
			}
			else { // y_mod == 1
				if (this.map.moved_top)
					ref_row = this.rows[this.map.bot];
				this.map.moved_bot = true;
				this.map.bot++;
				this.rows[this.map.bot] = row;
				row_index = this.map.bot;
			}
			cur.x = wl - (this.x_range.base + this.x_range.range / 2);
			var cur_point = null, last_point, prev_z;
			var left_ref = -1, right_ref = -1, last_left, last_right;
			var cur_index = -1, last_index;
			change.z = 0;
			while (cur.x < wh) {
				last_point = cur_point;
				cur.y = base.min;
				cur.z = 0;
				change.x = Math.floor(Math.random() * this.x_range.range) + this.x_range.base;
				change.y = Math.floor(Math.random() * this.y_range.range);
				prev_z = change.z;
					while (Math.abs(prev_z - change.z) < this.z_range.force)
				change.z = Math.floor(Math.random() * this.z_range.range) - this.z_range.range / 2;
				change_actual_of_seen(cur, change);
				cur_point = this.add_point(row, cur.x, cur.y, cur.z);
				cur_index = row.points.indexOf(cur_point);
				last_index = row.points.indexOf(last_point);
				if (ref_row != null) {
					last_left = left_ref;
					last_right = right_ref;
					right_ref = -1;
					left_ref = ref_row.points.length;
					while (++right_ref < ref_row.points.length &&
						x_dif(ref_row.points[right_ref], cur_point) < 0);
					while (--left_ref >= 0 && x_dif(ref_row.points[left_ref], cur_point) > 0);
					if (right_ref != ref_row.points.length && left_ref != -1) {
						if (last_left == -1) {
							this.add_triangle(cur_point, ref_row.points[left_ref],
								ref_row.points[right_ref], row_index - y_mod, y_mod);
						}
						else if (last_left == left_ref && last_right == right_ref) {
							this.add_triangle(cur_point, ref_row.points[right_ref],
								last_point, row_index, -y_mod);
						}
						else if (last_right == left_ref) {
							this.add_triangle(cur_point, ref_row.points[left_ref],
								ref_row.points[right_ref], row_index - y_mod, y_mod);
							this.add_triangle(cur_point, ref_row.points[left_ref],
								last_point, row_index, -y_mod);
						}
						else {
							this.add_triangle(cur_point, ref_row.points[left_ref],
								ref_row.points[right_ref], row_index - y_mod, y_mod);
							if (left_ref - last_right == 1) {
								this.add_triangle(cur_point, ref_row.points[last_right],
									ref_row.points[left_ref], row_index - y_mod, y_mod);
								this.add_triangle(cur_point, ref_row.points[last_right],
									last_point, row_index, -y_mod);
							}
							else {
								while (--left_ref > last_right) {
									if (left_ref - last_right == 1) {
										this.add_triangle(cur_point, ref_row.points[left_ref],
											ref_row.points[left_ref + 1], row_index - y_mod, y_mod);
										this.add_triangle(cur_point, last_point,
											ref_row.points[left_ref], row_index, -y_mod);
										this.add_triangle(last_point, ref_row.points[left_ref],
											ref_row.points[last_right], row_index - y_mod, y_mod);
									}
									else {
										this.add_triangle(cur_point, ref_row.points[left_ref],
											ref_row.points[left_ref + 1], row_index - y_mod, y_mod);
									}
								}
							}
						}
					}
					else if (left_ref != -1 && last_right == left_ref) {
						this.add_triangle(cur_point, last_point, ref_row.points[left_ref],
							row_index, -y_mod);
					}
				}
			}
		};
		background.remove_row = function(y_mod) {
			var row, cur_point, cur_triangle, index;
			if (y_mod == 1 && this.map.moved_top) {
				row = this.rows[this.map.top];
			}
			else if (y_mod == -1 && this.map.moved_bot) {
				row = this.rows[this.map.bot];
			}
			else
				return;
			while (row.points.length > 0) {
				cur_point = row.points[0];
				while (cur_point.triangles.length > 0) {
					cur_triangle = cur_point.triangles[0];
					index = cur_triangle.points[0].triangles.indexOf(cur_triangle);
					cur_triangle.points[0].triangles.splice(index, 1);
					index = cur_triangle.points[1].triangles.indexOf(cur_triangle);
					cur_triangle.points[1].triangles.splice(index, 1);
					index = cur_triangle.points[2].triangles.indexOf(cur_triangle);
					cur_triangle.points[2].triangles.splice(index, 1);
					index = this.triangles.indexOf(cur_triangle);
					this.triangles.splice(index, 1);
					cur_triangle.path.remove();
				}
				row.points.splice(0, 1);
			}
			if (y_mod == 1) {
				delete this.rows[this.map.top];
				this.map.top++;
			}
			else {
				delete this.rows[this.map.bot];
				this.map.bot--;
			}
		};
		background.set_edges = function() {
			var cur = this.map.top - 1, cur_row;
			var i, j, top_found, bot_found, cur_point, cur_triangle;
			while (++cur <= this.map.bot) {
				cur_row = this.rows[cur];
				cur_row.left_above = 0;
				cur_row.left_below = 0;
				top_found = false;
				bot_found = false;
				i = -1;
				while (++i < cur_row.points.length && (!top_found || !bot_found)) {
					cur_point = cur_row.points[i];
					j = -1;
					while (++j < cur_point.triangles.length) {
						cur_triangle = cur_point.triangles[j];
						if ((cur_triangle.base == cur && cur_triangle.dir == -1) ||
							(cur_triangle.base == cur - 1 && cur_triangle.dir == 1))
							top_found = true;
						else if ((cur_triangle.base == cur && cur_triangle.dir == 1) ||
							(cur_triangle.base == cur + 1 && cur_triangle.dir == -1))
							bot_found = true;
						else
							console.log("weird left");
					}
					if (!top_found)
						cur_row.left_above++;
					if (!bot_found)
						cur_row.left_below++;
				}
				cur_row.right_above = cur_row.points.length - 1;
				cur_row.right_below = cur_row.points.length - 1;
				top_found = false;
				bot_found = false;
				i = cur_row.points.length;
				while (--i >= 0 && (!top_found || !bot_found)) {
					cur_point = cur_row.points[i];
					j = -1;
					while (++j < cur_point.triangles.length) {
						cur_triangle = cur_point.triangles[j];
						if ((cur_triangle.base == cur && cur_triangle.dir == -1) ||
							(cur_triangle.base == cur - 1 && cur_triangle.dir == 1))
							top_found = true;
						else if ((cur_triangle.base == cur && cur_triangle.dir == 1) ||
							(cur_triangle.base == cur + 1 && cur_triangle.dir == -1))
							bot_found = true;
						else
							console.log("weird right");
					}
					if (!top_found)
						cur_row.right_above--;
					if (!bot_found)
						cur_row.right_below--;
				}
			}
		}
		background.trim_sides = function() {
			var cur = this.map.top - 1, cur_row, cur_point, cur_triangle;
			var i, j, top_found, bot_found;
			var top_lim = 0;
			var bot_lim = 1;
			while (++cur <= this.map.bot) {
				if (cur >= this.map.top + 1)
					top_lim = -1;
				if (cur >= this.map.bot)
					bot_lim = 0;
				cur_row = this.rows[cur];
				while (cur_row.points[0].x < wl) {
					cur_point = cur_row.points[0];
					while (cur_point.triangles.length > 0) {
						cur_triangle = cur_point.triangles[0];
						index = cur_triangle.points[0].triangles.indexOf(cur_triangle);
						cur_triangle.points[0].triangles.splice(index, 1);
						index = cur_triangle.points[1].triangles.indexOf(cur_triangle);
						cur_triangle.points[1].triangles.splice(index, 1);
						index = cur_triangle.points[2].triangles.indexOf(cur_triangle);
						cur_triangle.points[2].triangles.splice(index, 1);
						index = this.triangles.indexOf(cur_triangle);
						this.triangles.splice(index, 1);
						cur_triangle.path.remove();
					}
					cur_row.points.splice(0, 1);
				}
				if (cur_row.points.length <= 0)
					console.log("PANIK - with top and removed. Check trim sides on make background");
				else {
					while (cur_row.points[cur_row.points.length - 1].x > wh) {
						cur_point = cur_row.points[cur_row.points.length - 1];
						while (cur_point.triangles.length > 0) {
							cur_triangle = cur_point.triangles[0];
							index = cur_triangle.points[0].triangles.indexOf(cur_triangle);
							cur_triangle.points[0].triangles.splice(index, 1);
							index = cur_triangle.points[1].triangles.indexOf(cur_triangle);
							cur_triangle.points[1].triangles.splice(index, 1);
							index = cur_triangle.points[2].triangles.indexOf(cur_triangle);
							cur_triangle.points[2].triangles.splice(index, 1);
							index = this.triangles.indexOf(cur_triangle);
							this.triangles.splice(index, 1);
							cur_triangle.path.remove();
						}
						cur_row.points.splice(cur_row.points.length - 1, 1);
					}
				}
				this.set_edges();
			}
		};
		background.fill_sides = function() {
			var row_num = this.map.bot + 1, cur_row, prev_point, prev_z, cur;
			var change = { z: 0 };
			while (--row_num >= this.map.top) {
				cur_row = this.rows[row_num];
				while (cur_row.points[0].x > wl) {
					prev_point = cur_row.points[0];
					cur = { x: prev_point.x, y: cur_row.base.min, z: 0};
					change.x = -(Math.floor(Math.random() * this.x_range.range) + this.x_range.base);
					change.y = Math.floor(Math.random() * this.y_range.range);
					prev_z = prev_point.z;
					while (Math.abs(prev_z - change.z) < this.z_range.force)
						change.z = Math.floor(Math.random() * this.z_range.range) - this.z_range.range / 2;
					change_actual_of_seen(cur, change);
					this.add_point(cur_row, cur.x, cur.y, cur.z);
					cur_row.left_above++;
					cur_row.left_below++;
					cur_row.right_above++;
					cur_row.right_below++;
				}
				if (cur_row.points.length <= 0)
					continue;
				while (cur_row.points[cur_row.points.length - 1].x < wh) {
					prev_point = cur_row.points[cur_row.points.length - 1];
					cur = { x: prev_point.x, y: cur_row.base.min, z: 0};
					change.x = Math.floor(Math.random() * this.x_range.range) + this.x_range.base;
					change.y = Math.floor(Math.random() * this.y_range.range);
					prev_z = prev_point.z;
					while (Math.abs(prev_z - change.z) < this.z_range.force)
						change.z = Math.floor(Math.random() * this.z_range.range) - this.z_range.range / 2;
					change_actual_of_seen(cur, change);
					this.add_point(cur_row, cur.x, cur.y, cur.z);
				}
			}
			row_num = this.map.top; // Notice we skip the very top one
			var above, left_edge, right_edge, left_ref, right_ref;
			var cur_col, last_point;
			while (++row_num <= this.map.bot) {
				cur_row = this.rows[row_num];
				above = this.rows[row_num - 1];
				cur_col = cur_row.left_above + 1;
				while (--cur_col >= 0) {
					last_point = cur_row.points[cur_col + 1];
					cur_point = cur_row.points[cur_col];
					right_ref = -1;
					left_ref = above.points.length;
					while (++right_ref < above.points.length &&
						x_dif(above.points[right_ref], cur_point) < 0);
					while (--left_ref >= 0 && x_dif(above.points[left_ref],
						cur_point) > 0);
					if (right_ref != above.points.length && left_ref != -1) {
						if (cur_col == cur_row.left_above) {
							if (right_ref == above.left_below) {
								this.add_triangle(cur_point, above.points[left_ref],
									above.points[right_ref], row_num - 1, 1);
								above.left_below = left_ref;
							}
						}
						else if (cur_col == cur_row.left_above - 1) {
							if (right_ref == above.left_below) {
								this.add_triangle(cur_point, above.points[right_ref],
									cur_row.points[cur_row.left_above], row_num, -1);
								this.add_triangle(cur_point, above.points[left_ref],
									above.points[right_ref], row_num - 1, 1);
								above.left_below = left_ref;
								cur_row.left_above = cur_col;
							}
							else if (left_ref == above.left_below) {
								this.add_triangle(cur_point, cur_row.points[cur_row.left_above],
									above.points[left_ref], row_num, -1);
								cur_row.left_above = cur_col;
							}
							else {
								var du = above.left_below - left_ref;
								var dd = cur_row.left_above - cur_col;
								while ((du > 0 || dd > 0) && du >= 0 && dd >= 0) {
									var ur = above.points[above.left_below];
									var dr = cur_row.points[cur_row.left_above];
									var ul = above.points[above.left_below - 1];
									var dl = cur_row.points[cur_row.left_above - 1];
									var ups = [x_dif(ur, dr) > 0 && du > 0,
										du > dd && du > 0, du > 0];
									var dns = [x_dif(ur, dr) < 0 && dd > 0,
										du < dd && dd > 0, dd > 0];
									var uppy = ((ups[0] && !dns[0]) || (ups[1] && !ups[0] && !ups[1]) ||
										(ups[2] && !dns[0] && !dns[1] && !dns[2]));
									if (uppy) {
										this.add_triangle(ur, ul, dr, row_num - 1, 1);
										above.left_below--;
										du--;
									}
									else if (dns[2]) {
										this.add_triangle(ur, dl, dr, row_num, -1);
										cur_row.left_above--;
										dd--;
									}
								}
							}
						}
					}
				}
				cur_col = cur_row.right_above - 1;
				while (++cur_col < cur_row.points.length) {
					last_point = cur_row.points[cur_col - 1];
					cur_point = cur_row.points[cur_col];
					right_ref = -1;
					left_ref = above.points.length;
					while (++right_ref < above.points.length &&
						x_dif(above.points[right_ref], cur_point) < 0);
					while (--left_ref >= 0 && x_dif(above.points[left_ref],
						cur_point) > 0);
					if (right_ref != above.points.length && left_ref != -1) {
						if (cur_col == cur_row.right_above) {
							if (left_ref == above.right_below) {
								this.add_triangle(cur_point, above.points[left_ref],
									above.points[right_ref], row_num - 1, 1);
								above.right_below = left_ref;
							}
						}
						else if (cur_col == cur_row.right_above + 1) {
							if (left_ref == above.right_below) {
								this.add_triangle(cur_point, above.points[left_ref],
									cur_row.points[cur_row.right_above], row_num, -1);
								this.add_triangle(cur_point, above.points[left_ref],
									above.points[right_ref], row_num - 1, 1);
								above.right_below = right_ref;
								cur_row.right_above = cur_col;
							}
							else if (right_ref == above.right_below) {
								this.add_triangle(cur_point, cur_row.points[cur_row.right_above],
									above.points[right_ref], row_num, -1);
								cur_row.right_above = cur_col;
							}
							else {
								var du = right_ref - above.right_below; //above.left_below - left_ref;
								var dd = cur_col - cur_row.right_above; //cur_row.left_above - cur_col;
								while ((du > 0 || dd > 0) && du >= 0 && dd >= 0) {
									var ur = above.points[above.right_below + 1];
									var dr = cur_row.points[cur_row.right_above + 1];
									var ul = above.points[above.right_below];
									var dl = cur_row.points[cur_row.right_above];
									var ups = [x_dif(ul, dl) < 0 && du > 0, // potential change first greater
										du > dd && du > 0, du > 0];
									var dns = [x_dif(ul, dl) > 0 && dd > 0,
										du < dd && dd > 0, dd > 0];
									var uppy = ((ups[0] && !dns[0]) || (ups[1] && !ups[0] && !ups[1]) ||
										(ups[2] && !dns[0] && !dns[1] && !dns[2]));
									if (uppy) {
										this.add_triangle(ur, ul, dl, row_num - 1, 1);
										above.right_below++;
										du--;
									}
									else if (dns[2]) {
										this.add_triangle(ul, dl, dr, row_num, -1);
										cur_row.right_above++;
										dd--;
									}
								}
							}
						}
					}
				}
			}
		};
		background.move_to = function(from, to, frac) {
			var real_from = { x: from.x, y: from.y, z: 0 };
			real_from.z = unrotate_point(real_from, 0);
			var real_to = { x: to.x, y: to.y, z: 0 };
			real_to.z = unrotate_point(real_to, 0);
			var change = { x: real_to.x - real_from.x, y: real_to.y - real_from.y, z: 0 };
			var cur_row = this.map.top - 1, cur_col, cur_base, cur_triangle, cur_point;
			while (++cur_row <= this.map.bot) {
				cur_base = this.rows[cur_row].base;
				shifter = { x: w, y: cur_base.min, z: 0 };
				change_actual_of_seen(shifter, change);
				cur_base.min = shifter.y
				shifter = { x: w, y: cur_base.mid, z: 0 };
				change_actual_of_seen(shifter, change);
				cur_base.mid = shifter.y
				shifter = { x: w, y: cur_base.max, z: 0 };
				change_actual_of_seen(shifter, change);
				cur_base.max = shifter.y
				cur_col = -1;
				while (++cur_col < this.rows[cur_row].points.length)
				{
					cur_point = this.rows[cur_row].points[cur_col]
					change_actual_of_seen(cur_point, change);
				}
			}
			var cur = -1;
			while (++cur < this.triangles.length) {
				cur_triangle = this.triangles[cur];
				cur_triangle.path.segments[0].point.x = cur_triangle.points[0].x;
				cur_triangle.path.segments[0].point.y = cur_triangle.points[0].y;
				cur_triangle.path.segments[1].point.x = cur_triangle.points[1].x;
				cur_triangle.path.segments[1].point.y = cur_triangle.points[1].y;
				cur_triangle.path.segments[2].point.x = cur_triangle.points[2].x;
				cur_triangle.path.segments[2].point.y = cur_triangle.points[2].y;
			}
			if (change.y > 0) {
				while (this.rows[this.map.bot].base.mid > hh) {
					this.remove_row(-1);
				}
				while (this.rows[this.map.top].base.mid > this.y_fade) {
					this.add_row(this.rows[this.map.top].base.mid, -1);
				}
				this.trim_sides();
			}
			else {
				while (this.rows[this.map.bot].base.mid < hh) {
					this.add_row(this.rows[this.map.bot].base.mid, 1);
				}
				while (this.rows[this.map.top].base.mid < this.y_lim) {
					this.remove_row(1);
				}
			}
			this.set_edges();
			this.fill_sides(frac);
			this.set_edges();
		};
		background.start = function() {
			this.add_row(h, -1);
			while (this.rows[this.map.top].base.mid > this.y_fade) {
				this.add_row(this.rows[this.map.top].base.min, -1);
			}
			while (this.rows[this.map.bot].base.mid < hh) {
				this.add_row(this.rows[this.map.bot].base.max, 1);
			}
			this.set_edges();
		};
		background.start();
	}

	function x_dif(p1, p2) {
		p1.z = unrotate_point(p1, p1.z);
		p2.z = unrotate_point(p2, p2.z);
		var dif = p1.x - p2.x;
		p1.z = rotate_point(p1, p1.z);
		p2.z = rotate_point(p2, p2.z);
		return dif;
	}

	function change_actual_of_seen(point, change) {
		point.z = unrotate_point(point, point.z);
		point.x += change.x;
		point.y += change.y;
		point.z += change.z;
		point.z = rotate_point(point, point.z);
	}

	function change_seen_of_actual(point, change) {
		point.z = rotate_point(point, point.z);
		point.x += change.x;
		point.y += change.y;
		point.z += change.z;
		point.z = unrotate_point(point, point.z);
	}

	var ca = Math.cos(g_theta);
	var sa = Math.sin(g_theta);
	var d = game_data.view_dist;
	var f = game_data.fov;

	function rotate_point(point, z) {
		var ry, rz, rf;
		var x = point.x - w;
		var y = point.y - h;
		ry = y * ca;
		rz = y * sa;

		rf = f / (d + rz);
		point.x = x * rf + w;
		point.y = ry * rf + h;
		return rz + z;
	}

	function unrotate_point(point, z) {
		var rz;
		var x = point.x - w;
		var y = point.y - h;

		point.y = y * d / (ca * f - sa * y);
		point.x = (x / (f / (d + point.y * sa))) + w;
		rz = point.y * sa;
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
				game_data.old_root = game_data.global_root;
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
		if (game_data.node_layer == null)
		{
			game_data.node_layer = new scope.Layer();
		}
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
		game_data.old_root = game_data.active_nodes[0];
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
		game_data.old_root = game_data.active_nodes[0];
		sort_active_nodes(game_data.active_nodes, 0, game_data.active_nodes.length - 1);
		get_more_node_data(ranges);
	}

	var move_nodes = function(target, sigma_frac, delta_frac) {
		var width = scope.view.size.width;
		var height = scope.view.size.height;
		var prev_pos = game_data.old_root.group.position;
		var i = -1;
		var cur_node;
		while (++i < game_data.active_nodes.length) {
			cur_node = game_data.active_nodes[i];
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
			cur_node.moving = true;
		}
		var new_pos = game_data.old_root.group.position;
		game_data.background.move_to(prev_pos, new_pos, sigma_frac);
	}

	var confirm_moved_nodes = function(target) {
		var width = scope.view.size.width;
		var height = scope.view.size.height;
		var i = 0;
		var prev_pos = game_data.old_root.group.position;
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
		var new_pos = game_data.old_root.group.position;
		game_data.background.move_to(prev_pos, new_pos, 1);
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
			if (target == game_data.animations[i].target)
				return true;
			i++;
		}
		return false;
	}

	function remove_animations(target) {
		var i = -1;
		var len = game_data.animations.length;
		while (++i < len)
			if (target == game_data.animations[i].target) {
				game_data.animations.splice(i, 1);
				len--;
				continue;
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
		w = scope.view.size.width / 2;
		h = scope.view.size.height / 2;
		m = Math.min(w, h);
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
		make_ui();
		make_background();
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
		console.log("Making UI pretty...");
		make_ui();
		console.log("Making background...");
		make_background();
		console.log("Canvas resize set up");
		scope.view.onFrame = function(event) {
			tick(event);
		};
		console.log("Ticking now...");
	}

	init_debug();

});
