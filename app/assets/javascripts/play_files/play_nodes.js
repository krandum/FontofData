function select_node(target) {
	if (target.moving) return;
	let node_color = game_data.colors[game_data.node_factions[target.value].toString()];
	target.circle.shadowColor = node_color['glow'];
	target.circle.strokeColor = node_color['selected'];
	if (target.node) target.number.fillColor = node_color['selected'];
	else target.image.fillColor = node_color['selected'];
	target.selected = true;
	grow_node(target);
	tweak_connections(target);
}

function unselect_node(target) {
	if (target.moving) return;
	let node_color = game_data.colors[game_data.node_factions[target.value].toString()];
	target.circle.shadowColor = new scope.Color(node_color['line']) * 0.4;
	target.circle.strokeColor = node_color['line'];
	if (target.node) target.number.fillColor = node_color['num'];
	else target.image.fillColor = node_color['num'];
	target.selected = false;
	let empty_window = { value: "", faction_id: 1, owner: "", tier: "",
		connection_num: "", function: "", worth: "", contention: "" };
	game_data.user_interface.set_info_window(empty_window);
	ungrow_node(target);
	untweak_connections(target);
}

function grow_node(target) {
	target.group.bringToFront();
	if (target.node) {
		if (!game_data.card_set) game_data.card_set = true;
		game_data.user_interface.set_card(target);
	}
	if (target.moving) return;
	if (!target.grown && (target.selected || target.hovered)) {
		if (typeof(target._rad) === 'undefined' || target._rad === null) {
			target._rad = target.rad;
			target.rad *= 1.2;
		}
		if (has_animation(target)) remove_animations(target);
		add_animation(target, grow_animation, grow_stop, 100);
		target.grown = true;
	}
}

function ungrow_node(target) {
	if (target.moving) return;
	if (target.grown && !target.selected && !target.hovered) {
		if (has_animation(target)) remove_animations(target);
		add_animation(target, ungrow_animation, ungrow_stop, 100);
		target.grown = false;
		if (typeof(target._rad) !== 'undefined' && target._rad !== null) {
			target.rad = target._rad;
			target._rad = null;
		}
	}
	if (target.node) {
		if (game_data.card_set && game_data.selected_nodes.length > 0)
			game_data.user_interface.set_card(game_data.selected_nodes[0]);
		else {
			if (game_data.card_set) {
				game_data.card_set = false;
			// TODO make card blank again
				let empty_card = { value: "", faction_id: 0, owner: "", tier: "",
					connection_num: "", function: "", worth: "", contention: "" };
				game_data.user_interface.set_card(empty_card);
			}
		}
	}
}

let grow_animation = function(target, sigma_frac) {
	let width = scope.view.size.width;
	let height = scope.view.size.height;
	if (target.base === null) {
		target.base = new scope.Rectangle();
		target.base.width = target.relative_pos.size_dx * height;
		target.base.height = target.relative_pos.size_dy * height;
		target.base.x = target.relative_pos.x * width;
		target.base.y = target.relative_pos.y * height;
	}
	if (target.circle.bounds.width < (1 + 0.2 * sigma_frac) * target.base.width) {
		target.circle.bounds.width = (1 + 0.2 * sigma_frac) * target.base.width;
		target.circle.bounds.height = (1 + 0.2 * sigma_frac) * target.base.height;
	}
	target.circle.position.x = target.base.x;
	target.circle.position.y = target.base.y;
	apply_fraction(target);
};

let grow_stop = function(target) {
	let width = scope.view.size.width;
	let height = scope.view.size.height;
	if (target.base === null) {
		target.base = new scope.Rectangle();
		target.base.width = target.relative_pos.size_dx * height;
		target.base.height = target.relative_pos.size_dy * height;
		target.base.x = target.relative_pos.x * width;
		target.base.y = target.relative_pos.y * height;
	}
	if (target.circle.bounds.width < 1.2 * target.base.width) {
		target.circle.bounds.width = 1.2 * target.base.width;
		target.circle.bounds.height = 1.2 * target.base.height;
	}
	target.circle.position.x = target.base.x;
	target.circle.position.y = target.base.y;
	apply_fraction(target);
	if (game_data.user_interface.tutorial_ui_status === true) {
		game_data.user_interface.paper_tooltip(target);
	}
	return false;
};

let ungrow_animation = function(target, sigma_frac) {
	let width = scope.view.size.width;
	let height = scope.view.size.height;
	if (target.base === null) {
		target.base = new scope.Rectangle();
		target.base.width = target.relative_pos.size_dx * height;
		target.base.height = target.relative_pos.size_dy * height;
		target.base.x = target.relative_pos.x * width;
		target.base.y = target.relative_pos.y * height;
	}
	if (target.circle.bounds.width > (1.2 - 0.2 * sigma_frac) * target.base.width) {
		target.circle.bounds.width = (1.2 - 0.2 * sigma_frac) * target.base.width;
		target.circle.bounds.height = (1.2 - 0.2 * sigma_frac) * target.base.height;
	}
	target.circle.position.x = target.base.x;
	target.circle.position.y = target.base.y;
	apply_fraction(target);
};

let ungrow_stop = function(target) {
	let width = scope.view.size.width;
	let height = scope.view.size.height;
	if (target.base === null) {
		target.base = new scope.Rectangle();
		target.base.width = target.relative_pos.size_dx * height;
		target.base.height = target.relative_pos.size_dy * height;
		target.base.x = target.relative_pos.x * width;
		target.base.y = target.relative_pos.y * height;
	}
	if (target.circle.bounds.width > target.base.width) {
		target.circle.bounds.width = target.base.width;
		target.circle.bounds.height = target.base.height;
	}
	target.circle.position.x = target.base.x;
	target.circle.position.y = target.base.y;
	if (typeof(target.node) !== 'undefined' && target.node !== null)
		target.base = null;
	apply_fraction(target);
	return false;
};

let pop_action_animation = function(target, sigma_frac) {
	let option, cur_option;
	for (cur_option in target) {
		if (target.hasOwnProperty(cur_option)) {
			option = target[cur_option];
			if (option.circle.bounds.width < sigma_frac * option.base.width) {
				option.circle.bounds.width = sigma_frac * option.base.width;
				option.circle.bounds.height = sigma_frac * option.base.height;
			}
			option.circle.position.x = option.base.x;
			option.circle.position.y = option.base.y;
			apply_fraction(option);
		}
	}
};

let pop_action_stop = function(target) {
	let option, cur_option;
	for (cur_option in target) {
		if (target.hasOwnProperty(cur_option)) {
			option = target[cur_option];
			if (option.circle.bounds.width < option.base.width) {
				option.circle.bounds.width = option.base.width;
				option.circle.bounds.height = option.base.height;
			}
			option.circle.position.x = option.base.x;
			option.circle.position.y = option.base.y;
			apply_fraction(option);
		}
	}
	return false;
};

let unpop_action_animation = function(target, sigma_frac) {
	let option, cur_option;
	for (cur_option in target) {
		if (target.hasOwnProperty(cur_option)) {
			option = target[cur_option];
			if (option.circle.bounds.width > (1 - sigma_frac) * option.base.width) {
				option.circle.bounds.width = (1 - sigma_frac) * option.base.width;
				option.circle.bounds.height = (1 - sigma_frac) * option.base.height;
			}
			option.circle.position.x = option.base.x;
			option.circle.position.y = option.base.y;
			apply_fraction(option);
		}
	}
};

let unpop_action_stop = function(target) {
	let option, index, cur_option;
	for (cur_option in target) {
		if (target.hasOwnProperty(cur_option)) {
			option = target[cur_option];
			if (option.circle.bounds.width > 0) {
				option.circle.bounds.width = 0;
				option.circle.bounds.height = 0;
			}
			option.circle.position.x = option.base.x;
			option.circle.position.y = option.base.y;
			option.group.removeChildren();
			option.group.remove();
			index = game_data.actions.indexOf(option);
			if (index !== -1) game_data.actions.splice(index, 1);
			apply_fraction(option);
		}
	}
	return false;
};

function get_initial_node_data() {
	$.ajax({
		type: "GET",
		url: "request_nodes",
		data: { ranges: [{ from: 1, to: 63 }] },
		datatype: "html",
		success: function (raw) {
			let data = JSON.parse(raw), in_nodes = data['nodes'], i = 0;
			console.log(data);
			while (++i < 64) {
				game_data.node_factions[i] = in_nodes[i]['faction_id'];
				game_data.node_connections[i] = {
					dad: in_nodes[i]['dad'],
					bro: in_nodes[i]['bro']
				};
			}
			console.log(game_data.node_connections);
			game_data.active_nodes = build_nodes(6, scope.view.size.width,
				scope.view.size.height);
			i = -1;
			while (++i < 63) {
				show_connections(game_data.active_nodes[i]);
				game_data.active_nodes[i].faction_id = in_nodes[i+1]['faction_id'];
				game_data.active_nodes[i].owner = in_nodes[i+1]['owner'];
				game_data.active_nodes[i].tier = in_nodes[i+1]['tier'];
				game_data.active_nodes[i].connection_num = in_nodes[i+1]['connection_num'];
				game_data.active_nodes[i].worth = in_nodes[i+1]['worth'];
				game_data.active_nodes[i].contention = in_nodes[i+1]['contention'];
				//TODO finish query data
				//game_data.active_nodes[i].cluster = in_nodes[i+1][cluster];
				//game_data.active_nodes[i].last_captured = in_nodes[i+1][last_captured];
				//game_data.active_nodes[i].assignment = in_nodes[i+1][assignment];
				//game_data.active_nodes[i].speed = in_nodes[i+1][speed];
				//game_data.active_nodes[i].friction = in_nodes[i+1][friction];
				game_data.active_nodes[i].cluster = 'Cluster_name';
				game_data.active_nodes[i].tier = 1;
				game_data.active_nodes[i].last_captured = '2017-12-04 06:06:44 UTC';
				if (game_data.active_nodes[i].faction_id === 1) {
					game_data.active_nodes[i].assignment = -1;
				}
				else {
					game_data.active_nodes[i].assignment = 3;
				}
				game_data.active_nodes[i].speed = 32;
				game_data.active_nodes[i].friction = 46;
				//end dummy data
				if (game_data.active_nodes[i].owner === null)
					game_data.active_nodes[i].owner = 'null';
			}
			game_data.global_root = game_data.active_nodes[0];
			game_data.old_root = game_data.global_root;
			game_data.background.set_triangle_targets();
			add_animation(null, color_background_animation, color_background_stop, 750)
		},
		async: true
	});
}

function get_more_node_data(ranges) {
	$.ajax({
		type: "GET",
		url: "request_nodes",
		data: { ranges: ranges },
		datatype: "html",
		success: function (raw) {
			let data = JSON.parse(raw), in_nodes = data['nodes'], i = 0, k = 0;
			while (i < ranges.length) {
				let j = ranges[i].from;
				while (j <= ranges[i].to) {
					game_data.node_factions[j] = in_nodes[j]['faction_id'];
					game_data.node_connections[j] = {
						dad: in_nodes[j]['dad'],
						bro: in_nodes[j]['bro']
					};
					k = -1;
					while (++k < game_data.active_nodes.length)
						if (game_data.active_nodes[k].move_value === j) break;
					if (k !== game_data.active_nodes.length) {
						game_data.active_nodes[k].faction_id = in_nodes[j]['faction_id'];
						game_data.active_nodes[k].owner = in_nodes[j]['owner'];
						game_data.active_nodes[k].tier = in_nodes[j]['tier'];
						game_data.active_nodes[k].connection_num = in_nodes[j]['connection_num'];
						game_data.active_nodes[k].worth = in_nodes[j]['worth'];
						game_data.active_nodes[k].contention = in_nodes[j]['contention'];
						//TODO finish query data
						//game_data.active_nodes[k].cluster = in_nodes[j][cluster];
						//game_data.active_nodes[k].last_captured = in_nodes[j][last_captured];
						//game_data.active_nodes[k].assignment = in_nodes[j][assignment];
						//game_data.active_nodes[k].speed = in_nodes[j][speed];
						//game_data.active_nodes[k].friction = in_nodes[j][friction];
						//dummy data:
						game_data.active_nodes[k].cluster = 'Cluster_name';
						game_data.active_nodes[k].tier = 1;
						game_data.active_nodes[k].last_captured = '2017-12-04 06:06:44 UTC';
						if (game_data.active_nodes[k].faction_id === 1) {
							game_data.active_nodes[k].assignment = -1;
						}
						else {
							game_data.active_nodes[k].assignment = 0;
						}
						game_data.active_nodes[k].speed = 32;
						game_data.active_nodes[k].friction = 46;
						//end dummy data
						if (game_data.active_nodes[k].owner === null)
							game_data.active_nodes[k].owner = 'unclaimed';
					}
					j++;
				}
				i++;
			}
			i = -1;
			while (++i < game_data.active_nodes.length) {
				let cur_node = game_data.active_nodes[i];
				hide_connections(cur_node);
			}
			add_animation(null, move_nodes, confirm_moved_nodes, 600);
		}
	});
}

function set_fraction(target) {
	let small, big = target.circle;
	if (target.node) small = target.number;
	else small = target.image;
	if (typeof(target.fraction) === 'undefined' || target.fraction === null) {
		let size_ratio = new scope.Rectangle();
		size_ratio.x = (big.position.x - small.bounds.point.x) / big.bounds.width;
		size_ratio.y = (big.position.y - small.bounds.point.y) / big.bounds.height;
		size_ratio.width = small.bounds.width / big.bounds.width;
		size_ratio.height = small.bounds.height / big.bounds.height;
		target.fraction = size_ratio;
	}
	else {
		target.fraction.x = (big.position.x - small.bounds.point.x) / big.bounds.width;
		target.fraction.y = (big.position.y - small.bounds.point.y) / big.bounds.height;
		target.fraction.width = small.bounds.width / big.bounds.width;
		target.fraction.height = small.bounds.height / big.bounds.height;
	}
}

function apply_fraction(target) {
	let small, big = target.circle;
	if (target.node) small = target.number;
	else small = target.image;
	small.bounds.width = target.fraction.width * big.bounds.width;
	small.bounds.height = target.fraction.height * big.bounds.height;
	small.bounds.point.x = big.position.x - target.fraction.x * big.bounds.width;
	small.bounds.point.y = big.position.y - target.fraction.y * big.bounds.height;
}

function get_node(elem, center, size, thickness, parent, brother) {
	let num_digits = elem.toString().length,
		node_color = game_data.colors[game_data.node_factions[elem].toString()],
		half_size = size / 2, sine_size = size / 2.3, tan_size = size / 3.7,
		quarter_size = size / 4, basis = new scope.Path(), x_sign = elem % 2 === 0 ? -1 : 1,
		p1 = new scope.Point(center.x, center.y + half_size),
		p2 = new scope.Point(center.x + x_sign * half_size, center.y),
		p3 = new scope.Point(center.x, center.y - half_size),
		p4 = new scope.Point(center.x - x_sign * half_size, center.y),
		p5 = new scope.Point(center.x - x_sign * sine_size, center.y + quarter_size),
		p6 = new scope.Point(center.x - x_sign * quarter_size, center.y + sine_size),
		p7 = new scope.Point(center.x - x_sign * sine_size, center.y + sine_size),
		proper1 = new scope.Segment(p1, new scope.Point(-x_sign * size / 10, 0),
			new scope.Point(x_sign * tan_size, 0)),
		proper2 = new scope.Segment(p2, new scope.Point(0, tan_size),
			new scope.Point(0, -tan_size)),
		proper3 = new scope.Segment(p3, new scope.Point(x_sign * tan_size, 0),
			new scope.Point(-x_sign * tan_size, 0)),
		proper4 = new scope.Segment(p4, new scope.Point(0, -tan_size),
			new scope.Point(0, size / 10)),
		partial1 = new scope.Segment(p5, new scope.Point(-x_sign * size / 20,
			-size / 12.5), new scope.Point(x_sign * size/25, size / 16.7)),
		partial2 = new scope.Segment(p6, new scope.Point(-x_sign * size / 16.7,
			-size / 25), new scope.Point(x_sign * size / 12.5, size / 20));
	basis.addSegments([proper1, proper2, proper3, proper4, partial1, p7, partial2]);
	basis.closed = true;
	basis.strokeWidth = thickness;
	basis.strokeColor = node_color['line'];
	basis.fillColor = node_color['fill'];
	basis.shadowColor = new scope.Color(node_color['line']) * 0.4;
	basis._shadow = basis.shadowColor;
	basis.shadowBlur = thickness * 5;
	let num_w = sine_size * (2 - 1 / num_digits), num_h = (num_w / num_digits) * 1.4;
	let num = new scope.PointText(center);
	num.fillColor = node_color['num'];
	num.content = elem.toString();
	num.bounds = new scope.Rectangle({
		point: [center.x - num_w / 2, center.y - num_h / 2],
		size: [num_w, num_h]
	});
	let out_node = new scope.Group(basis, num), relative_pos = {
			x: basis.position.x / scope.view.size.width,
			y: basis.position.y / scope.view.size.height,
			size_dx: basis.bounds.width / scope.view.size.height,
			size_dy: basis.bounds.height / scope.view.size.height
	};
	let total_node = {
		value: elem, position: elem, group: out_node, circle: basis, number: num,
		rad: half_size, relative_pos: relative_pos, popped: false, popper: false,
		connection_data: { dad: parent, bro: brother }, connection_num: null,
		connections: null, faction_id: null, owner: null, tier: null, worth: null,
		contention: null, selected: false, hovered: false, grown: false, moving: false,
		base: null, options: null, node: true, move_target: null, move_thickness: thickness,
		left_pointed: elem % 2 !== 0, parent: {}, brother: {}, sister: {}, son: {}, daughter: {},
		tooltip: 'Select Nodes for details and interactions.'
	};
	out_node.onMouseEnter = function(e) {
		if (total_node.moving) return;
		total_node.hovered = true;
		set_fraction(total_node);
		if (game_data.user_interface.tutorial_ui_status === true && total_node.grown === true) {
			let rad = total_node.circle.bounds.width / 2;
			if (Math.sqrt(Math.pow(Math.abs(e.point.x - total_node.circle.position.x), 2) + Math.pow(Math.abs(e.point.y - total_node.circle.position.y), 2)) <= rad) {
				game_data.user_interface.paper_tooltip(total_node);
			}
		}
		grow_node(total_node);
	};
	out_node.onMouseLeave = function(e) {
		if (total_node.moving) return;
		total_node.hovered = false;
		set_fraction(total_node);
		ungrow_node(total_node);
		if (game_data.user_interface.tutorial_ui_status === true) {
			let rad = total_node.circle.bounds.width / 2;
			if (Math.sqrt(Math.pow(Math.abs(e.point.x - total_node.circle.position.x), 2) + Math.pow(Math.abs(e.point.y - total_node.circle.position.y), 2)) > rad) {
				d3.selectAll(".tutorial_ui").remove();
			}
		}
	};
	out_node.onClick = function() {
		if (total_node.moving) return;
		check_selection(total_node);
	};
	return total_node;
}

function connect_nodes(nodes) {
	let i = 0, cur_node;
	while (i < nodes.length) {
		cur_node = nodes[i++];
		if (i > 1) {
			cur_node.parent.node = nodes[Math.floor(i / 2) - 1];
			if ((i & (i - 1)) !== 0) cur_node.brother.node = nodes[i - 2];
			else cur_node.brother.node = null;
		}
		else {
			cur_node.parent.node = null;
			cur_node.brother.node = null;
		}
		if ((i & (i + 1)) !== 0) cur_node.sister.node = nodes[i];
		else cur_node.sister.node = null;
		if (i < 32) {
			cur_node.son.node = nodes[i * 2 - 1];
			cur_node.daughter.node = nodes[i * 2];
		}
		else {
			cur_node.son.node = null;
			cur_node.daughter.node = null;
		}
	}
}

function build_nodes(num_layers, width, height) {
	let nodes = [], total_height = height * 25 / 33 - 54,
		bottom_y = height * 27 / 33 - 32, layer_height = total_height * 243 / 665,
		node_height = layer_height * 3 / 4, y = bottom_y - (layer_height / 2),
		point = new scope.Point(0, 0), index = 1, i = 0, thickness = 5;
	while (i < num_layers) {
		let num_sub = Math.pow(2, i), j = 0;
		let row = { y: y, len: num_sub, nodes: [] };
		point.y = y;
		point.x = (width / num_sub) / 2;
		while (j < num_sub) {
			let new_node = get_node(index, point, node_height, thickness,
				game_data.node_connections[index]['dad'],
				game_data.node_connections[index]['bro']);
			game_data.positions[new_node.position] = new_node.relative_pos;
			if (i === num_layers - 1) {
				let dot_w = new_node.circle.bounds.width * 0.7246377;
				let dot_h = dot_w * 0.483333;
				new_node.number.content = "...";
				new_node.number.bounds.width = dot_w;
				new_node.number.bounds.height = dot_h;
				new_node.number.bounds.x = new_node.circle.position.x - dot_w / 2;
				new_node.number.bounds.y = new_node.circle.position.y - dot_h / 2;
				new_node.circle.strokeWidth += 1;
			}
			nodes.push(new_node);
			row.nodes.push({ x: point.x, node: new_node });
			point.x += width / num_sub;
			j++;
			index++;
		}
		game_data.framework.push(row);
		node_height /= 1.5;
		y -= layer_height / 2;
		layer_height = node_height * 4 / 3;
		y -= layer_height / 2;
		i++;
		if (thickness > 1) thickness--;
	}
	connect_nodes(nodes);
	return nodes;
}

function update_framework() {
	let i = -1, j = 0, k, frame = game_data.framework, cur_row;
	while (++i < frame.length) {
		cur_row = frame[i].nodes;
		k = -1;
		while (++k < cur_row.length) {
			cur_row[k].node = game_data.active_nodes[j];
			j++;
		}
	}
}
