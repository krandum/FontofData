//= require play
function create_button_space() {
	game_data.d3 = {};
	let bounding = document.getElementById("local").getBoundingClientRect(),
		width = bounding.width, height = bounding.height;
	game_data.d3.space = d3.select("#local").append("div")
		.attr("width", width).attr("height", height).attr("class", "globalWrap");
}

function make_button(icon_path, position, tooltip, onclick) {
	let button = game_data.d3.space.append("myButton").attr("class", "myButton")
		.style("left", function() { return position.x.toString() + "px"; })
		.style("top", function() { return position.y.toString() + "px"; })
		.style("width", function() { return position.width.toString() + "px"; })
		.style("height", function() { return position.height.toString() + "px"; })
		.style("background-image", 'url("' + icon_path + '")')
		.style("border-width", position.thick.toFixed(0) + "px");
	button.on("mouseenter", function() {
		if (game_data.user_interface.tutorial_ui_status === true) {
			game_data.d3.space.append("div").classed("tutorial_ui primary " +
				game_data.user_interface.faction_names[game_data.user_info.faction_id], true)
				.style("top", position.y - 30 - (position.height * .55) + "px")
				.style("left", position.x + (position.width / 2) - 85 + "px")
				.style("width", 170 + "px")
				.style("height", 30 + "px")
				.append("span").text(tooltip);
		}
	});
	button.on("mouseleave", function() {d3.selectAll(".tutorial_ui").remove(); });
	button.on("click", function() {d3.selectAll(".tutorial_ui").remove(); onclick();});
	return button;
}

function remove_options(target) {
	add_animation(target.options, unpop_action_animation, unpop_action_stop, 150);
	target.options = null;
}

function make_option_group(center, option_rad, node_rad, theta, colors,
	thickness, icon_name, value) {
	let x = (1.8 * option_rad + node_rad) * Math.cos(theta),
		y = (1.8 * option_rad + node_rad) * -Math.sin(theta),
		point = new scope.Point(center.x + x, center.y + y),
		circle = new scope.Path.Circle(point, option_rad);
	circle.strokeWidth = thickness;
	circle.strokeColor = colors['line'];
	circle.fillColor = colors['fill'];
	let img = new scope.CompoundPath(game_data.icon_data[icon_name]);
	img.visible = true;
	img.fillColor = colors['num'];
	let scale = Math.cos(Math.PI / 4) * 2;
	img.bounds.height = option_rad * scale;
	img.bounds.width = option_rad * scale;
	img.position.x = point.x;
	img.position.y = point.y;
	let option = new scope.Group(circle, img), base = new scope.Rectangle();
	base.x = circle.position.x;
	base.y = circle.position.y;
	base.width = circle.bounds.width;
	base.height = circle.bounds.height;
	let width = scope.view.size.width, height = scope.view.size.height,
		relative_pos = {
		x: base.x / width,
		y: base.y / height,
		size_dx: base.width / height,
		size_dy: base.height / height
	};
	let out = {
		group: option,
		circle: circle,
		image: img,
		relative_pos: relative_pos,
		base: base,
		selected: false,
		hovered: false,
		grown: false,
		value: value
	};
	set_fraction(out);
	option.bounds.width = 0.00001;
	option.bounds.height = 0.00001;
	return out;
}

function add_options(target) {
	let colors = game_data.colors[game_data.node_factions[target.value].toString()];
	let x_sign = target.value % 2 === 0 ? -1 : 1;
	let ref_stroke_width = target.circle.strokeWidth;
	let small_rad = target.circle.bounds.width / 8; // rad / 4
	let big_rad = target.circle.bounds.width / 2;
	let theta_base = Math.PI * (target.value % 2 === 0 ? 1 : 0);
	let options = {};
	let theta, name;
	if (target !== game_data.global_root) name = 'move';
	else name = 'back';
	theta = theta_base + x_sign * 7 * Math.PI / 6;
	if (target !== game_data.global_root || game_data.global_root.value !== 1) {
		options.move = make_option_group(target.circle.position, small_rad, big_rad,
			theta, colors, ref_stroke_width / 2, name, target.value);
		options.move.tooltip = 'Move your view to the selected Node.';
		options.move.image.strokeWidth = 1;
		options.move.image.strokeColor = colors['num'];
		game_data.actions.push(options.move);
		options.move.group.onMouseEnter = function(e) {
			options.move.hovered = true;
			set_fraction(options.move);
			grow_node(options.move);
		};
		options.move.group.onMouseLeave = function(e) {
			options.move.hovered = false;
			set_fraction(options.move);
			ungrow_node(options.move);
			if (game_data.user_interface.tutorial_ui_status === true) {
				let rad = options.move.circle.bounds.width / 2;
				if (Math.sqrt(Math.pow(Math.abs(e.point.x - options.move.circle.position.x), 2) + Math.pow(Math.abs(e.point.y - options.move.circle.position.y), 2)) > rad) {
					d3.selectAll(".tutorial_ui").remove();
				}
			}
		};
		options.move.group.onClick = function() {
			game_data.action_index = -1;
			remove_options(target);
			d3.selectAll(".tutorial_ui").remove();
			unselect_node(target);
			let index = game_data.selected_nodes.indexOf(target);
			game_data.selected_nodes.splice(index, 1);
			if (target === game_data.global_root) move_back(1);
			else move_to(target);
		};
	}
	if (target.owner === "unclaimed") {
		options.claim = make_option_group(target.circle.position, small_rad, big_rad,
			Math.PI / 2.0, colors, ref_stroke_width / 2.0, 'attack', target.value);
		options.claim.image.strokeWidth = 1;
		options.claim.image.strokeColor = colors['num'];
		game_data.actions.push(options.claim);
		options.claim.group.onMouseEnter = function() {
			options.claim.hovered = true;
			set_fraction(options.claim);
			grow_node(options.claim);
		};
		options.claim.group.onMouseLeave = function() {
			options.claim.hovered = false;
			set_fraction(options.claim);
			ungrow_node(options.claim);
		};
		options.claim.group.onClick = function() {
			game_data.action_index = -1;
			remove_options(target);
			unselect_node(target);
			let index = game_data.selected_nodes.indexOf(target);
			game_data.selected_nodes.splice(index, 1);
			App.game.perform('node_claim', { target: target.value });
		};
	}
	target.options = options;
	add_animation(options, pop_action_animation, pop_action_stop, 150);
}

function take_action(data) {
	// App.game.perform('update_node', {
	// 	action_index: game_data.action_index,
	// 	origin: origin.value,
	// 	target: target.value
	// });

	let origin, target, colors, i;
	for (i = 0;i < game_data.active_nodes.length; i++) {
		if (game_data.active_nodes[i].value === data['origin']) {
			origin = game_data.active_nodes[i];
		}
		if (game_data.active_nodes[i].value === data['target']) {
			target = game_data.active_nodes[i];
		}
	}
	if (data['action_index'] === 1) {
		if (data['origin_change'] === 'to_target') {
			game_data.node_factions[origin.value] = data['target_fac'];
			colors = game_data.colors[data['target_fac'].toString()];
			origin.circle.strokeColor = colors.line;
			origin.circle.fillColor = colors.fill;
			origin.number.fillColor = colors.num;
		}
		if (data['target_change'] === 'to_origin') {
			game_data.node_factions[target.value] = data['origin_fac'];
			colors = game_data.colors[data['origin_fac'].toString()];
			target.circle.strokeColor = colors.line;
			target.circle.fillColor = colors.fill;
			target.number.fillColor = colors.num;
		}
		game_data.background.set_triangle_targets();
		add_animation(null, color_background_animation, color_background_stop, 400);
	}
	if (origin.value === (target.value >> 1)) { // origin is dad
		game_data.node_connections[target.value].dad = origin.value;
		hide_connections(target);
		show_connections(target);
	}
	else if (origin.value === (target.value - 1)) { // origin is bro
		game_data.node_connections[target.value].bro = origin.value;
		hide_connections(target);
		show_connections(target);
	}
	else if (target.value === (origin.value >> 1)) { // target is dad
		game_data.node_connections[origin.value].dad = target.value;
		hide_connections(origin);
		show_connections(origin);
	}
	else if (target.value === (origin.value - 1)) { // target is bro
		game_data.node_connections[origin.value].bro = target.value;
		hide_connections(origin);
		show_connections(origin);
	}
	else {
		console.log("could not find relationsip between: (1/3)");
		console.log(origin, target);
	}
}

function check_selection(target) {
	if (target.moving) return;
	if (!target.selected) {
		if (game_data.selected_nodes.length >= 1 && game_data.action_index !== -1) {
			select_node(target);
			game_data.selected_nodes.push(target);
			// take_action(game_data.selected_nodes[0], target);
			App.game.perform('update_node', {
				action_index: game_data.action_index,
				origin: game_data.selected_nodes[0].value,
				target: target.value
			});
			remove_options(game_data.selected_nodes[0]);
			setTimeout(function() {
				game_data.selected_nodes.forEach(function(e) { unselect_node(e); });
				game_data.selected_nodes.splice(0, game_data.selected_nodes.length);
				game_data.user_interface.set_info_window(target);
				game_data.action_index = -1;
			}, 300);
		}
		else if (game_data.selected_nodes.length >= 1) {
			remove_options(game_data.selected_nodes[0]);
			unselect_node(game_data.selected_nodes[0]);
			select_node(target);
			game_data.user_interface.set_info_window(target);
			game_data.selected_nodes[0] = target;
			add_options(game_data.selected_nodes[0]);
		}
		else {
			select_node(target);
			game_data.user_interface.set_info_window(target);
			game_data.selected_nodes.push(target);
			add_options(target);
		}
	}
	else {
		unselect_node(target);
		let index = game_data.selected_nodes.indexOf(target);
		if (typeof(index) !== 'undefined' && index !== null)
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
		if (game_data.action_index !== -1)
			unselect_node(game_data.actions[game_data.action_index]);
		select_node(target);
		game_data.action_index = game_data.actions.indexOf(target);
	}
}

function has_animation(target) {
	let len = game_data.animations.length, i = -1;
	while (++i < len) if (target === game_data.animations[i].target) return true;
	return false;
}

function remove_animations(target) {
	let len = game_data.animations.length, i = -1;
	while (++i < len)
		if (target === game_data.animations[i].target) {
			game_data.animations.splice(i, 1);
			len--;
		}
}

function add_animation(target, fractional_render, last_render, length_ms) {
	game_data.date = new Date();
	let now = game_data.date.getTime();
	let animation = { target: target, fractional_render: fractional_render,
		last_render: last_render, length: length_ms, start: now, last: now };
	game_data.animations.push(animation);
}

function tick() {
	let len = game_data.animations.length;
	if (len <= 0) return;
	w = scope.view.size.width / 2;
	h = scope.view.size.height / 2;
	m = Math.min(w, h);
	game_data.date = new Date();
	let tick_time = game_data.date.getTime();
	let i = 0;
	while (i < len) {
		let anim = game_data.animations[i];
		let total_timespan = tick_time - anim.start;
		let current_timespan = tick_time - anim.last;
		let sigma_frac = total_timespan / anim.length; // Total time spent
		let delta_frac = current_timespan / anim.length; // Time since last tick
		let survive = true;
		if (total_timespan >= anim.length) {
			survive = anim.last_render(anim.target);
			if (!survive) {
				let index = game_data.animations.indexOf(anim);
				game_data.animations.splice(index, 1);
				len--;
				continue;
			}
			else anim.start += anim.length;
		}
		else anim.fractional_render(anim.target, sigma_frac, delta_frac);
		anim.last = tick_time;
		i++;
	}
}

function set_assets() {
	let icon_up = new scope.Raster('assets/icons/001-arrow-up.png'),
		icon_up_right = new scope.Raster('assets/icons/002-arrow-up-right.png'),
		icon_right = new scope.Raster('assets/icons/003-arrow-right.png'),
		icon_down_right = new scope.Raster('assets/icons/004-arrow-down-right.png'),
		icon_down = new scope.Raster('assets/icons/005-arrow-down.png'),
		icon_down_left = new scope.Raster('assets/icons/006-arrow-down-left.png'),
		icon_left = new scope.Raster('assets/icons/007-arrow-left.png'),
		icon_up_left = new scope.Raster('assets/icons/008-arrow-up-left.png'),
		icon_attack = new scope.Raster('assets/icons/009-crosshair.png');
	icon_up.visible = false;
	icon_up_right.visible = false;
	icon_right.visible = false;
	icon_down_right.visible = false;
	icon_down.visible = false;
	icon_down_left.visible = false;
	icon_left.visible = false;
	icon_up_left.visible = false;
	icon_attack.visible = false;
	load_SVG('assets/icons/048-back.svg', 'back',
		[{ name:'move', x_scale: 1, y_scale: -1 }]);
	load_SVG('assets/icons/047-next.svg', 'right',
		[{ name:'left', x_scale: -1, y_scale: 1 }]);
	load_SVG('assets/icons/041-focus.svg', 'attack');
	load_SVG('assets/icons/043-connect.svg', 'connect');
	load_SVG('assets/icons/049-information.svg', 'node_info');
	load_SVG('assets/icons/046-return.svg', 'return');
}
