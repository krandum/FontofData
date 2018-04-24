function tweak_connections(target) {
	let neighbors = ["parent", "brother", "sister", "son", "daughter"], i = -1,
		inv_neighbors = ["check", "sister", "brother", "parent", "parent"],
		cur_inv, cur_data;
	let width = scope.view.size.width, height = scope.view.size.height, a, b,
		cur_proven;
	while (++i < 5) {
		let cur_other = target[neighbors[i]].node, button,
			position = { x: 0, y: 0, width: 0, height: 0, thick: 0 };
		if (typeof(cur_other) === 'undefined' || cur_other === null) continue;
		switch (neighbors[i]) {
			case "parent":
				cur_data = target.connection_data.dad;
				break;
			case "brother":
				cur_data = target.connection_data.bro;
				break;
			case "sister":
				cur_data = cur_other.connection_data.bro;
				break;
			case "son":
			case "daughter":
				cur_data = cur_other.connection_data.dad;
		}
		a = target.value;
		b = cur_other.value;
		cur_proven = false;
		if (typeof(game_data.proved[a]) !== 'undefined' &&
			game_data.proved[a] !== null && game_data.proved[a].length > 0) {
			let j = -1;
			while (++j < game_data.proved[a].length)
				if (game_data.proved[a][j] === b) cur_proven = true;
		}
		position.width = (target.rad + cur_other.rad) / 3;
		position.height = (target.rad + cur_other.rad) / 3;
		position.thick = (target.circle.strokeWidth + cur_other.circle.strokeWidth) / 3;
		let angle = Math.atan2(cur_other.relative_pos.y - target.relative_pos.y,
			cur_other.relative_pos.x - target.relative_pos.x), buttons = [];
		let x_offset1 = target.rad * Math.cos(angle),
			y_offset1 = target.rad * Math.sin(angle),
			x_offset2 = cur_other.rad * Math.cos(angle),
			y_offset2 = cur_other.rad * Math.sin(angle);
		if (cur_proven && typeof(target[neighbors[i]].line) !== 'undefined' &&
			target[neighbors[i]].line !== null) {
			if (game_data.node_factions[target.value] !== userinfo.faction_id)
				continue;
			if (cur_data === null || cur_data.completions[0] !== "100.0") {
				position.width *= 0.6;
				position.height *= 0.6;
				position.thick *= 0.6;
				if (Math.abs(angle - Math.PI) < 1.0 || Math.abs(angle) < 1.0) {
					position.x = (target.relative_pos.x + cur_other.relative_pos.x) * width
						/ 2 - position.width / 2;
					position.y = (target.relative_pos.y + cur_other.relative_pos.y) * height
						/ 2 - position.height / 2;
				}
				else {
					position.x = (target.relative_pos.x * width + x_offset1 +
						cur_other.relative_pos.x * width - x_offset2) / 2 - position.width / 2;
					position.y = (target.relative_pos.y * height + y_offset1 +
						cur_other.relative_pos.y * height - y_offset2) / 2 - position.height / 2;
				}
				if (angle === Math.PI || angle === 0) position.y -= position.height * 1.2;
				else {
					let y_offset = position.y - target.relative_pos.y * height,
						x_offset = position.x - target.relative_pos.x * width,
						y_mod = position.height * 1.2, x_mod = position.width * 1.2;
					if (!(x_offset > 0) ^ !(y_offset > 0)) {
						x_mod *= Math.cos(angle - Math.PI / 2);
						y_mod *= Math.sin(angle - Math.PI / 2);
					}
					else {
						x_mod *= Math.cos(angle + Math.PI / 2);
						y_mod *= Math.sin(angle + Math.PI / 2);
					}
					position.x += x_mod;
					position.y += y_mod;
				}
				button = make_button('assets/neutral/icons/add.svg', position,
					"Use your data to expand your influence.", function() {
					check_selection(target);
					d3.selectAll(".myForm").remove();
					let form = game_data.d3.space.append("form").attr("class", "myForm primary " +
						game_data.user_interface.faction_names[game_data.user_info.faction_id])
						.attr("action", "javascript:add_value(amount.value, from.value, to.value)")
						.style("left", (position.x + position.width / 2 - 75).toString() + "px")
						.style("top", (position.y + position.height / 2).toString() + "px");
					form.append("input").attr("class", "myInput primary " +
						game_data.user_interface.faction_names[game_data.user_info.faction_id]).attr("type", "text")
						.attr("name", "amount").attr("value", "").attr("id", "amount")
						.attr("placeholder", "Enter Amount").attr("autocomplete", "off");
					form.append("input").attr("type", "text").attr("name", "from")
						.attr("value", target.value).attr("id", "from").style("display", "none");
					form.append("input").attr("type", "text").attr("name", "to")
						.attr("value", cur_other.value).attr("id", "to").style("display", "none");
					form.append("input").attr("type", "submit").attr("value", "Add").attr("class", "myInputSubmit secondary "
						+ game_data.user_interface.faction_names[game_data.user_info.faction_id]);
				});
				buttons.push(button);
			}
		}
		else {
			position.x = (target.relative_pos.x * width + x_offset1 +
				cur_other.relative_pos.x * width - x_offset2) / 2 - position.width / 2;
			position.y = (target.relative_pos.y * height + y_offset1 +
				cur_other.relative_pos.y * height - y_offset2) / 2 - position.height / 2;
			button = make_button('assets/neutral/icons/043-connect.svg', position,
				"Prove a connection between these two Nodes.", function() { check_selection(target);
					setup_connection(target.value, cur_other.value); });
			buttons.push(button);
		}
		target[neighbors[i]].buttons = buttons;
		cur_inv = inv_neighbors[i];
		if (cur_inv === "check") {
			if (target.value % 2 === 0) cur_inv = "son";
			else cur_inv = "daughter";
		}
		cur_other[cur_inv].buttons = buttons;
	}
}

function untweak_connections(target) {
	let neighbors = ["parent", "brother", "sister", "son", "daughter"], i = -1,
		cur_other, inv_neighbors = ["check", "sister", "brother", "parent", "parent"],
		cur_inv;
	while (++i < 5) {
		cur_other = target[neighbors[i]].node;
		if (typeof(cur_other) === 'undefined' || cur_other === null) continue;
		if (typeof(target[neighbors[i]].buttons) === 'undefined' ||
			target[neighbors[i]].buttons === null) continue;
		cur_inv = inv_neighbors[i];
		if (cur_inv === "check") {
			if (target.value % 2 === 0) cur_inv = "son";
			else cur_inv = "daughter";
		}
		while (target[neighbors[i]].buttons.length > 0) {
			target[neighbors[i]].buttons[0].remove();
			target[neighbors[i]].buttons.splice(0, 1);
			cur_other[cur_inv].buttons.splice(0, 1);
		}
	}
}

function shorten_line(line, start_trim, end_trim) {
	let start = line.firstSegment.point;
	let end = line.lastSegment.point;
	let theta = Math.atan((start.y - end.y) / (start.x - end.x));
	let x_sign = end.x > start.x ? 1 : -1;// from start to end
	let new_start = new scope.Point(start.x + x_sign * Math.cos(theta) * start_trim,
		start.y + x_sign * Math.sin(theta) * start_trim);
	let new_end = new scope.Point(end.x - x_sign * Math.cos(theta) * end_trim,
		end.y - x_sign * Math.sin(theta) * end_trim);
	line.firstSegment.point = new_start;
	line.lastSegment.point = new_end;
}

function empty_connection(line) {
	line.strokeCap = 'round';
	line.strokeColor = game_data.colors[1].line;
	line.strokeWidth /= 2.5;
	line.dashArray = [5, 6];
}

function full_connection(line, faction) {
	let colors = game_data.colors[faction];
	line.strokeCap = 'round';
	line.shadowColor = new scope.Color(colors.line) * 0.4;
	line._shadow = line.shadowColor;
	line.shadowBlur = 5;
	line.strokeColor = colors.line;
}

function limit(num) {
	return Math.max(Math.min(num, 1.0), 0.0);
}

function straight_push(target) {
	if (target.stopped) return;
	let span = (new Date().getTime() - target.time) / 60000.0,
		amount = target.speed * span, point = target.ratio + amount;
	if (point >= 0.0 && point <= 1.0) {
		target.line.strokeColor.gradient.stops[0].offset = limit(point - 0.05);
		target.line.strokeColor.gradient.stops[1].offset = limit(point + 0.05);
	}
	else {
		target.stopped = true;
	}
}

function split_push(target, _sigma_frac, delta_frac) {
	if (target.stopped) return;
	let start_amount = delta_frac * target.speeds[0], start = target.ratios[0] + start_amount,
		end_amount = delta_frac * target.speeds[1], end = target.ratios[1] - end_amount;
	if (start >= 0.0 && start <= 1.0 && end >= 0.0 && end <= 1.0) {
		if (start > end && !target.straight) {
			target.speeds[0] = target.speeds[0] - target.speeds[1];
			target.speeds[1] = -target.speeds[0];
			target.ratios[0] = (start + end) / 2;
			target.ratios[1] = (start + end) / 2;
			let grad = target.line.strokeColor.gradient;
			target.line.strokeColor.gradient.stops = [[grad.stops[0].color, grad.stops[0].offset],
					[grad.stops[3].color, grad.stops[3].offset]];
			target.straight = true;
		}
		target.ratios[0] += start_amount;
		target.ratios[1] -= end_amount;
		if (target.straight) {
			target.line.strokeColor.gradient.stops[0].offset = limit(start - 0.05);
			target.line.strokeColor.gradient.stops[1].offset = limit(start + 0.05);
		}
		else {
			target.line.strokeColor.gradient.stops[0].offset = limit(start - 0.05);
			target.line.strokeColor.gradient.stops[1].offset = limit(start + 0.05);
			target.line.strokeColor.gradient.stops[2].offset = limit(end - 0.05);
			target.line.strokeColor.gradient.stops[3].offset = limit(end + 0.05);
		}
	}
	else {
		target.stopped = true;
	}
}

function continue_push(target) {
	return !target.stopped;
}

function expanding_connection(target, relation, line, time, start_faction,
		start_ratio, start_speed, end_faction, end_ratio, end_speed) {
	let start = new scope.Point(line.firstSegment.point),
		end = new scope.Point(line.lastSegment.point),
		start_color = game_data.colors[start_faction].line,
		end_color = game_data.colors[end_faction].line,
		dark_start = start_color * 0.4;
	line.strokeCap = 'round';
	line.shadowColor = dark_start;
	line._shadow = line.shadowColor;
	line.shadowBlur = 5;
	let left = limit(start_ratio - 0.05), right = limit(start_ratio + 0.05);
	line.strokeColor = {
		gradient: { stops: [[start_color, left], [end_color, right]] },
		origin: start, destination: end
	};
	let push_obj = { line: line, speed: start_speed - end_speed, ratio: start_ratio,
		time: time };
	target[relation + "_push"] = push_obj;
	add_animation(push_obj, straight_push, continue_push, 60000);
}

function contested_connection(target, relation, line, time, start_faction,
	start_ratio, start_speed, end_faction, end_ratio, end_speed) {
	let start = new scope.Point(line.firstSegment.point),
		end = new scope.Point(line.lastSegment.point),
		start_color = game_data.colors[start_faction].line,
		end_color = game_data.colors[end_faction].line,
		dark_start = start_color * 0.4;
	line.strokeCap = 'round';
	line.shadowColor = dark_start;
	line._shadow = line.shadowColor;
	line.shadowBlur = 5;
	if (start_ratio + end_ratio >= 1.0) {
		start_ratio *= 1 / (start_ratio + end_ratio);
		let left = limit(start_ratio - 0.05), right = limit(start_ratio + 0.05);
		line.strokeColor = {
			gradient: { stops: [[start_color, left], [end_color, right]] },
			origin: start, destination: end
		};
		let push_obj = { line: line, speed: start_speed - end_speed, ratio: start_ratio,
			time: time };
		target[relation + "_push"] = push_obj;
		add_animation(push_obj, straight_push, continue_push, 60000);
	}
	else {
		end_ratio = 1 - end_ratio;
		let middle_color = game_data.colors["1"].line,
			l_start = limit(start_ratio - 0.05), r_start = limit(start_ratio + 0.05),
			l_end = limit(end_ratio - 0.05), r_end = limit(end_ratio + 0.05);
		line.strokeColor = {
			gradient: { stops: [[start_color, l_start], [middle_color, r_start],
				[middle_color, l_end], [end_color, r_end]] },
			origin: start, destination: end
		};
		let push_obj = { line: line, speeds: [start_speed, end_speed], time: time,
			ratios: [start_ratio, end_ratio] };
		target[relation + "_push"] = push_obj;
		add_animation(push_obj, split_push, continue_push, 60000);
	}
}

function show_line(origin, end, relation) {
	let from = new scope.Point(origin.circle.position.x, origin.circle.position.y);
	let to = new scope.Point(end.circle.position.x, end.circle.position.y);
	let connection = new scope.Path.Line(from, to);
	shorten_line(connection, origin.rad * 1.25, end.rad * 1.35);
	connection.strokeWidth = (origin.circle.strokeWidth + end.circle.strokeWidth) / 2.5;
	let progressed = false, first = 0.0, second = 0.0;
	if (end.connection_data[relation]) {
		let span = (new Date().getTime() - end.connection_data[relation].last_updated) / 60000.0;
		first = parseFloat(end.connection_data[relation].completions[0].percentage) +
			end.connection_data[relation].completions[0].speed * span / 100.0;
		second = parseFloat(end.connection_data[relation].completions[1].percentage) +
			end.connection_data[relation].completions[1].speed * span / 100.0;
		progressed = end.connection_data[relation] !== null && (first !== 0 || second !== 0);
	}
	if (game_data.node_factions[origin.value] === game_data.node_factions[end.value]
		&& progressed) full_connection(connection, game_data.node_factions[origin.value]);
	else if (game_data.node_factions[origin.value] !== 1 && progressed &&
		game_data.node_factions[end.value] !== 1) {
		contested_connection(end, relation, connection,
			end.connection_data[relation].last_updated,
			game_data.node_factions[origin.value],
			parseFloat(end.connection_data[relation].completions[1].percentage) / 100.0,
			end.connection_data[relation].completions[1].speed / 100.0,
			game_data.node_factions[end.value],
			parseFloat(end.connection_data[relation].completions[0].percentage) / 100.0,
			end.connection_data[relation].completions[0].speed / 100.0);
	}
	else {
		if (end.connection_data[relation] === null || !progressed)
		  empty_connection(connection);
		else {
			if (game_data.node_factions[origin.value] === 1) {
				expanding_connection(origin, relation,
					connection, end.connection_data[relation].last_updated,
					game_data.node_factions[origin.value], 1.0 - first / 100.0, 0.0,
					game_data.node_factions[end.value], first / 100.0,
					end.connection_data[relation].completions[0].speed / 100.0);
			}
			else {
				expanding_connection(end, relation,
					connection, end.connection_data[relation].last_updated,
					game_data.node_factions[origin.value], second / 100.0,
					end.connection_data[relation].completions[1].speed / 100.0,
					game_data.node_factions[end.value], 1.0 - second / 100.0, 0.0);
			}
		}
	}
	connection.sendToBack();
	return connection;
}

function show_connections(target) {
	target.connection_data.dad = game_data.node_connections[target.value]['dad'];
	target.connection_data.bro = game_data.node_connections[target.value]['bro'];
	let connection_dad = null, connection_bro = null;
	if (target.parent.node !== null && (target.connection_data.dad !== null ||
		(typeof(game_data.proved[target.value]) !== 'undefined' &&
		game_data.proved[target.value] !== null &&
		game_data.proved[target.value].indexOf(target.parent.node.value) !== -1))) {
		let dad = target.parent.node;
		if (dad !== null) {
			connection_dad = show_line(dad, target, "dad");
			target.parent.line = connection_dad;
			if (target.value / 2 === dad.value) dad.son.line = connection_dad;
			else dad.daughter.line = connection_dad;
		}
	}
	if (target.brother.node !== null && (target.connection_data.bro !== null ||
			(typeof(game_data.proved[target.value]) !== 'undefined' &&
				game_data.proved[target.value] !== null &&
				game_data.proved[target.value].indexOf(target.brother.node.value) !== -1))) {
		let bro = target.brother.node;
		if (bro !== null) {
			connection_bro = show_line(bro, target, "bro");
			target.brother.line = connection_bro;
			bro.sister.line = connection_bro;
		}
	}
	target.connections = new scope.Group(connection_dad, connection_bro);
}

function hide_connections(target) {
	target.connections.remove();
	let neighbors = ["parent", "brother", "sister", "son", "daughter"], i = -1,
		inv_neighbors = ["check", "sister", "brother", "parent", "parent"], cur_inv;
	while (++i < 5) {
		let cur_other = target[neighbors[i]].node;
		if (typeof(cur_other) === 'undefined' || cur_other === null) continue;
		if (typeof(target[neighbors[i]].line) !== 'undefined' &&
			target[neighbors[i]].line !== null) {
			target[neighbors[i]].line = null;
			cur_inv = inv_neighbors[i];
			if (cur_inv === "check") {
				if (target.value % 2 === 0) cur_inv = "son";
				else cur_inv = "daughter";
			}
			cur_other[cur_inv].line = null;
		}
	}
}
