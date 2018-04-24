function load_SVG(file, name, mirrors) {
	let raw_file = new XMLHttpRequest();
	raw_file.open("GET", file, true);
	raw_file.onreadystatechange = function() {
		if (raw_file.readyState === 4 && (raw_file.status === 200 || raw_file.status === 0)) {
			let raw = raw_file.responseText, exp = /[^d="]* d="([^"]*)"[^ d="]*/g,
				data = "";
			raw.replace(exp, function(match, g1) { data += g1; });
			game_data.icons[name] = new scope.CompoundPath(data);
			game_data.icons[name].strokeWidth = 0;
			game_data.icons[name].visible = false;
			game_data.icon_data[name] = data;
			if (typeof(mirrors) !== 'undefined' && mirrors !== null) {
				let mirror, mirror_icon;
				while (mirrors.length > 0) {
					mirror = mirrors[0];
					mirror_icon = new scope.CompoundPath(data);
					mirror_icon.visible = false;
					mirror_icon.scale(mirror.x_scale, mirror.y_scale);
					game_data.icons[mirror.name] = mirror_icon;
					game_data.icon_data[mirror.name] = mirror_icon.pathData;
					mirrors.splice(0, 1);
				}
			}
		}
	};
	raw_file.send(null);
}

	function make_background() {
		let background = game_data.background,
		d_off = game_data.view_dist / Math.tan(-g_theta),
		h_off = d_off / Math.cos(-g_theta),
		num = 9,
		basis = (((d_off + 2*h - 40) / Math.cos(-g_theta)) - h_off) / num;
		background.y_range = { base: basis, range: basis / 3.1 };
		background.y_range.base -= background.y_range.range;
		background.y_range.mid = background.y_range.base + background.y_range.range / 2;
		background.x_range = { base: basis, range: basis / 3.1 };
		background.x_range.base -= background.x_range.range;
		background.x_range.mid = background.x_range.base + background.x_range.range / 2;
		background.z_range = { range: basis, force: basis / 4.1 };
		background.triangles = [];
		background.y_fade = 30;
		let shifter = { x: w, y: background.y_fade, z: 0 }, tmp;
		change_actual_of_seen(shifter, { x: 0, y: -background.y_range.mid, z: 0 });
		background.y_lim = shifter.y;
		shifter = { x: w, y: 2*h, z: 0};
		change_actual_of_seen(shifter, { x: 0, y: basis, z: 0 });
		hh = shifter.y;
		background.light_ray = normalize({ x: 0.7, y: 0.5, z: 1 });
		background.map = { top: 1, bot: 0, moved_top: false, moved_bot: false };
		background.rows = [];
		background.color_distance_threshold = 342.0;
		background.factioned = false;

		background.add_point = function(row, x, y, z) {
			let point = { x: x, y: y, z: z };
			point.triangles = [];
			let i = row.points.length - 1;
			while (i >= 0 && row.points[i].x > x) i--;
			if (++i === row.points.length) row.points.push(point);
			else row.points.splice(i, 0, point);
			return point;
		};
		// function has_triangle(p1, p2, p3) {
		// 	if (p1.x > p2.x){ tmp = p1; p1 = p2; p2 = tmp; }
		// 	if (p2.x > p3.x){ tmp = p2; p2 = p3; p3 = tmp; }
		// 	if (p1.y > p2.y){ tmp = p1; p1 = p2; p2 = tmp; }
		// 	let cur = -1;
		// 	while (++cur < p1.triangles.length) {
		// 		let cur_triangle = p1.triangles[cur];
		// 		if (cur_triangle.points[0] === p1 &&
		// 			cur_triangle.points[1] === p2 &&
		// 			cur_triangle.points[2] === p3)
		// 			return true;
		// 	}
		// 	return false;
		// }
		function point_color(point, cos, threshold) {
			let frame = game_data.framework, num_rows = frame.length, row_len, left,
				right, bottom = num_rows, top = -1, close_nodes = [];
			while (--bottom >= 0 && frame[bottom].y < point.y);
			while (++top < num_rows && frame[top].y > point.y);
			if (top > 0 && top < num_rows) {
				row_len = frame[top].len;
				left = row_len;
				right = -1;
				while (--left >= 0 && frame[top].nodes[left].x > point.x);
				while (++right < row_len && frame[top].nodes[right].x < point.x);
				if (left >= 0) close_nodes.push(frame[top].nodes[left].node);
				if (right < row_len) close_nodes.push(frame[top].nodes[right].node);
			}
			if (top === 0 || bottom === 0) close_nodes.push(frame[0].nodes[0].node);
			if (bottom > 0 && bottom < num_rows) {
				row_len = frame[bottom].len;
				left = row_len;
				right = -1;
				while (--left >= 0 && frame[bottom].nodes[left].x > point.x);
				while (++right < row_len && frame[bottom].nodes[right].x < point.x);
				if (left >= 0) close_nodes.push(frame[bottom].nodes[left].node);
				if (right < row_len) close_nodes.push(frame[bottom].nodes[right].node);
			}
			let node_colors = [], color, distance, p1 = { x: point.x, y: point.y },
				p2, formatted_colors = [], cur_weight, total_weight = 0;
			p1.z = unrotate_point(p1, 0);
			while (close_nodes.length > 0) {
				color = game_data.colors[game_data.node_factions[close_nodes[0].value]
					.toString()]['background'];
				p2 = { x: close_nodes[0].circle.position.x, y: close_nodes[0].circle.position.y };
				p2.z = unrotate_point(p2, 0);
				distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
				if (distance < threshold) {
					cur_weight = 1 - (distance / threshold);
					node_colors.push({ color: color_times_ratio(string_to_color(color), cos),
						weight: cur_weight });
					total_weight += cur_weight;
				}
				close_nodes.splice(0, 1);
			}
			if (total_weight < 1) {
				node_colors.push({ color: color_times_ratio(0xC0C0C0, cos),
					weight: 1 - total_weight });
				total_weight = 1;
			}
			while (node_colors.length > 0) {
				formatted_colors.push({ color: node_colors[0].color,
					percentage: node_colors[0].weight / total_weight });
				node_colors.splice(0, 1);
			}
			color = color_partial_combine(formatted_colors).toString(16);
			while (color.length < 6) color = '0' + color;
			return '#' + color;
		}
		function two_points(p1, p2, p3) {
			let yd1 = Math.abs(p1.y - p2.y),
				yd2 = Math.abs(p2.y - p3.y),
				yd3 = Math.abs(p3.y - p1.y);
			if (yd1 <= yd2 && yd1 <= yd3)
				return [p3, { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }];
			else if (yd2 <= yd1 && yd2 <= yd3)
				return [p1, { x: (p3.x + p2.x) / 2, y: (p3.y + p2.y) / 2 }];
			else if (yd3 <= yd1 && yd3 <= yd2)
				return [p2, { x: (p3.x + p1.x) / 2, y: (p3.y + p1.y) / 2 }];
		}
		function color_triangle(triangle, _) {
			let [p1, p2] = two_points(triangle.points[0], triangle.points[1], triangle.points[2]);
			let	c1 = point_color(p1, triangle.cos, _.color_distance_threshold),
				c2 = point_color(p2, triangle.cos, _.color_distance_threshold);
			let grad = new scope.Gradient([c1, c2]);
			let color = new scope.Color(grad, new scope.Point(p1.x, p1.y),
				new scope.Point(p2.x, p2.y));
			triangle.path.fillColor = color;
			triangle.path.strokeColor = color;
		}
		function set_triangle_target_color(triangle, _) {
			let [p1, p2] = two_points(triangle.points[0], triangle.points[1], triangle.points[2]);
			let	c1 = point_color(p1, triangle.cos, _.color_distance_threshold),
				c2 = point_color(p2, triangle.cos, _.color_distance_threshold), base;
			if (triangle.reached_target === true) {
				base = {
					from: triangle.path.fillColor.gradient.stops[0].color.toCSS(true),
					to: triangle.path.fillColor.gradient.stops[1].color.toCSS(true)
				};
			}
			else {
				base = color_times_ratio(string_to_color(game_data.colors['1'].background),
					triangle.cos);
				base = { from: base, to: base };
			}
			triangle.target_color = { c1: c1, c2: c2,
				p1: new scope.Point(p1.x, p1.y), p2: new scope.Point(p2.x, p2.y),
				base: base };
		}
		function partial_color_triangle(triangle, frac) {
			let target = triangle.target_color, base = target.base,
				c1 = color_to_color_ratio(base.from, target.c1, frac).toString(16),
				c2 = color_to_color_ratio(base.to, target.c2, frac).toString(16);
			while (c1.length < 6) c1 = '0' + c1;
			c1 = '#' + c1;
			while (c2.length < 6) c2 = '0' + c2;
			c2 = '#' + c2;
			let grad = new scope.Gradient([c1, c2]);
			let color = new scope.Color(grad, target.p1, target.p2);
			triangle.path.fillColor = color;
			triangle.path.strokeColor = color;
		}
		background.confirm_triangle_colors = function() {
			let i = -1;
			while (++i < this.triangles.length)
				this.triangles[i].reached_target = true;
		};
		background.set_triangle_targets = function() {
			let i = -1;
			while (++i < this.triangles.length)
				set_triangle_target_color(this.triangles[i], this);
		};
		background.color_background = function() {
			let i = -1;
			while (++i < this.triangles.length)
				color_triangle(this.triangles[i], this);
		};
		background.partial_color_background = function(frac) {
			let i = -1;
			while (++i < this.triangles.length)
				partial_color_triangle(this.triangles[i], frac);
		};
		background.add_triangle = function(p1, p2, p3, base, dir) {
			let path = new scope.Path();
			if (p1.x > p2.x){ tmp = p1; p1 = p2; p2 = tmp; }
			if (p2.x > p3.x){ tmp = p2; p2 = p3; p3 = tmp; }
			if (p1.y > p2.y){ tmp = p1; p1 = p2; p2 = tmp; }
			let edge1 = get_vector(p2, p1), edge2 = get_vector(p3, p1),
				normal = normalize(cross(edge1, edge2)),
				theta = get_angle(normal, this.light_ray), cos = Math.cos(theta),
				alpha = Math.floor(192 * cos),
				bit = alpha.toString(16), color = "#" + bit + bit + bit;
			path.add(new scope.Segment(new scope.Point(p1.x, p1.y)));
			path.add(new scope.Segment(new scope.Point(p2.x, p2.y)));
			path.add(new scope.Segment(new scope.Point(p3.x, p3.y)));
			path.closed = true;
			path.fillColor = color;
			path.strokeColor = color;
			path.strokeWidth = 1;
			path.strokeJoin = "bevel";
			path.sendToBack();
			let triangle = { path: path, points: [p1, p2, p3], base: base, dir: dir,
				cos: cos, node_dependencies: [], target_color: color, reached_target: false };
			this.triangles.push(triangle);
			p1.triangles.push(triangle);
			p2.triangles.push(triangle);
			p3.triangles.push(triangle);
			return triangle;
		};
		background.change_colors = function(light, dark) {
			game_data.colors['0'].dark = dark;
			game_data.colors['0'].light = light;
			let i = -1, cur_triangle;
			let red, green, blue, r_bit, g_bit, b_bit, color;
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
		background.set_greyscale = function() {
			let i = -1, cur_triangle, alpha, bit, color;
			while (++i < this.triangles.length) {
				cur_triangle = this.triangles[i];
				alpha = Math.floor(192 * cur_triangle.cos);
				bit = alpha.toString(16);
				color = "#" + bit + bit + bit;
				cur_triangle.path.fillColor = color;
				cur_triangle.path.strokeColor = color;
			}
		};
		background.add_row = function(base_y, y_mod) {
			if (y_mod !== 1 && y_mod !== -1) return;
			let cur = { x: w, y: base_y, z: 0 };
			let change = { x: 0, y: y_mod * this.y_range.mid, z: 0 };
			change_actual_of_seen(cur, change);
			let base = { mid: cur.y };
			change.y = -this.y_range.range / 2;
			change_actual_of_seen(cur, change);
			base.min = cur.y;
			change.y = this.y_range.range;
			change_actual_of_seen(cur, change);
			base.max = cur.y;
			let row = { base: base, points: [], left_above: -1, left_below: -1,
				right_above: -1, right_below: -1 };
			let ref_row = null;
			let row_index;
			if (y_mod === -1) {
				if (this.map.moved_top) ref_row = this.rows[this.map.top];
				this.map.moved_top = true;
				this.map.top--;
				this.rows[this.map.top] = row;
				row_index = this.map.top;
			}
			else { // y_mod == 1
				if (this.map.moved_top) ref_row = this.rows[this.map.bot];
				this.map.moved_bot = true;
				this.map.bot++;
				this.rows[this.map.bot] = row;
				row_index = this.map.bot;
			}
			cur.x = wl - (this.x_range.base + this.x_range.range / 2);
			let cur_point = null, last_point, prev_z, left_ref = -1, right_ref = -1,
				last_left, last_right, cur_index = -1, last_index;
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
				if (ref_row !== null) {
					last_left = left_ref;
					last_right = right_ref;
					right_ref = -1;
					left_ref = ref_row.points.length;
					while (++right_ref < ref_row.points.length &&
						x_dif(ref_row.points[right_ref], cur_point) < 0);
					while (--left_ref >= 0 && x_dif(ref_row.points[left_ref], cur_point) > 0);
					if (right_ref !== ref_row.points.length && left_ref !== -1) {
						if (last_left === -1)
							this.add_triangle(cur_point, ref_row.points[left_ref],
								ref_row.points[right_ref], row_index - y_mod, y_mod);
						else if (last_left === left_ref && last_right === right_ref)
							this.add_triangle(cur_point, ref_row.points[right_ref],
								last_point, row_index, -y_mod);
						else if (last_right === left_ref) {
							this.add_triangle(cur_point, ref_row.points[left_ref],
								ref_row.points[right_ref], row_index - y_mod, y_mod);
							this.add_triangle(cur_point, ref_row.points[left_ref],
								last_point, row_index, -y_mod);
						}
						else {
							this.add_triangle(cur_point, ref_row.points[left_ref],
								ref_row.points[right_ref], row_index - y_mod, y_mod);
							if (left_ref - last_right === 1) {
								this.add_triangle(cur_point, ref_row.points[last_right],
									ref_row.points[left_ref], row_index - y_mod, y_mod);
								this.add_triangle(cur_point, ref_row.points[last_right],
									last_point, row_index, -y_mod);
							}
							else {
								while (--left_ref > last_right) {
									if (left_ref - last_right === 1) {
										this.add_triangle(cur_point, ref_row.points[left_ref],
											ref_row.points[left_ref + 1], row_index - y_mod, y_mod);
										this.add_triangle(cur_point, last_point,
											ref_row.points[left_ref], row_index, -y_mod);
										this.add_triangle(last_point, ref_row.points[left_ref],
											ref_row.points[last_right], row_index - y_mod, y_mod);
									}
									else
										this.add_triangle(cur_point, ref_row.points[left_ref],
											ref_row.points[left_ref + 1], row_index - y_mod, y_mod);
								}
							}
						}
					}
					else if (left_ref !== -1 && last_right === left_ref)
						this.add_triangle(cur_point, last_point, ref_row.points[left_ref],
							row_index, -y_mod);
				}
			}
		};
		background.remove_row = function(y_mod) {
			let row, cur_point, cur_triangle, index;
			if (y_mod === 1 && this.map.moved_top) row = this.rows[this.map.top];
			else if (y_mod === -1 && this.map.moved_bot) row = this.rows[this.map.bot];
			else return;
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
			if (y_mod === 1) {
				delete this.rows[this.map.top];
				this.map.top++;
			}
			else {
				delete this.rows[this.map.bot];
				this.map.bot--;
			}
		};
		background.set_edges = function() {
			let cur = this.map.top - 1, cur_row, i, j, top_found, bot_found,
				cur_point, cur_triangle;
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
						if ((cur_triangle.base === cur && cur_triangle.dir === -1) ||
							(cur_triangle.base === cur - 1 && cur_triangle.dir === 1))
							top_found = true;
						else if ((cur_triangle.base === cur && cur_triangle.dir === 1) ||
							(cur_triangle.base === cur + 1 && cur_triangle.dir === -1))
							bot_found = true;
						else console.log("weird left");
					}
					if (!top_found) cur_row.left_above++;
					if (!bot_found) cur_row.left_below++;
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
						if ((cur_triangle.base === cur && cur_triangle.dir === -1) ||
							(cur_triangle.base === cur - 1 && cur_triangle.dir === 1))
							top_found = true;
						else if ((cur_triangle.base === cur && cur_triangle.dir === 1) ||
							(cur_triangle.base === cur + 1 && cur_triangle.dir === -1))
							bot_found = true;
						else
							console.log("weird right");
					}
					if (!top_found) cur_row.right_above--;
					if (!bot_found) cur_row.right_below--;
				}
			}
		};
		background.trim_sides = function() {
			let cur = this.map.top - 1, cur_row, cur_point, cur_triangle, top_lim = 0,
				bot_lim = 1, index;
			while (++cur <= this.map.bot) {
				if (cur >= this.map.top + 1) top_lim = -1;
				if (cur >= this.map.bot) bot_lim = 0;
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
					console.log("PANIK - with top and removed. Check trim sides");
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
			let row_num = this.map.bot + 1, cur_row, prev_point, prev_z, cur;
			let change = { z: 0 };
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
				if (cur_row.points.length <= 0) continue;
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
			let above, left_ref, right_ref, cur_col, last_point, du, dd, ur, dr, ul,
				dl, ups, dns, uppy, cur_point;
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
					if (right_ref !== above.points.length && left_ref !== -1) {
						if (cur_col === cur_row.left_above) {
							if (right_ref === above.left_below) {
								this.add_triangle(cur_point, above.points[left_ref],
									above.points[right_ref], row_num - 1, 1);
								above.left_below = left_ref;
							}
						}
						else if (cur_col === cur_row.left_above - 1) {
							if (right_ref === above.left_below) {
								this.add_triangle(cur_point, above.points[right_ref],
									cur_row.points[cur_row.left_above], row_num, -1);
								this.add_triangle(cur_point, above.points[left_ref],
									above.points[right_ref], row_num - 1, 1);
								above.left_below = left_ref;
								cur_row.left_above = cur_col;
							}
							else if (left_ref === above.left_below) {
								this.add_triangle(cur_point, cur_row.points[cur_row.left_above],
									above.points[left_ref], row_num, -1);
								cur_row.left_above = cur_col;
							}
							else {
								du = above.left_below - left_ref;
								dd = cur_row.left_above - cur_col;
								while ((du > 0 || dd > 0) && du >= 0 && dd >= 0) {
									ur = above.points[above.left_below];
									dr = cur_row.points[cur_row.left_above];
									ul = above.points[above.left_below - 1];
									dl = cur_row.points[cur_row.left_above - 1];
									ups = [x_dif(ur, dr) > 0 && du > 0,
										du > dd && du > 0, du > 0];
									dns = [x_dif(ur, dr) < 0 && dd > 0,
										du < dd && dd > 0, dd > 0];
									uppy = ((ups[0] && !dns[0]) || (ups[1] && !ups[0] && !ups[1]) ||
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
					if (right_ref !== above.points.length && left_ref !== -1) {
						if (cur_col === cur_row.right_above) {
							if (left_ref === above.right_below) {
								this.add_triangle(cur_point, above.points[left_ref],
									above.points[right_ref], row_num - 1, 1);
								above.right_below = left_ref;
							}
						}
						else if (cur_col === cur_row.right_above + 1) {
							if (left_ref === above.right_below) {
								this.add_triangle(cur_point, above.points[left_ref],
									cur_row.points[cur_row.right_above], row_num, -1);
								this.add_triangle(cur_point, above.points[left_ref],
									above.points[right_ref], row_num - 1, 1);
								above.right_below = right_ref;
								cur_row.right_above = cur_col;
							}
							else if (right_ref === above.right_below) {
								this.add_triangle(cur_point, cur_row.points[cur_row.right_above],
									above.points[right_ref], row_num, -1);
								cur_row.right_above = cur_col;
							}
							else {
								du = right_ref - above.right_below; //above.left_below - left_ref;
								dd = cur_col - cur_row.right_above; //cur_row.left_above - cur_col;
								while ((du > 0 || dd > 0) && du >= 0 && dd >= 0) {
									ur = above.points[above.right_below + 1];
									dr = cur_row.points[cur_row.right_above + 1];
									ul = above.points[above.right_below];
									dl = cur_row.points[cur_row.right_above];
									ups = [x_dif(ul, dl) < 0 && du > 0, // potential change first greater
										du > dd && du > 0, du > 0];
									dns = [x_dif(ul, dl) > 0 && dd > 0,
										du < dd && dd > 0, dd > 0];
									uppy = ((ups[0] && !dns[0]) || (ups[1] && !ups[0] && !ups[1]) ||
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
			let real_from = { x: from.x, y: from.y, z: 0 };
			real_from.z = unrotate_point(real_from, 0);
			let real_to = { x: to.x, y: to.y, z: 0 };
			real_to.z = unrotate_point(real_to, 0);
			let change = { x: real_to.x - real_from.x, y: real_to.y - real_from.y, z: 0 };
			let cur_row = this.map.top - 1, cur_col, cur_base, cur_triangle, cur_point;
			while (++cur_row <= this.map.bot) {
				cur_base = this.rows[cur_row].base;
				shifter = { x: w, y: cur_base.min, z: 0 };
				change_actual_of_seen(shifter, change);
				cur_base.min = shifter.y;
				shifter = { x: w, y: cur_base.mid, z: 0 };
				change_actual_of_seen(shifter, change);
				cur_base.mid = shifter.y;
				shifter = { x: w, y: cur_base.max, z: 0 };
				change_actual_of_seen(shifter, change);
				cur_base.max = shifter.y;
				cur_col = -1;
				while (++cur_col < this.rows[cur_row].points.length)
				{
					cur_point = this.rows[cur_row].points[cur_col];
					change_actual_of_seen(cur_point, change);
				}
			}
			let cur = -1;
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
				while (this.rows[this.map.bot].base.mid > hh)
					this.remove_row(-1);
				while (this.rows[this.map.top].base.mid > this.y_fade)
					this.add_row(this.rows[this.map.top].base.mid, -1);
				this.trim_sides();
			}
			else {
				while (this.rows[this.map.bot].base.mid < hh)
					this.add_row(this.rows[this.map.bot].base.mid, 1);
				while (this.rows[this.map.top].base.mid < this.y_lim)
					this.remove_row(1);
			}
			this.set_edges();
			this.fill_sides(frac);
			this.set_edges();
		};
		background.start = function() {
			this.add_row(h, -1);
			while (this.rows[this.map.top].base.mid > this.y_fade)
				this.add_row(this.rows[this.map.top].base.min, -1);
			while (this.rows[this.map.bot].base.mid < hh)
				this.add_row(this.rows[this.map.bot].base.max, 1);
			this.set_edges();
		};
		background.start();
	}

	function color_times_ratio(color, ratio) {
		let red, green, blue;
		red = Math.max(0, Math.min(0xFF, ((color & 0xFF0000) >> 16) * ratio));
		green = Math.max(0, Math.min(0xFF, ((color & 0xFF00) >> 8) * ratio));
		blue = Math.max(0, Math.min(0xFF, (color & 0xFF) * ratio));
		return (red << 16) | (green << 8) | blue;
	}

	function color_partial_combine(colors) {
		let red, green, blue, i = 0, cur_color, cur, total, total_per, per;
		cur_color = colors[0];
		red = (cur_color.color & 0xFF0000) >> 16;
		green = (cur_color.color & 0xFF00) >> 8;
		blue = (cur_color.color & 0xFF);
		total = d3.rgb(red, green, blue);
		total_per = cur_color.percentage;
		while (++i < colors.length) {
			cur_color = colors[i];
			red = ((cur_color.color & 0xFF0000) >> 16);
			green = ((cur_color.color & 0xFF00) >> 8);
			blue = (cur_color.color & 0xFF);
			cur = d3.rgb(red, green, blue);
			total_per += cur_color.percentage;
			per = cur_color.percentage / (total_per * i);
			if (cur_color.percentage > total_per * i) per = 1 / per;
			total = d3.interpolateHsl(total, cur)(per);
		}
		cur = d3.rgb(total);
		red = Math.floor(cur.r);
		green = Math.floor(cur.g);
		blue = Math.floor(cur.b);
		return (red << 16) | (green << 8) | blue;
	}

	function color_to_color_ratio(color1, color2, ratio) {
		if (typeof(color1) === "string") color1 = string_to_color(color1);
		if (typeof(color2) === "string") color2 = string_to_color(color2);
		let obj1 = d3.rgb((color1 & 0xFF0000) >> 16,
			(color1 & 0xFF00) >> 8, color1 & 0xFF),
			obj2 = d3.rgb((color2 & 0xFF0000) >> 16,
				(color2 & 0xFF00) >> 8, color2 & 0xFF),
			cur = (d3.interpolateHsl(obj1, obj2))(ratio);
		cur = d3.rgb(cur);
		let red = Math.floor(cur.r),
			green = Math.floor(cur.g),
			blue = Math.floor(cur.b);
		return (red << 16) | (green << 8) | blue;
	}

	let color_background_animation = function(target, sigma_frac) {
		game_data.background.partial_color_background(sigma_frac);
	};

	let color_background_stop = function() {
		game_data.background.partial_color_background(1);
		game_data.background.confirm_triangle_colors();
		return false;
	};

	function x_dif(p1, p2) {
		p1.z = unrotate_point(p1, p1.z);
		p2.z = unrotate_point(p2, p2.z);
		let dif = p1.x - p2.x;
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

	function rotate_point(point, z) {
		let x = point.x - w;
		let y = point.y - h;
		let ry = y * ca;
		let rz = y * sa;
		let rf = f / (d + rz);
		point.x = x * rf + w;
		point.y = ry * rf + h;
		return rz + z;
	}

	function unrotate_point(point, z) {
		let x = point.x - w;
		let y = point.y - h;
		point.y = y * d / (ca * f - sa * y);
		point.x = (x / (f / (d + point.y * sa))) + w;
		let rz = point.y * sa;
		point.y += h;
		return z - rz;
	}

	function get_angle(vec1, vec2) {
		let magn1 = Math.sqrt(vec1.x*vec1.x + vec1.y*vec1.y + vec1.z*vec1.z);
		let magn2 = Math.sqrt(vec2.x*vec2.x + vec2.y*vec2.y + vec2.z*vec2.z);
		let dot_product = dot(vec1, vec2) / (magn1 * magn2);
		return dot_product / (magn1 * magn2);
	}

	function get_vector(p1, p2) {
		return { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
	}

	function cross(vec1, vec2) {
		return {
		x: vec1.y * vec2.z - vec1.z * vec2.y,
		y: vec1.z * vec2.x - vec1.x * vec2.z,
			z: vec1.x * vec2.y - vec1.y * vec2.x
		};
	}

	function dot(vec1, vec2) {
		return vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
	}

	function normalize(vec) {
		let magnitude = Math.sqrt(vec.x*vec.x + vec.y*vec.y + vec.z*vec.z);
		return { x: vec.x / magnitude, y: vec.y / magnitude, z: vec.z / magnitude };
	}
