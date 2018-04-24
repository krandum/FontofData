d3.selection.prototype.moveToFront = function() {
	return this.each(function() { this.parentNode.appendChild(this); });
};

function log_data(a, b, path) {
	App.game.perform('log_data', { val_a: a, val_b: b, path: path });
}

function setup_connection(a, b) {
	function next_orbit(num) {
		if (num % 2 === 0) return [num / 2, 2];
		return [(num * 3 + 1) / 2, 1];
	}
	function prev_orbits(num) {
		let a = num * 2, b = ((num * 2 - 1) % 3 === 0) ? (num * 2 - 1) / 3 : -1;
		return [a, b];
	}
	function add_to_id(cur_id, num, type_char) {
		if (cur_id === null) return type_char + num.toString();
		return cur_id + "." + type_char + num.toString();
	}
	function build_object(num) {
		let out_nodes = [], cur_val = num, cur_id = add_to_id(null, num, 'b'), a, b,
			cur_depth = 0, line_counts = [], depth_counts = [], node, cur_stamp;
		depth_counts[0] = { lines: [0] };
		depth_counts[-1] = { lines: [0] };
		depth_counts[-2] = { lines: [0] };
		depth_counts[-3] = { lines: [0] };
		depth_counts[-4] = { lines: [0] };
		line_counts[0] = { amount: 9, branch: [{ source_depth: -5, source_line: 0,
			height: 4 }], nodes: [] };
		node = { id: cur_id, value: num, depth: 0, line: 0, stamp: 0 };
		cur_stamp = 0;
		line_counts[0].nodes[0] = node;
		line_counts.lines = [0];
		out_nodes.push(node);
		let consider_num = function (num) {
			if (cur_depth === 4 || cur_depth === -4) return;
			if (typeof(game_data.proved[num]) !== 'undefined' &&
				game_data.proved[num] !== null && game_data.proved[num].length > 0) {
				let k = -1, cur_line = 0;
				while (++k < game_data.proved[num].length) {
					cur_line--;
					if (typeof(line_counts[cur_line]) === 'undefined' ||
						line_counts[cur_line] === null) {
						line_counts[cur_line] = { amount: 0, branch: [], nodes: [] };
						line_counts.lines.push(cur_line);
					}
					line_counts[cur_line].amount++;
					line_counts[cur_line].branch.push({ source_depth: cur_depth,
						source_line: 0, height: cur_depth + 1 });
					if (typeof(depth_counts[cur_depth + 1]) === 'undefined' ||
						depth_counts[cur_depth + 1] === null)
						depth_counts[cur_depth + 1] = { lines: [] };
					depth_counts[cur_depth + 1].lines.push(cur_line);
					node = { id: add_to_id(cur_id, game_data.proved[num][k], 'p'),
						value: game_data.proved[num][k], depth: cur_depth + 1,
						line: cur_line, stamp: ++cur_stamp };
					line_counts[cur_line].nodes[cur_depth + 1] = node;
					out_nodes.push(node);
				}
			}
		};
		while (++cur_depth <= 4) {
			[a, b] = prev_orbits(cur_val);
			depth_counts[cur_depth] = { lines: [] };
			if (b !== -1) {
				if (typeof(line_counts[1]) === 'undefined' || line_counts[1] === null) {
					line_counts[1] = { amount: 0, branch: [], nodes: [] };
					line_counts.lines.push(1);
				}
				line_counts[1].amount++;
				line_counts[1].branch.push({ source_depth: cur_depth - 1, source_line: 0,
					height: cur_depth });
				depth_counts[cur_depth].lines.push(1);
				node = { id: add_to_id(cur_id, b, 's'), value: b, depth: cur_depth,
					line: 1, stamp: ++cur_stamp };
				line_counts[1].nodes[cur_depth] = node;
				out_nodes.push(node);
			}
			cur_id = add_to_id(cur_id, a, 'u');
			node = { id: cur_id, value: a, depth: cur_depth, line: 0, stamp: ++cur_stamp };
			line_counts[0].nodes[cur_depth] = node;
			out_nodes.push(node);
			depth_counts[cur_depth].lines.push(0);
			cur_val = a;
			consider_num(a);
		}
		cur_depth = 0;
		cur_id = add_to_id(null, num, 'b');
		cur_val = num;
		while (--cur_depth >= -4) {
			[a, b] = next_orbit(cur_val);
			if (b === 2) cur_id = add_to_id(cur_id, a, 'd');
			else cur_id = add_to_id(cur_id, a, 'c');
			node = { id: cur_id, value: a, depth: cur_depth, line: 0, stamp: ++cur_stamp };
			line_counts[0].nodes[cur_depth] = node;
			out_nodes.push(node);
			cur_val = a;
			consider_num(a);
		}
		out_nodes.columns = ["id", "value", "depth", "line", "stamp"];
		return { data: out_nodes, line_counts: line_counts, depth_counts: depth_counts,
			cur_stamp: cur_stamp };
	}
	function move_everything_left_above(context, line, depth) {
		//console.log("  <-Moving everything above " + depth.toString() + " along " + line.toString());
		let arr = context.line_counts, i = -1, branch_index = -1, cur, j, n_cur,
			avoid_arr = [], k, skip, cur_branch;
		while (++i < arr.lines.length) {
			cur = arr[arr.lines[i]];
			j = -1;
			while (++j < cur.branch.length) {
				k = -1;
				skip = false;
				cur_branch = cur.branch[j];
				while (++k < avoid_arr.length) if (avoid_arr[k] === cur_branch) skip = true;
				if (skip) continue;
				if (cur_branch.source_depth > depth && cur_branch.source_line === line
					&& arr.lines[i] > line) {
					avoid_arr.push(cur_branch);
					//console.log("<~Recurring for branch-left");
					move_everything_left_above(context, arr.lines[i], cur_branch.source_depth);
				}
			}
		}
		arr = context.line_counts[line].branch;
		i = -1;
		let next = line + 1;
		while (++i < arr.length) {
			cur = arr[i];
			if (depth >= cur.source_depth && depth < cur.height) branch_index = i;
		}
		i = -1;
		let branch = context.line_counts[line].branch[branch_index];
		while (++i < context.data.length) {
			cur = context.data[i];
			if (cur.line === line && cur.depth > depth && cur.depth <= branch.height) {
				if (typeof(context.line_counts[next]) === 'undefined' ||
					context.line_counts[next] === null) {
					context.line_counts[next] = { amount: 0, branch: [], nodes: [] };
					context.line_counts.lines.push(next);
				}
				n_cur = context.line_counts[next].nodes[cur.depth];
				if (typeof(n_cur) !== 'undefined' && n_cur !== null) {
					j = -1;
					while (++j < context.line_counts[next].branch.length) {
						cur_branch = context.line_counts[next].branch[j];
						if (cur_branch.source_depth < cur.depth &&
							cur_branch.height >= cur.depth) {
							//console.log("<~Recurring due to collision while moving");
							move_everything_left_above(context, next, cur_branch.source_depth);
						}
						if (typeof(context.line_counts[next]) === 'undefined' ||
							context.line_counts[next] === null) break;
					}
				}
				if (typeof(context.line_counts[next]) === 'undefined' ||
					context.line_counts[next] === null) {
					context.line_counts[next] = { amount: 0, branch: [], nodes: [] };
					context.line_counts.lines.push(next);
				}
				cur.line = next;
				context.line_counts[line].amount--;
				context.line_counts[next].amount++;
				context.line_counts[next].nodes[cur.depth] = cur;
				context.line_counts[line].nodes[cur.depth] = null;
				context.depth_counts[cur.depth].lines.splice(
					context.depth_counts[cur.depth].lines.indexOf(line), 1, next);
			}
		}
		if (branch.source_depth === depth) {
			if (branch.source_line === line) branch.source_line = next;
			context.line_counts[next].branch.push(branch);
			context.line_counts[line].branch.splice(branch_index, 1);
		}
		else if (branch.source_depth < depth) {
			context.line_counts[next].branch.push({ source_depth: depth,
				source_line: line, height: branch.height });
			branch.height = depth;
		}
		if (context.line_counts[line].amount === 0) {
			context.line_counts[line] = null;
			context.line_counts.lines.splice(context.line_counts.lines.indexOf(line), 1);
		}
		arr = context.line_counts;
		avoid_arr = [];
		i = -1;
		while (++i < arr.lines.length) {
			cur = arr[arr.lines[i]];
			j = -1;
			while (++j < cur.branch.length) {
				k = -1;
				skip = false;
				cur_branch = cur.branch[j];
				while (++k < avoid_arr.length) if (avoid_arr[k] === cur_branch) skip = true;
				if (skip) continue;
				if (cur_branch.source_depth > depth && cur_branch.source_line === line
					&& arr.lines[i] < line) {
					avoid_arr.push(cur_branch);
					//console.log("<~Recurring due to branch-right");
					move_everything_left_above(context, arr.lines[i], cur_branch.source_depth);
				}
			}
		}
	}
	function move_everything_right_above(context, line, depth) {
		//console.log("  ->Moving everything above " + depth.toString() + " along " + line.toString());
		let arr = context.line_counts, i = -1, branch_index = -1, cur, j, n_cur,
			avoid_arr = [], k, skip, cur_branch;
		while (++i < arr.lines.length) {
			cur = arr[arr.lines[i]];
			j = -1;
			while (++j < cur.branch.length) {
				k = -1;
				skip = false;
				cur_branch = cur.branch[j];
				while (++k < avoid_arr.length) if (avoid_arr[k] === cur_branch) skip = true;
				if (skip) continue;
				if (cur_branch.source_depth > depth && cur_branch.source_line === line
					&& arr.lines[i] > line) {
					avoid_arr.push(cur_branch);
					//console.log("~>Recurring for branch-right");
					move_everything_right_above(context, arr.lines[i], cur_branch.source_depth);
				}
			}
		}
		arr = context.line_counts[line].branch;
		i = -1;
		let next = line + 1;
		while (++i < arr.length) {
			cur = arr[i];
			if (depth >= cur.source_depth && depth < cur.height) branch_index = i;
		}
		i = -1;
		let branch = context.line_counts[line].branch[branch_index];
		while (++i < context.data.length) {
			cur = context.data[i];
			if (cur.line === line && cur.depth > depth && cur.depth <= branch.height) {
				if (typeof(context.line_counts[next]) === 'undefined' ||
					context.line_counts[next] === null) {
					context.line_counts[next] = { amount: 0, branch: [], nodes: [] };
					context.line_counts.lines.push(next);
				}
				n_cur = context.line_counts[next].nodes[cur.depth];
				if (typeof(n_cur) !== 'undefined' && n_cur !== null) {
					j = -1;
					while (++j < context.line_counts[next].branch.length) {
						cur_branch = context.line_counts[next].branch[j];
						if (cur_branch.source_depth < cur.depth &&
							cur_branch.height >= cur.depth) {
							//console.log("~>Recurring due to collision while moving");
							move_everything_right_above(context, next, cur_branch.source_depth);
						}
						if (typeof(context.line_counts[next]) === 'undefined' ||
							context.line_counts[next] === null) break;
					}
				}
				if (typeof(context.line_counts[next]) === 'undefined' ||
					context.line_counts[next] === null) {
					context.line_counts[next] = { amount: 0, branch: [], nodes: [] };
					context.line_counts.lines.push(next);
				}
				cur.line = next;
				context.line_counts[line].amount--;
				context.line_counts[next].amount++;
				context.line_counts[next].nodes[cur.depth] = cur;
				context.line_counts[line].nodes[cur.depth] = null;
				context.depth_counts[cur.depth].lines.splice(
					context.depth_counts[cur.depth].lines.indexOf(line), 1, next);
			}
		}
		if (branch.source_depth === depth) {
			if (branch.source_line === line) branch.source_line = next;
			context.line_counts[next].branch.push(branch);
			context.line_counts[line].branch.splice(branch_index, 1);
		}
		else if (branch.source_depth < depth) {
			context.line_counts[next].branch.push({ source_depth: depth,
				source_line: line, height: branch.height });
			branch.height = depth;
		}
		if (context.line_counts[line].amount === 0) {
			context.line_counts[line] = null;
			context.line_counts.lines.splice(context.line_counts.lines.indexOf(line), 1);
		}
		arr = context.line_counts;
		avoid_arr = [];
		i = -1;
		while (++i < arr.lines.length) {
			cur = arr[arr.lines[i]];
			j = -1;
			while (++j < cur.branch.length) {
				k = -1;
				skip = false;
				cur_branch = cur.branch[j];
				while (++k < avoid_arr.length) if (avoid_arr[k] === cur_branch) skip = true;
				if (skip) continue;
				if (cur_branch.source_depth > depth && cur_branch.source_line === line
					&& arr.lines[i] < line) {
					avoid_arr.push(cur_branch);
					//console.log("~>Recurring due to branch-left");
					move_everything_right_above(context, arr.lines[i], cur_branch.source_depth);
				}
			}
		}
	}
	function expand_context_at(context, node_data) {
		let num = node_data.value, cur_depth = node_data.depth, cur_line = node_data.line,
			source_index = -1, i = -1, j, cur, ceiling = null, cur_id = node_data.id,
			depths = context.depth_counts, lines = context.line_counts, n_cur,
			data = context.data, arr = lines[cur_line].branch, a, b, cur_val, node,
			cur_stamp = context.cur_stamp;
		while (++i < arr.length) {
			cur = arr[i];
			if (cur_depth > cur.source_depth && cur_depth <= cur.height)
				source_index = i;
			else if (ceiling === null && cur.source_depth >= cur_depth)
				ceiling = cur.source_depth + 1;
			else if (ceiling !== null && cur.source_depth >= cur_depth
				&& cur.source_depth + 1 < ceiling) ceiling = cur.source_depth + 1;
		}
		if (source_index === -1) throw new Error("Failure to update context");
		let needed = 5, cur_node;
		cur_val = num;
		while (--needed > 0) {
			cur_depth++;
			cur_node = lines[cur_line].nodes[cur_depth];
			[a, b] = prev_orbits(cur_val);
			if (typeof(cur_node) !== 'undefined' && cur_node !== null) {
				if (cur_node.value === b) {
					//console.log("Ran into red branch, gotta move it to its place (right)");
					move_everything_right_above(context, cur_line, cur_depth - 1, 1);
				}
				else if (cur_node.value !== a) {
					//console.log("Ran into some other branch at " + cur_depth + " along " + cur_line);
					move_everything_right_above(context, cur_line, arr[source_index].source_depth);
					cur_line++;
					arr = lines[cur_line].branch;
					source_index = -1;
					i = -1;
					while (++i < arr.length) if (node_data.depth > arr[i].source_depth
						&& node_data.depth <= arr[i].height) source_index = i;
					if (source_index === -1) throw new Error("Failure to update context");
				}
			}
			if (typeof(depths[cur_depth]) === 'undefined' || depths[cur_depth] === null)
				depths[cur_depth] = { lines: [] };
			i = -1;
			let branch_off = false;
			while (++i < depths[cur_depth].lines.length) {
				cur_node = lines[depths[cur_depth].lines[i]].nodes[cur_depth];
				if (cur_node.value === b) branch_off = true;
			}
			if (b !== -1 && !branch_off) {
				if (typeof(lines[cur_line + 1]) === 'undefined' || lines[cur_line + 1] === null) {
					lines[cur_line + 1] = { amount: 0, branch: [], nodes: [] };
					lines.lines.push(cur_line + 1);
				}
				if (typeof(lines[cur_line + 1].nodes[cur_depth]) !== 'undefined' &&
					lines[cur_line + 1].nodes[cur_depth] !== null) {
					j = -1;
					while (++j < lines[cur_line + 1].branch.length) {
						n_cur = lines[cur_line + 1].branch[j];
						if (n_cur.source_depth < cur_depth && cur_depth <= n_cur.height) {
							//console.log("Making space for mini red branch");
							move_everything_right_above(context, cur_line + 1, n_cur.source_depth);
						}
						if (typeof(lines[cur_line + 1]) === 'undefined' ||
							lines[cur_line + 1] === null) break;
					}
				}
				if (typeof(lines[cur_line + 1]) === 'undefined'|| lines[cur_line + 1] === null) {
					lines[cur_line + 1] = { amount: 0, branch: [], nodes: [] };
					lines.lines.push(cur_line + 1);
				}
				lines[cur_line + 1].amount++;
				lines[cur_line + 1].branch.push({ source_depth: cur_depth - 1,
					source_line: cur_line, height: cur_depth });
				depths[cur_depth].lines.push(cur_line + 1);
				node = { id: add_to_id(cur_id, b, 's'), value: b, depth: cur_depth,
					line: cur_line + 1, stamp: ++cur_stamp };
				lines[cur_line + 1].nodes[cur_depth] = node;
				data.push(node);
			}
			cur_node = lines[cur_line].nodes[cur_depth];
			if (typeof(cur_node) !== 'undefined' && cur_node !== null && cur_node.value === a) {
				cur_val = a;
				cur_id = cur_node.id;
				continue;
			}
			cur_id = add_to_id(cur_id, a, 'u');
			depths[cur_depth].lines.push(cur_line);
			cur_val = a;
			lines[cur_line].amount++;
			arr[source_index].height++;
			node = { id: cur_id, value: a, depth: cur_depth, line: cur_line, stamp: ++cur_stamp };
			lines[cur_line].nodes[cur_depth] = node;
			data.push(node);
		}
		cur_depth = node_data.depth;
		if (node_data.value === 1 || (typeof(depths[cur_depth - 3]) !== 'undefined' &&
				depths[cur_depth - 3] !== null && depths[cur_depth - 3].lines.length > 0)) {
			context.cur_stamp = cur_stamp;
			//console.log("Done expanding");
			return;
		}
		cur_depth = node_data.depth;
		cur_line = node_data.line;
		cur_id = node_data.id;
		cur_val = num;
		needed = 5;
		i = -1;
		arr = lines[cur_line].branch;
		source_index = -1;
		while (++i < arr.length) {
			cur = arr[i];
			if (cur_depth > cur.source_depth && cur_depth <= cur.height)
				source_index = i;
		}
		if (source_index === -1) throw new Error("Late failure to update context");
		while (--needed > 0) {
			cur_depth--;
			if (typeof(depths[cur_depth]) !== 'undefined' && depths[cur_depth] !== null) {
				if (arr[source_index].source_depth <= cur_depth &&
					arr[source_index].source_line !== cur_line) {
					// There's a node on this depth but not on this root
					cur_line = arr[source_index].source_line;
					i = -1;
					arr = lines[cur_line].branch;
					source_index = -1;
					while (++i < arr.length) {
						cur = arr[i];
						if (cur_depth > cur.source_depth && cur_depth <= cur.height)
							source_index = i;
					}
					if (source_index === -1) {
						//console.log(context, cur_line, cur_depth, needed, source_index, arr);
						throw new Error("Late failure to update context");
					}
				}
				cur = lines[cur_line].nodes[cur_depth];
				cur_id = cur.id;
				cur_val = cur.value;
			}
			else {
				if (typeof(depths[cur_depth]) === 'undefined' || depths[cur_depth] === null)
					depths[cur_depth] = { lines: [] };
				[a, b] = next_orbit(cur_val);
				if (b === 2) cur_id = add_to_id(cur_id, a, 'd');
				else cur_id = add_to_id(cur_id, a, 'c');
				depths[cur_depth].lines.push(cur_line);
				lines[cur_line].amount++;
				arr[source_index].source_depth--;
				node = { id: cur_id, value: a, depth: cur_depth, line: cur_line, stamp: ++cur_stamp };
				lines[0].nodes[cur_depth] = node;
				data.push(node);
				cur_val = a;
			}
			if (cur_val === 1) break;
		}
		context.cur_stamp = cur_stamp;
		//console.log("Done expanding");
	}
	d3.select("#sandbox").classed("hidden", false).style("display", "flex");
	let ma = 0, start_nums = [a, b],
		bounding = document.getElementById("sandbox").getBoundingClientRect(),
		width = bounding.width, height = bounding.height, hooked = true,
		svg = d3.select("#sandbox").append("svg").attr("width", width)
			.attr("height", height), tree = d3.tree().size([width, height - 2 * ma]),
		g = svg.append("g").attr("transform", "translate(0, " + ma / 2 + ")"),
		stratify = d3.stratify()
			.parentId(function (d) { return d.id.substring(0, d.id.lastIndexOf(".")); }),
		frac = 42, a_context = build_object(start_nums[0]),
		b_context = build_object(start_nums[1]), active_context = a_context,
		data = active_context.data, root = stratify(data), target = b;
	d3.select("#sandbox").selectAll(".tab_title")
		.data(["Finding " + target, "Press SPACE to switch to " + target])
		.enter().append("text").attr("class", "tab_title")
		.text(function(d) { return d; }).style("top", function(d, i) {
			if (i === 0) return "2%"; return ""; }).style("bottom", function(d, i) {
			if (i === 1) return "2%"; return ""; });
	let link = g.selectAll(".link")
		.data(tree(root).links(), function (d) { return d.source.id + "/" + d.target.id })
		.enter().append("path").attr("class", "link")
		.attr("d", d3.linkVertical()
			.source(function (d) {
				d.source.y = height / 2 - d.source.data.depth * frac;
				d.source.x = width / 2 + d.source.data.line * frac / 1.6;
				return [d.source.x, d.source.y];
			})
			.target(function (d) {
				d.target.y = height / 2 - d.target.data.depth * frac;
				d.target.x = width / 2 + d.target.data.line * frac / 1.6;
				return [d.target.x, d.target.y];
			}))
		.style("stroke", function (d) {
			let highlight_char = d.target.id.charAt(d.target.id.lastIndexOf('.') + 1);
			switch (highlight_char) {
				case 'u':
				case 'd':
					return "#22E";
				case 's':
				case 'c':
					return "#E22";
				case 'p':
					return "#1D1";
			}
		});
	let node = g.selectAll(".node")
		.data(root.descendants())
		.enter().append("g")
		.attr("class", function (d) {
			let out_class = "node";
			if (d.data.value === start_nums[0] || d.data.value === start_nums[1])
				out_class += " node--start";
			if (d.data.value === 1) out_class += " node--one";
			return out_class;
		})
		.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
	node.append("circle")
		.attr("r", 7)
		.attr("d", function(d) { d3.select(this).moveToFront(); return d; });
	node.append("text")
		.attr("dy", 3)
		.attr("y", function () { return 16; })
		.style("text-anchor", function() { return "middle"; })
		.text(function (d) { return d.data.value.toString(); });
	let zoom = d3.zoom();
	let zoomed = function() {
		if (d3.event.defaultPrevented) return;
		if (!hooked) return;
		g.attr("transform", d3.event.transform);
	};
	svg.call(zoom.scaleExtent([1 / 2.4, 8]).on("zoom", zoomed));
	function rebind() {
		g.selectAll(".node circle")
			.filter(function(d) {
				return (d.data.value !== a && d.data.value !== b && d.data.value !== 1);
			})
			.on("mousedown", no_zoom)
			.on("click", clicker);
		g.selectAll(".node circle")
			.filter(function(d) {
				return (d.data.value !== a && d.data.value !== b && d.data.value !== 1);
			})
			.on("mouseover", function() { d3.select(this).style("cursor", "pointer"); });
		g.selectAll(".node circle")
			.filter(function(d) {
				return (d.data.value !== a && d.data.value !== b && d.data.value !== 1);
			})
			.on("mouseout", function() { d3.select(this).style("cursor", "default"); });
	}
	let check_proof = function() {
		let i = -1;
		while (++i < data.length) {
			if (data[i].value === target) {
				setTimeout(function() {
					log_data(a, b, data[i].id);
					let end_source = null, end_target = null,
						x_coordinate = d3.zoomTransform(svg).x,
						y_coordinate = d3.zoomTransform(svg).y,
						end_trans = g.selectAll(".node").filter(function(d) {
							if (d.data.value === a && end_source === null) {
								d.x0 = width * 7 / 24;
								end_source = d;
							}
							else if (d.data.value === b && end_target === null) {
								d.x0 = width * 17 / 24;
								end_target = d;
							}
							else return false;
							d.y0 = height / 2;
							return true;
						}).transition().duration(3000)
							.attr("transform", function (d) {
								return "translate(" + d.x0 + ", " + d.y0 + ")";
							});
					g.selectAll(".node")
						.filter(function(d) { return (d !== end_source && d !== end_target); })
						.transition().duration(3000)
						.style("opacity", 0).remove();
					end_trans.select("circle")
						.attr("r", 21)
						.styleTween("fill", function() {
							return d3.interpolateHsl("#FFDF00", "#14FF14");
						});
					end_trans.select("text").attr("dy", 28)
						.styleTween("font-size", function() {
							return d3.interpolateString("12px", "25px");
						});
					let new_link = g.selectAll(".link")
						.data([{ source: end_source, target: end_target }])
						.style("stroke", "#2F2").style("opacity", 0)
						.attr("d", d3.linkHorizontal()
							.source(function (d) { return [d.source.x, d.source.y]; })
							.target(function (d) { return [d.target.x, d.target.y]; }));
					new_link.transition().duration(3000)
						.attr("d", d3.linkHorizontal()
							.source(function (d) { return [d.source.x0, d.source.y0]; })
							.target(function (d) { return [d.target.x0, d.target.y0]; }))
						.style("opacity", 1);
					new_link.exit().transition().duration(3000)
						.style("opacity", 0).remove();
					svg.transition().duration(3000).call(zoom.transform,
						d3.zoomIdentity.translate(-x_coordinate, -y_coordinate));
					d3.select("#sandbox").selectAll(".tab_title")
						.data(["Connection Successful!", "Press ESC to exit"])
						.text(function(d) { return d; });
				}, 750);
				return;
			}
		}
	};
	let no_zoom = function() { d3.event.preventDefault(); };
	function clicker(d) {
		if (d.data.value === 1) return;
		if (!hooked) return;
		this.parentNode.appendChild(this);
		d3.select(this)
			.style("pointer-events", "none")
			.transition().duration(450)
			.attrTween("stroke-width", function() { return d3.interpolateNumber(0, 3); })
			.attrTween("stroke", function(d, i) {
				this.parentNode.appendChild(this);
				let color = d3.style(d3.select(this)._groups[0][i], "fill");
				return d3.interpolateRgb(color, "black");
			});
		expand_context_at(active_context, d.data);
		data = active_context.data;
		try { root = stratify(data); }
		catch (error) {
			console.log(root, data, error);
			throw new Error("Bigger error");
		}
		let temp = g.selectAll(".link")
			.data(tree(root).links(), function (d) { return d.source.id + "/" + d.target.id });
		temp.transition().duration(450)
			.attr("d", d3.linkVertical()
				.source(function (d) {
					d.source.y = height / 2 - d.source.data.depth * frac;
					d.source.x = width / 2 + d.source.data.line * frac / 1.6;
					return [d.source.x, d.source.y];
				})
				.target(function (d) {
					d.target.y = height / 2 - d.target.data.depth * frac;
					d.target.x = width / 2 + d.target.data.line * frac / 1.6;
					return [d.target.x, d.target.y];
				}))
			.style("stroke", function (d) {
				let highlight_char = d.target.id.charAt(d.target.id.lastIndexOf('.') + 1);
				switch (highlight_char) {
					case 'u':
					case 'd':
						return "#22E";
					case 's':
					case 'c':
						return "#E22";
					case 'p':
						return "#1D1";
				}
			});
		link = temp.enter().append("path")
			.attr("class", "link")
			.attr("d", d3.linkVertical()
				.source(function (d) {
					d.source.y = height / 2 - d.source.data.depth * frac;
					d.source.x = width / 2 + d.source.data.line * frac / 1.6;
					return [d.source.x, d.source.y];
				})
				.target(function (d) {
					d.target.y = height / 2 - d.target.data.depth * frac;
					d.target.x = width / 2 + d.target.data.line * frac / 1.6;
					return [d.target.x, d.target.y];
				}))
			.style("stroke", function (d) {
				let highlight_char = d.target.id.charAt(d.target.id.lastIndexOf('.') + 1);
				switch (highlight_char) {
					case 'u':
					case 'd':
						return "#22E";
					case 's':
					case 'c':
						return "#E22";
					case 'p':
						return "#1D1";
				}
			})
			.style("stroke-opacity", 0)
			.transition().delay(150)
			.transition()
				.duration(200)
				.style("stroke-opacity", 1);
		temp = g.selectAll(".node").data(root.descendants(), function(d) { return d.id; });
		temp.transition().duration(450)
			.attr("transform", function(d) { return "translate(" + d.x + ", " + d.y + ")"; });
		temp.select("text").text(function (d) { return d.data.value.toString(); });
		node = temp.enter()
			.append("g")
			.attr("class", function (d) {
				let out_class = "node";
				if (d.data.value === start_nums[0] || d.data.value === start_nums[1])
					out_class += " node--start";
				if (d.data.value === 1) out_class += " node--one";
				return out_class;
			})
			.attr("transform", function (d) { return "translate(" + d.x + ", " + d.y + ")"; })
			.attr("d", function(d) { d3.select(this).moveToFront(); return d; });
		temp.attr("d", function(d) { d3.select(this).moveToFront(); return d; });
		node.append("circle").attr("r", 7)
			.attr("d", function(d) { d3.select(this).moveToFront(); return d; })
			.style("fill-opacity", 0)
			.transition().delay(150)
			.transition()
				.duration(200)
				.style("fill-opacity", 1);
		node.append("text")
			.attr("dy", 3)
			.attr("y", function() { return 16; })
			.style("text-anchor", function() { return "middle"; })
			.text(function (d) { return d.data.value.toString(); })
			.style("opacity", 0)
			.transition().delay(150)
			.transition()
				.duration(200)
				.style("opacity", 1);
		check_proof();
		rebind();
	}
	check_proof();
	rebind();
	d3.select("body").on("keydown", function() {
		if (d3.event.keyCode !== 32) return;
		if (!hooked) return;
		if (active_context === a_context) {
			active_context = b_context;
			target = a;
		}
		else if (active_context === b_context) {
			active_context = a_context;
			target = b;
		}
		else throw new Error("NOT LIKE I EXPECTED");
		data = active_context.data;
		root = stratify(data);
		link = g.selectAll(".link")
			.data(tree(root).links(), function (d) { return d.source.id + "/" + d.target.id })
			.attr("d", d3.linkVertical()
				.source(function (d) {
					d.source.y = height / 2 - d.source.data.depth * frac;
					d.source.x = width / 2 + d.source.data.line * frac / 1.6;
					return [d.source.x, d.source.y];
				})
				.target(function (d) {
					d.target.y = height / 2 - d.target.data.depth * frac;
					d.target.x = width / 2 + d.target.data.line * frac / 1.6;
					return [d.target.x, d.target.y];
				}))
			.style("stroke", function (d) {
				let highlight_char = d.target.id.charAt(d.target.id.lastIndexOf('.') + 1);
				switch (highlight_char) {
					case 'u':
					case 'd':
						return "#22E";
					case 's':
					case 'c':
						return "#E22";
					case 'p':
						return "#1D1";
				}
			});
		link.enter().append("path").attr("class", "link")
			.attr("d", d3.linkVertical()
				.source(function (d) {
					d.source.y = height / 2 - d.source.data.depth * frac;
					d.source.x = width / 2 + d.source.data.line * frac / 1.6;
					return [d.source.x, d.source.y];
				})
				.target(function (d) {
					d.target.y = height / 2 - d.target.data.depth * frac;
					d.target.x = width / 2 + d.target.data.line * frac / 1.6;
					return [d.target.x, d.target.y];
				}))
			.style("stroke", function (d) {
				let highlight_char = d.target.id.charAt(d.target.id.lastIndexOf('.') + 1);
				switch (highlight_char) {
					case 'u':
					case 'd':
						return "#22E";
					case 's':
					case 'c':
						return "#E22";
					case 'p':
						return "#1D1";
				}
			});
		link.exit().remove();
		node = g.selectAll(".node")
			.data(root.descendants(), function(d) { return d.id; })
			.attr("class", function(d) {
				let out_class = "node";
				if (d.data.value === start_nums[0] || d.data.value === start_nums[1])
					out_class += " node--start";
				if (d.data.value === 1) out_class += " node--one";
				return out_class;
			})
			.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
			.attr("d", function(d) { d3.select(this).moveToFront(); return d; });
		node.select("circle")
			.attr("d", function(d) { d3.select(this).moveToFront(); return d; });
		node.select("text")
			.text(function (d) { return d.data.value.toString(); });
		let node_enter = node.enter().append("g")
			.attr("class", function(d) {
				let out_class = "node";
				if (d.data.value === start_nums[0] || d.data.value === start_nums[1])
					out_class += " node--start";
				if (d.data.value === 1) out_class += " node--one";
				return out_class;
			})
			.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
		node_enter.append("circle")
			.attr("r", 7)
			.attr("d", function(d) { d3.select(this).moveToFront(); return d; });
		node_enter.append("text")
			.attr("dy", 3)
			.attr("y", function () { return 16; })
			.style("text-anchor", function() { return "middle"; })
			.text(function (d) { return d.data.value.toString(); });
		node.exit().remove();
		d3.select("#sandbox").selectAll(".tab_title")
			.data(["Finding " + target, "Press SPACE to switch to " + target])
			.text(function(d) { return d; });
		rebind();
	});
	return function() {
		g.selectAll(".node").remove();
		g.selectAll(".link").remove();
		g.selectAll(".tab_title").remove();
	};
}
