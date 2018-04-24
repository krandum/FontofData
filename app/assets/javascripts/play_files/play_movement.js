function hob(num) {
	if (!num) return 0;
	let out = 1;
	while (num >>= 1) out += 1;
	return out;
}

function get_solid_mask(len) {
	if (len <= 0) return 0;
	let out = 1, i = 0;
	while (++i < len) out = (out << 1) | 1;
	return out;
}

function take_bits(num, from, amount, base) {
	let bit_len = hob(num);
	let tail_num = bit_len - from - amount;
	if (tail_num < 0) return -1;
	let tail_mask = get_solid_mask(tail_num);
	let check_mask = get_solid_mask(amount);
	let compare = base & check_mask;
	check_mask <<= tail_num;
	let head_mask = get_solid_mask(from) << (tail_num + amount);
	let check = (num & check_mask) >> tail_num;
	let tail = num & tail_mask;
	let head = (num & head_mask) >> amount;
	if (check !== compare) return -1;
	return head | tail;
}

function give_bits(num, from, amount, add) {
	let bit_len = hob(num);
	let tail_num = bit_len - from;
	if (tail_num < 0 || tail_num > 5 - amount) return -1;
	let tail_mask = get_solid_mask(tail_num);
	let head_mask = get_solid_mask(from) << (tail_num);
	let tail = num & tail_mask;
	let head = (num & head_mask) << amount;
	let mid = add << tail_num;
	return head | mid | tail;
}

function swap(arr, index1, index2) {
	let tmp = arr[index1];
	arr[index1] = arr[index2];
	arr[index2] = tmp;
}

function partition(arr, lo, hi) {
	let pivot = arr[lo].position, i = lo - 1, j = hi + 1;
	while (true) {
		do { i++; } while (arr[i].position < pivot);
		do { j--; } while (arr[j].position > pivot);
		if (i >= j) return j;
		swap(arr, i, j);
	}
}

function sort_active_nodes(arr, lo, hi) {
	if (lo < hi) {
		let pivot = partition(arr, lo, hi);
		sort_active_nodes(arr, lo, pivot);
		sort_active_nodes(arr, pivot + 1, hi);
	}
}

function move_to(target) {
	let bit_base = hob(game_data.global_root.position),
		bit_dif = hob(target.position) - bit_base, i = -1;
	while (++i < 63) {
		let cur_node = game_data.active_nodes[i], target_position =
			take_bits(cur_node.position, bit_base, bit_dif, target.position);
		if (target_position === -1) game_data.buffer_nodes.push(cur_node);
		else {
			cur_node.move_target = game_data.active_nodes[target_position - 1].relative_pos;
			cur_node.move_position = target_position;
			cur_node.move_value = cur_node.value;
			cur_node.move_thickness = game_data.active_nodes[target_position - 1].circle.strokeWidth;
			cur_node.popper = false;
		}
		set_fraction(cur_node);
	}
	let relocs = [], ranges = [], amount = 32, j;
	i = -1;
	while (++i < bit_dif) {
		j = -1;
		while (++j < amount) relocs.push(j + amount);
		ranges.push({ from: Math.pow(2, 5 - i) * target.value,
			to: Math.pow(2, 5 - i) * target.value + amount - 1 });
		amount /= 2;
	}
	i = 0;
	let leftie = relocs[0];
	j = 0;
	while (game_data.buffer_nodes.length > 0) {
		if (relocs[i] < leftie) {
			leftie = relocs[i];
			j = 0;
		}
		game_data.buffer_nodes[0].move_target =
			game_data.positions[game_data.active_nodes[relocs[i] - 1].position];
		game_data.buffer_nodes[0].move_position = relocs[i];
		game_data.buffer_nodes[0].move_value = leftie * target.value + j;
		game_data.buffer_nodes[0].move_thickness = game_data.active_nodes[relocs[i] - 1]
			.circle.strokeWidth;
		game_data.buffer_nodes[0].popper = true;
		game_data.buffer_nodes[0].popped = false;
		game_data.buffer_nodes.splice(0, 1);
		i++;
		j++;
	}
	i = -1;
	while (++i < game_data.active_nodes.length)
		game_data.active_nodes[i].position = game_data.active_nodes[i].move_position;
	sort_active_nodes(game_data.active_nodes, 0, game_data.active_nodes.length - 1);
	game_data.old_root = game_data.active_nodes[0];
	get_more_node_data(ranges);
}

function move_back(amount) {
	if (amount > 5) return;
	let base = game_data.global_root.value, new_base_value = base >> amount, add = 0, i = -1;
	if (new_base_value <= 0) return;
	while (++i < amount) {
		add |= (base & (1 << (amount - i - 1))) >> (amount - i - 1);
		if (i + 1 !== amount) add <<= 1;
	}
	i = -1;
	while (++i < 63) {
		let cur_node = game_data.active_nodes[i];
		let target_position = give_bits(cur_node.position, 1, amount, add);
		if (target_position === -1) game_data.buffer_nodes.push(cur_node);
		else {
			cur_node.move_target = game_data.active_nodes[target_position - 1].relative_pos;
			cur_node.move_position = target_position;
			cur_node.move_value = cur_node.value;
			cur_node.move_thickness = game_data.active_nodes[target_position - 1].circle.strokeWidth;
			cur_node.popper = false;
		}
		set_fraction(cur_node);
	}
	let relocs = [], ranges = [], row_len = 32, gap_len = 32 >> amount,
		gap_start = 0, to_add, tmp_amount = amount, tmp_add = 16;
	while (tmp_amount > 0) {
		tmp_amount--;
		to_add = ((add >> tmp_amount) & 1) * tmp_add;
		gap_start += to_add;
		tmp_add >>= 1;
	}
	i = -1;
	while (++i <= 5) {
		let j = -1;
		while (++j < row_len) {
			if (j === gap_start) j += gap_len;
			if (j >= row_len) break;
			relocs.push({ value: j + row_len, leftie: row_len });
		}
		if (gap_start !== 0)
			ranges.push({ from: Math.pow(2, 5 - i) * new_base_value,
				to: Math.pow(2, 5 - i) * new_base_value + gap_start - 1 });
		if (gap_start + gap_len < row_len)
			ranges.push({ from: Math.pow(2, 5 - i) * new_base_value + gap_start + gap_len,
				to: Math.pow(2, 5 - i) * new_base_value + row_len - 1 });
		row_len /= 2;
		gap_len = Math.floor(gap_len / 2);
		gap_start = Math.floor(gap_start / 2);
	}
	i = 0;
	while (game_data.buffer_nodes.length > 0) {
		game_data.buffer_nodes[0].move_target =
			game_data.positions[game_data.active_nodes[relocs[i].value - 1].position];
		game_data.buffer_nodes[0].move_position = relocs[i].value;
		game_data.buffer_nodes[0].move_value = relocs[i].leftie *
			new_base_value + relocs[i].value % relocs[i].leftie;
		game_data.buffer_nodes[0].move_thickness = game_data.active_nodes[
			relocs[i].value - 1].circle.strokeWidth;
		game_data.buffer_nodes[0].popper = true;
		game_data.buffer_nodes[0].popped = false;
		game_data.buffer_nodes.splice(0, 1);
		i++;
	}
	i = -1;
	while (++i < game_data.active_nodes.length)
		game_data.active_nodes[i].position = game_data.active_nodes[i].move_position;
	game_data.old_root = game_data.active_nodes[0];
	sort_active_nodes(game_data.active_nodes, 0, game_data.active_nodes.length - 1);
	get_more_node_data(ranges);
}

function move_nodes(target, sigma_frac) {
	let width = scope.view.size.width;
	let height = scope.view.size.height;
	let prev_pos = game_data.old_root.circle.position;
	let i = -1;
	let cur_node;
	while (++i < game_data.active_nodes.length) {
		cur_node = game_data.active_nodes[i];
		cur_node.moving = true;
		if (cur_node.base === null) {
			cur_node.base = new scope.Rectangle();
			cur_node.base.x = cur_node.relative_pos.x * width;
			cur_node.base.y = cur_node.relative_pos.y * height;
			cur_node.base.width = cur_node.relative_pos.size_dx * height;
			cur_node.base.height = cur_node.relative_pos.size_dy * height;
		}
		if (typeof(cur_node.popper) === 'undefined' || !cur_node.popper) {
			cur_node.circle.position.x = cur_node.base.x + sigma_frac *
				(cur_node.move_target.x * width - cur_node.base.x);
			cur_node.circle.position.y = cur_node.base.y + sigma_frac *
				(cur_node.move_target.y * height - cur_node.base.y);
			cur_node.circle.bounds.width = cur_node.base.width + sigma_frac *
				(cur_node.move_target.size_dx * height - cur_node.base.width);
			cur_node.circle.bounds.height = cur_node.base.height + sigma_frac *
				(cur_node.move_target.size_dy * height - cur_node.base.height);
			apply_fraction(cur_node);
			cur_node.popper = false;
		}
		else {
			if (sigma_frac >= 0.5 && !cur_node.popped) {
				cur_node.popped = true;
				cur_node.value = cur_node.move_value;
				let leftie = cur_node.value % 2 !== 0;
				if (leftie !== cur_node.left_pointed) {
					cur_node.left_pointed = leftie;
					cur_node.circle.scale(-1, 1);
				}
				let node_color = game_data.colors[game_data.node_factions[cur_node.value].toString()];
				let num_digits = cur_node.value.toString().length;
				cur_node.number.content = cur_node.value;
				cur_node.circle.strokeColor = node_color['line'];
				cur_node.circle.fillColor = node_color['fill'];
				cur_node.circle.strokeWidth = cur_node.move_thickness;
				if (i < 31) {
					let sine_size = cur_node.circle.bounds.width / 2.3;
					let num_w = sine_size * (2 - 1 / num_digits);
					let num_h = (num_w / num_digits) * 1.45;
					cur_node.number.visible = true;
					cur_node.number.fillColor = node_color['num'];
					cur_node.number.content = cur_node.value.toString();
					cur_node.number.bounds.width = num_w;
					cur_node.number.bounds.height = num_h;
					cur_node.number.bounds.x = cur_node.circle.position.x - num_w / 2;
					cur_node.number.bounds.y = cur_node.circle.position.y - num_h / 2;
				}
				else {
					let dot_w = cur_node.circle.bounds.width * 0.7246377;
					let dot_h = dot_w * 0.483333;
					cur_node.number.fillColor = node_color['num'];
					cur_node.number.content = "...";
					cur_node.number.bounds.width = dot_w;
					cur_node.number.bounds.height = dot_h;
					cur_node.number.bounds.x = cur_node.circle.position.x - dot_w / 2;
					cur_node.number.bounds.y = cur_node.circle.position.y - dot_h / 2;
				}
				set_fraction(cur_node);
			}
			if (sigma_frac === 0.5) {
				cur_node.circle.bounds.width = 0.0001;
				cur_node.circle.bounds.height = 0.0001;
				cur_node.circle.position.x = cur_node.move_target.x * width;
				cur_node.circle.position.y = cur_node.move_target.y * height;
			}
			else if (sigma_frac > 0.5 || cur_node.popped) {
				cur_node.circle.bounds.width = 2 * (sigma_frac - 0.5) *
					cur_node.move_target.size_dx * height;
				cur_node.circle.bounds.height = 2 * (sigma_frac - 0.5) *
					cur_node.move_target.size_dy * height;
				cur_node.circle.position.x = cur_node.move_target.x * width;
				cur_node.circle.position.y = cur_node.move_target.y * height;
			}
			else {
				cur_node.circle.bounds.width = 2 * (0.5 - sigma_frac) *
					cur_node.base.width;
				cur_node.circle.bounds.height = 2 * (0.5 - sigma_frac) *
					cur_node.base.height;
				cur_node.circle.position.x = cur_node.base.x;
				cur_node.circle.position.y = cur_node.base.y;
			}
			apply_fraction(cur_node);
		}
	}
	let new_pos = game_data.old_root.circle.position;
	game_data.background.move_to(prev_pos, new_pos, sigma_frac);
}

function confirm_moved_nodes() {
	let width = scope.view.size.width, height = scope.view.size.height, i = -1,
		prev_pos = game_data.old_root.circle.position, leftie, node_color,
		num_digits, sine_size, num_w, num_h, dot_w, dot_h, cur_node;
	while (++i < game_data.active_nodes.length) {
		cur_node = game_data.active_nodes[i];
		cur_node.popped = false;
		cur_node.circle.bounds.width = cur_node.move_target.size_dx * height;
		cur_node.circle.bounds.height = cur_node.move_target.size_dy * height;
		cur_node.circle.position.x = cur_node.move_target.x * width;
		cur_node.circle.position.y = cur_node.move_target.y * height;
		cur_node.value = cur_node.move_value;
		leftie = cur_node.value % 2 !== 0;
		if (leftie !== cur_node.left_pointed) {
			cur_node.left_pointed = leftie;
			cur_node.circle.scale(-1, 1);
		}
		node_color = game_data.colors[game_data.node_factions[cur_node.value].toString()];
		num_digits = cur_node.value.toString().length;
		cur_node.relative_pos = cur_node.move_target;
		cur_node.base = null;
		cur_node.rad = cur_node.circle.bounds.width / 2;
		cur_node.number.content = cur_node.value;
		cur_node.moving = false;
		cur_node.circle.strokeColor = node_color['line'];
		cur_node.circle.fillColor = node_color['fill'];
		cur_node.circle.strokeWidth = cur_node.move_thickness;
		cur_node.circle.shadowColor = new scope.Color(node_color['line']) * 0.4;
		cur_node.circle._shadow = cur_node.circle.shadowColor;
		cur_node.circle.shadowBlur = cur_node.move_thickness * 5;
		if (i < 31) {
			sine_size = cur_node.circle.bounds.width / 2.3;
			num_w = sine_size * (2 - 1 / num_digits);
			num_h = (num_w / num_digits) * 1.45;
			cur_node.number.visible = true;
			cur_node.number.fillColor = node_color['num'];
			cur_node.number.content = cur_node.value.toString();
			cur_node.number.bounds.width = num_w;
			cur_node.number.bounds.height = num_h;
			cur_node.number.bounds.x = cur_node.circle.position.x - num_w / 2;
			cur_node.number.bounds.y = cur_node.circle.position.y - num_h / 2;
		}
		else {
			dot_w = cur_node.circle.bounds.width * 0.7246377;
			dot_h = dot_w * 0.483333;
			cur_node.number.fillColor = node_color['num'];
			cur_node.number.content = "...";
			cur_node.number.bounds.width = dot_w;
			cur_node.number.bounds.height = dot_h;
			cur_node.number.bounds.x = cur_node.circle.position.x - dot_w / 2;
			cur_node.number.bounds.y = cur_node.circle.position.y - dot_h / 2;
		}
		set_fraction(cur_node);
	}
	connect_nodes(game_data.active_nodes);
	let new_pos = game_data.old_root.circle.position;
	game_data.background.move_to(prev_pos, new_pos, 1);
	i = 0;
	while (i < game_data.active_nodes.length) {
		show_connections(game_data.active_nodes[i]);
		i++;
	}
	game_data.global_root = game_data.active_nodes[0];
	update_framework();
	game_data.background.set_triangle_targets();
	add_animation(null, color_background_animation, color_background_stop, 400);
	return false;
}

function set_resize() {
	scope.view.onResize = function() {
		let width = scope.view.size.width, height = scope.view.size.height,
			i = 0, cur_node;
		while (i < 63) {
			cur_node = game_data.active_nodes[i];
			hide_connections(cur_node);
			set_fraction(cur_node);
			cur_node.circle.position.x = cur_node.relative_pos.x * width;
			cur_node.circle.position.y = cur_node.relative_pos.y * height;
			cur_node.circle.bounds.width = cur_node.relative_pos.size_dx * height;
			cur_node.circle.bounds.height = cur_node.relative_pos.size_dy * height;
			apply_fraction(cur_node);
			i++;
		}
		i = 0;
		while (i < 63) {
			show_connections(game_data.active_nodes[i]);
			i++;
		}
	}
}
