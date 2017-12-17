// # Place all the behaviors and hooks related to the matching controller here.
// # All this logic will automatically be available in application.js.
// # You can use CoffeeScript in this file: http://coffeescript.org/

$(document).on('ready page:load', function() {
	let play_check = document.getElementById('play');
	if (typeof(play_check) === 'undefined' || play_check === null) {
		console.log('aborting play.js due to no element with id play');
		return;
	}

	let scope = new paper.PaperScope();
	scope.setup("myCanvas");

	let w = scope.view.size.width / 2;
	let wl = -0.4 * w;
	let wh = 2.4 * w;
	let h = scope.view.size.height / 2;
	let hh = 2.5 * h;
	let m = Math.min(w, h);

	let game_data = {
		fov: 400,
		view_dist: 342,
		tilt: -23,
		node_factions: [],
		node_connections: [],
		active_nodes: [],
		buffer_nodes: [],
		selected_nodes: [],
		action_index: -1,
		action_name: "",
		actions: [],
		animations: [],
		icon_data: {},
		icons: {},
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
				glow: '#000000',
				background: '#C0C0C0'
			},
			2: { // Red Rocks
				line: '#e52d00',
				num: '#e52d00',
				fill: '#faf9f9',
				selected: '#ff8300',
				glow: '#ff8300',
				background: '#E5522D'
			},
			3: { // Green Elves
				line: '#3eb200',
				num: '#3eb200',
				fill: '#ffffd8',
				selected: '#40ed4b',
				glow: '#40ed4b',
				background: '#5AE25F'
			},
			4: { // Blue Jellyfish
				line: '#2188dd',
				num: '#2188dd',
				fill: '#C9f0ff',
				selected: '#9428ab',
				glow: '#9428ab',
				background: '#3B94DD'
			}
		},
		background: {},
		framework: [],
		user_info: userinfo,
		user_interface: {},
		global_root: null,
		old_root: null,
		date: new Date(),
		card_set: false
	};

	let g_theta = game_data.tilt * Math.PI / 180;

	App.game = App.cable.subscriptions.create("GameChannel", {
		connected: function() {
			// Called when the subscription is ready for use on the server
		},

		disconnected: function() {
			// Called when the subscription has been terminated by the server
		},

		received: function(data) {
			// Called when there's incoming data on the websocket for this channel
			if (data['function_call'] == 'take_action') {
				take_action(data);
			}
			if (data['function_call'] == 'bla') {
				console.log("eyy");
			}
			else
				console.log("invalid call");
		}
	});

	function make_ui() {
		let user = game_data.user_info;
		let ui = game_data.user_interface;
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
				basis: '#2D0505',
				accent: '#FF8300',
				highlight: '#FAF9F9'
			},
			3: {//Elves
				primary: '#588401',
				secondary: '#005e16',
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
		ui.faction_names = {
			0: '',
			1: 'Neutral',
			2: 'Rocks',
			3: 'Elves',
			4: 'Jellyfish'
		};
		ui.asset_paths = {
			0: '',
			1: 'assets/neutral/',
			2: 'assets/red/',
			3: 'assets/green/',
			4: 'assets/blue/'
		};
		ui.card = document.getElementById('info_pane');
		// ui.search_bar = document.getElementsByClassName('search_bar')[0];
		ui.chat_pane = document.getElementsByClassName('chat_pane')[0];
		ui.status_bar = document.getElementsByClassName('status_bar')[0];
		ui.messages = document.getElementById('messages');
		// ui.actionbar = document.getElementById('actionbar');
		// ui.buttons = ui.actionbar.children[0].children;
		// ui.prompt = document.getElementById('actionbar_prompt');
		// ui.minimap = document.getElementById('minimap');
		// ui.second_map = document.getElementById('second_map');
		ui.window_container = document.getElementById('window_container');
		ui.exit_buttons = document.getElementsByClassName('window_exit_button');
		ui.info_window = ui.window_container.children[0];
		ui.info_elems = {
			assign_names: {
				0: 'Core Node',
				1: 'Gather Node',
				2: 'Offense Node',
				3: 'Defense Node'
			},
			faction_icons: ui.info_window.children[2].children,
			assign_icons: ui.info_window.children[3].children,
			node_icon_holder: document.getElementById('node_icon_holder'),
			combat_pane: document.getElementById('info_combat_pane'),
			cluster_pane: document.getElementById('info_cluster_pane'),
			captions: document.getElementsByClassName('caption_recolor'),
			spans: {
				1: document.getElementById('owner_field'),
				2: document.getElementById('cluster_field'),
				3: document.getElementById('time_owned_field'),
				4: document.getElementById('tier_field'),
				5: document.getElementById('assignment_field'),
				6: document.getElementById('info_node_name')
			}
		};
		function hex_to_rgba(hex, alpha) {
			let r = parseInt(hex.slice(1, 3), 16),
			g = parseInt(hex.slice(3, 5), 16),
			b = parseInt(hex.slice(5, 7), 16);

			if (alpha) {
				return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
			} else {
				return "rgb(" + r + ", " + g + ", " + b + ")";
			}
		}
		ui.set_ui_size = function() {
			let i = 0;
			// let width = Math.min(parseInt(ui.actionbar.clientWidth / 7 * .95) - 2, parseInt(ui.actionbar.children[0].clientHeight * .95));
			// while (i < 7) {
			// 	ui.buttons[i].style.height = width + 'px';
			// 	ui.buttons[i].style.width = width + 'px';
			// 	i++;
			// }
			i = -1;
			ui.info_elems.assign_icons[12].style.width = ui.info_elems.assign_icons[12].clientHeight + 8 + 'px';
			while (++i < 12) {
				ui.info_elems.assign_icons[i].style.width = ui.info_elems.assign_icons[12].clientHeight + 8 + 'px';
				ui.info_elems.assign_icons[i].style.height = ui.info_elems.assign_icons[12].clientHeight + 8 + 'px';
			}
			i = -1;
			while (++i < 4) {
				ui.info_elems.faction_icons[i].style.width = ui.info_elems.assign_icons[12].clientHeight + 8 + 'px';
				ui.info_elems.faction_icons[i].style.height = ui.info_elems.assign_icons[12].clientHeight + 8 + 'px';
			}
			ui.info_window.children[1].children[0].style.width = ui.info_window.children[1].children[0].clientHeight + 8 + 'px';
			// ui.prompt.style.fontSize = parseFloat(ui.prompt.clientHeight * .6 / 10).toFixed(1) + 'rem';
			// ui.minimap.style.height = ui.minimap.clientWidth + 'px';
			// ui.second_map.style.height = ui.second_map.clientWidth +'px';
		};
		ui.init_assets = function() {
			let fac_i = 0;
			while (++fac_i < 4) {
				ui.info_elems.assign_icons[0 + (4 * (fac_i - 1))].style.backgroundImage = 'url(' + ui.asset_paths[fac_i + 1] + '/icons/role_core.svg)';
				ui.info_elems.assign_icons[1 + (4 * (fac_i - 1))].style.backgroundImage = 'url(' + ui.asset_paths[fac_i + 1] + '/icons/role_gather.svg)';
				ui.info_elems.assign_icons[2 + (4 * (fac_i - 1))].style.backgroundImage = 'url(' + ui.asset_paths[fac_i + 1] + '/icons/role_attack.svg)';
				ui.info_elems.assign_icons[3 + (4 * (fac_i - 1))].style.backgroundImage = 'url(' + ui.asset_paths[fac_i + 1] + '/icons/role_defend.svg)';
			}
			// ui.buttons[0].children[0].style.backgroundImage = 'url(' + ui.asset_paths[user.faction_id] + '/icons/orbit_forward.svg)';
			// ui.buttons[1].children[0].style.backgroundImage = 'url(' + ui.asset_paths[user.faction_id] + '/icons/orbit_backward.svg)';
			// ui.buttons[2].children[0].style.backgroundImage = 'url(' + ui.asset_paths[user.faction_id] + '/icons/044-goto.svg)';
			// ui.buttons[3].children[0].style.backgroundImage = 'url(' + ui.asset_paths[user.faction_id] + '/icons/placeholder.svg)';
			// ui.buttons[4].children[0].style.backgroundImage = 'url(' + ui.asset_paths[user.faction_id] + '/icons/043-connect.svg)';
			// ui.buttons[5].children[0].style.backgroundImage = 'url(' + ui.asset_paths[user.faction_id] + '/icons/045-orbit.svg)';
			// ui.buttons[6].children[0].style.backgroundImage = 'url(' + ui.asset_paths[user.faction_id] + '/icons/035-sign.svg)';
			// ui.buttons[0].style.borderColor = ui.color_palette[user.faction_id].basis;
			// ui.buttons[1].style.borderColor = ui.color_palette[user.faction_id].basis;
			// ui.buttons[2].style.borderColor = ui.color_palette[user.faction_id].basis;
			// ui.buttons[3].style.borderColor = ui.color_palette[user.faction_id].basis;
			// ui.buttons[4].style.borderColor = ui.color_palette[user.faction_id].basis;
			// ui.buttons[5].style.borderColor = ui.color_palette[user.faction_id].basis;
			// ui.buttons[6].style.borderColor = ui.color_palette[user.faction_id].basis;
			ui.set_ui_size();
		};
		ui.set_colors = function() {
			d3.selectAll('.primary')
				.classed(ui.faction_names[user.faction_id], true);
			d3.selectAll('.secondary')
				.classed(ui.faction_names[user.faction_id], true);
			// ui.actionbar.children[0].style.backgroundColor = ui.color_palette[user.faction_id].secondary;
			// ui.actionbar.children[0].style.borderColor = ui.color_palette[user.faction_id].accent;
			// ui.actionbar.children[1].style.backgroundColor = ui.color_palette[user.faction_id].highlight;
			// ui.actionbar.children[1].style.borderColor = ui.color_palette[user.faction_id].basis;
			d3.selectAll('.status_icon')
				.style('fill', ui.color_palette[user.faction_id].basis);
		};
		ui.set_bar = function() {
			ui.status_bar.children[0].style.backgroundImage = 'url(' + user.picture + ')';
			ui.status_bar.children[0].style.backgroundRepeat = 'no-repeat';
			ui.status_bar.children[1].firstChild.appendChild(document.createTextNode(user.name));
			ui.status_bar.children[3].firstChild.appendChild(document.createTextNode(user.gem_placeholder));
			ui.status_bar.children[5].firstChild.appendChild(document.createTextNode(user.resources));
		};
		ui.set_card = function(card_node) {
			ui.card_spans = {
				1: document.getElementById('node_number'),
				2: document.getElementById('node_owner'),
				3: document.getElementById('node_tier'),
				4: document.getElementById('node_function'),
				5: document.getElementById('node_connections'),
				6: document.getElementById('node_value'),
				7: document.getElementById('node_contention'),
				8: document.getElementById('faction_name'),
				9: document.getElementsByClassName('faction_icon')
			};
			let span_num = 0;
			while (++span_num < 9) {
				let cur_span = ui.card_spans[span_num];
				while (cur_span.firstChild) {
					cur_span.removeChild(cur_span.firstChild);
				}
			}
			ui.card_spans[1].appendChild(document.createTextNode(card_node.value));
			ui.card_spans[2].appendChild(document.createTextNode(card_node.owner));
			ui.card_spans[3].appendChild(document.createTextNode(card_node.tier));
			ui.card_spans[4].appendChild(document.createTextNode(card_node.function));
			ui.card_spans[5].appendChild(document.createTextNode(card_node.connection_num));
			ui.card_spans[6].appendChild(document.createTextNode(card_node.worth));
			ui.card_spans[7].appendChild(document.createTextNode(card_node.contention));
			ui.card_spans[8].appendChild(document.createTextNode(ui.faction_names[card_node.faction_id]));
			ui.card_spans[9][0].style.display = 'none';
			ui.card_spans[9][0].style.borderColor = ui.color_palette[user.faction_id].accent;
			ui.card_spans[9][1].style.display = 'none';
			ui.card_spans[9][1].style.borderColor = ui.color_palette[user.faction_id].accent;
			ui.card_spans[9][2].style.display = 'none';
			ui.card_spans[9][2].style.borderColor = ui.color_palette[user.faction_id].accent;
			ui.card_spans[9][3].style.display = 'none';
			ui.card_spans[9][3].style.borderColor = ui.color_palette[user.faction_id].accent;
			if (card_node.faction_id !== 0) {
				ui.card_spans[9][card_node.faction_id - 1].style.display = 'block';
			}
		};
		ui.set_info_window = function(node) {
			let i = -1;
			while (++i < ui.info_elems.captions.length) {
				ui.info_elems.captions[i].style.color = ui.color_palette[node.faction_id].accent;
			}
			i = 0;
			while (++i < 7) {
				let cur_span = ui.info_elems.spans[i];
				while (cur_span.firstChild) {
					cur_span.removeChild(cur_span.firstChild);
				}
			}
			i = -1;
			while (++i < 12) {
				if (ui.info_elems.assign_icons[i].classList.contains('hidden') == false) {
					ui.info_elems.assign_icons[i].classList.add('hidden');
				}
			}
			i = -1;
			while (++i < 4) {
				if (ui.info_elems.faction_icons[i].classList.contains('hidden') == false) {
					ui.info_elems.faction_icons[i].classList.add('hidden');
				}
			}
			ui.info_elems.faction_icons[node.faction_id - 1].classList.toggle('hidden');
			ui.info_window.style.backgroundColor = ui.color_palette[node.faction_id].basis;
			ui.info_window.style.borderColor = ui.color_palette[node.faction_id].accent;
			ui.info_window.style.color = ui.color_palette[node.faction_id].highlight;
			ui.info_elems.node_icon_holder.style.borderColor = ui.color_palette[node.faction_id].accent;
			ui.info_elems.node_icon_holder.style.backgroundColor = ui.color_palette[node.faction_id].highlight;
			ui.info_elems.node_icon_holder.style.color = ui.color_palette[node.faction_id].primary;
			ui.info_elems.combat_pane.style.backgroundColor = ui.color_palette[node.faction_id].primary;
			ui.info_elems.combat_pane.style.borderColor = ui.color_palette[node.faction_id].accent;
			ui.info_elems.cluster_pane.style.backgroundColor = ui.color_palette[node.faction_id].primary;
			ui.info_elems.cluster_pane.style.borderColor = ui.color_palette[node.faction_id].accent;
			ui.info_elems.assign_icons[12].style.borderColor = ui.color_palette[node.faction_id].accent;
			if (node.assignment >= 0) {
				ui.info_elems.assign_icons[4 * (node.faction_id - 1) - 4 + node.assignment].classList.toggle('hidden');
			}
			ui.info_elems.spans[6].style.color = ui.color_palette[node.faction_id].accent;
			ui.info_elems.spans[1].appendChild(document.createTextNode(node.owner));
			ui.info_elems.spans[2].appendChild(document.createTextNode(node.cluster));
			// ui.info_elems.spans[3].appendChild(document.createTextNode(node.time_owned));
			ui.info_elems.spans[4].appendChild(document.createTextNode('Tier ' + node.tier));
			ui.info_elems.spans[5].appendChild(document.createTextNode(ui.info_elems.assign_names[node.assignment]));
			ui.info_elems.spans[6].appendChild(document.createTextNode(node.value));
		};
		ui.close_windows = function(num) {
			let i = 0;
			while (i < 2) {
				if (ui.window_container.children[i].classList.contains('hidden') == false && i !== num) {
					ui.window_container.children[i].classList.add('hidden');
				}
				i++;
			}
		};
		// ui.show_prompt = function(text) {
		// 	return function() {
		// 		ui.prompt.firstChild.appendChild(document.createTextNode(text));
		// 	}
		// }
		// ui.clear_prompt = function() {
		// 	ui.prompt.firstChild.removeChild(ui.prompt.firstChild.firstChild);
		// }
		ui.create_listeners = function() {
			window.addEventListener("resize", function(e) {
				ui.set_ui_size();
			});
			// window.addEventListener('mousemove', function(e) {
			// 	let x = e.clientX;
			// 	let y = e.clientY;
			// 	ui.tooltip.style.top = (y + 10) + 'px';
			// 	ui.tooltip.style.left = (x - 35) + 'px';
			// });
			window.addEventListener('keydown', function(e) {
				if (document.activeElement.type !== 'textarea') {
					if (e.keyCode === 27) {
						ui.close_windows();
					}
					if (e.keyCode === 73) {
						ui.close_windows(0);
						ui.info_window.classList.toggle('hidden');
						ui.set_ui_size();
					}
					if (e.keyCode === 67) {
						ui.close_windows(1);
						ui.window_container.children[1].classList.toggle('hidden');
						ui.set_ui_size();
					}
				}
			});
			// ui.buttons[0].addEventListener('click', function(e) {
			// 	//placeholder orbit back
			// });
			// ui.buttons[0].addEventListener('mouseenter', ui.show_prompt('Move back one Node.'));
			// ui.buttons[0].addEventListener('mouseleave', ui.clear_prompt);
			// ui.buttons[1].addEventListener('click', function(e) {
			// 	//placeholder popup
			// });
			// ui.buttons[1].addEventListener('mouseenter', ui.show_prompt('Move forward one Node.'));
			// ui.buttons[1].addEventListener('mouseleave', ui.clear_prompt);
			// ui.buttons[2].addEventListener('click', function(e) {
			// 	//placeholder assignment screen
			// });
			// ui.buttons[2].addEventListener('mouseenter', ui.show_prompt('Assignment window. (A)'));
			// ui.buttons[2].addEventListener('mouseleave', ui.clear_prompt);
			// ui.buttons[3].addEventListener('click', function(e) {
			// 	ui.actionbar.children[8].classList.toggle("hidden");
			// });
			// ui.buttons[3].addEventListener('mouseenter', ui.show_prompt('Invest in this Node.'));
			// ui.buttons[3].addEventListener('mouseleave', ui.clear_prompt);
			// ui.buttons[4].addEventListener('click', function(e) {
			// 	ui.close_windows(0);
			// 	ui.info_window.classList.toggle('hidden');
			// 	ui.set_ui_size();
			// });
			// ui.buttons[4].addEventListener('mouseenter', ui.show_prompt('Link to another Node'));
			// ui.buttons[4].addEventListener('mouseleave', ui.clear_prompt);
			// ui.buttons[5].addEventListener('click', function(e) {
			// 	//placeholder connections?
			// });
			// ui.buttons[5].addEventListener('mouseenter', ui.show_prompt('Connections window.'));
			// ui.buttons[5].addEventListener('mouseleave', ui.clear_prompt);
			// ui.buttons[6].addEventListener('click', function(e) {
			// 	ui.close_windows(0);
			// 	ui.info_window.classList.toggle('hidden');
			// 	ui.set_ui_size();
			// });
			// ui.buttons[6].addEventListener('mouseenter', ui.show_prompt('Show Node info. (I)'));
			// ui.buttons[6].addEventListener('mouseleave', ui.clear_prompt);
			ui.exit_buttons[0].addEventListener('click', function(e) {
				ui.exit_buttons[0].parentNode.classList.add('hidden');
			});
		};
		ui.init = function() {
			ui.set_colors();
			ui.set_bar();
			ui.create_listeners();
			ui.init_assets();
			ui.set_ui_size();
		};
		ui.init();
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

	function string_to_color(str) {
		str = str.slice(1);
		return parseInt(str, 16);
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

	let ca = Math.cos(g_theta);
	let sa = Math.sin(g_theta);
	let d = game_data.view_dist;
	let f = game_data.fov;

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

	// function mouseDown(e) {
	// 	if (parseInt(navigator.appVersion) > 3) {
	// 		let evt = e ? e : window.event;
	// 		let delta = evt.wheelDelta ? evt.wheelDelta / 120
	// 			: evt.detail ? -evt.detail : 0;
	// 		/* For canvas scrolling */
	// 		if (delta > 0) { // Scroll up
	// 			console.log("Scrolling up");
	// 		} else { // Scroll down
	// 			console.log("Scrolling down");
	// 		}
	// 	}
	// 	return true;
	// }

	function select_node(target) {
		if (target.moving) return;
		let node_color = game_data.colors[game_data.node_factions[target.value].toString()];
		let quarter_size = target.relative_pos.size_dy * scope.view.size.height / 4;
		target.circle.shadowColor = node_color['glow'];
		target.circle.shadowBlur = quarter_size;
		target.circle.strokeColor = node_color['selected'];
		if (target.node) target.number.fillColor = node_color['selected'];
		else target.image.fillColor = node_color['selected'];
		target.selected = true;
		grow_node(target);
	}

	function unselect_node(target) {
		if (target.moving) return;
		let node_color = game_data.colors[game_data.node_factions[target.value].toString()];
		target.circle.shadowColor = 0;
		target.circle.shadowBlur = 0;
		target.circle.strokeColor = node_color['line'];
		if (target.node) target.number.fillColor = node_color['num'];
		else target.image.fillColor = node_color['num'];
		target.selected = false;
		let empty_window = { value: "", faction_id: 1, owner: "", tier: "",
			connection_num: "", function: "", worth: "", contention: "" };
		game_data.user_interface.set_info_window(empty_window)
		ungrow_node(target);
	}

	function grow_node(target) {
		if (target.node) {
			if (!game_data.card_set) game_data.card_set = true;
			game_data.user_interface.set_card(target);
		}
		if (target.moving) return;
		if (!target.grown && (target.selected || target.hovered)) {
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
				while (++i < 64) {
					game_data.node_factions[i] = in_nodes[i]['faction_id'];
					game_data.node_connections[i] = {
						dad: in_nodes[i]['dad'],
						bro: in_nodes[i]['bro']
					};
				}
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
					if (game_data.active_nodes[i].faction_id == 1) {
						game_data.active_nodes[i].assignment = -1;
					}
					else {
						game_data.active_nodes[i].assignment = 3;
					}
					game_data.active_nodes[i].speed = 32;
					game_data.active_nodes[i].friction = 46;
					//end dummy data
					if (game_data.active_nodes[i].owner === null)
						game_data.active_nodes[i].owner = 'unclaimed';
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
							if (game_data.active_nodes[k].faction_id == 1) {
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

	function tug_of_war(line, ratio, start_faction, end_faction) {
		let start = new scope.Point(line.firstSegment.point),
			end = new scope.Point(line.lastSegment.point),
			dx = Math.abs(start.x - end.x), dy = Math.abs(start.y - end.y),
			refx = Math.min(start.x, end.x), refy = Math.min(start.y, end.y),
			mid = new scope.Point(refx + dx * ratio, refy + dy * ratio),
			thick = line.strokeWidth;
		line.remove();
		let first = new scope.Path.Line(start, mid);
		first.strokeWidth = thick;
		first.strokeColor = game_data.colors[start_faction.toString()].line;
		let second= new scope.Path.Line(mid, end);
		second.strokeWidth = thick;
		second.strokeColor = game_data.colors[end_faction.toString()].line;
		line = new scope.Group(first, second);
		return line;
	}

	function show_parent(parent, son) {
		let from = new scope.Point(parent.circle.position.x, parent.circle.position.y);
		let to = new scope.Point(son.circle.position.x, son.circle.position.y);
		let connection = new scope.Path.Line(from, to);
		shorten_line(connection, parent.rad * 1.2, son.rad * 0.7);
		connection.strokeWidth = (parent.circle.strokeWidth + son.circle.strokeWidth) / 2;
		if (game_data.node_factions[parent.value] === game_data.node_factions[son.value]) {
			let colors = game_data.colors[game_data.node_factions[parent.value].toString()];
			connection.strokeColor = colors.line;
		}
		else {
			connection = tug_of_war(connection, 0.5, game_data.node_factions[parent.value],
				game_data.node_factions[son.value]);
		}
		return connection;
	}

	function show_brother(brother, sis) {
		let from = new scope.Point(brother.circle.position.x, brother.circle.position.y);
		let to = new scope.Point(sis.circle.position.x, sis.circle.position.y);
		let connection = new scope.Path.Line(from, to);
		shorten_line(connection, brother.rad * 1.2, sis.rad * 1.2);
		connection.strokeWidth = (brother.circle.strokeWidth + sis.circle.strokeWidth) / 2;
		if (game_data.node_factions[brother.value] === game_data.node_factions[sis.value]) {
			let colors = game_data.colors[game_data.node_factions[brother.value].toString()];
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
		let connection_dad = null, connection_bro = null, j;
		if (target.connection_values.dad !== null) {
			let dad = null;
			j = -1;
			while (++j < game_data.active_nodes.length)
				if (game_data.active_nodes[j].value === target.connection_values.dad) {
					dad = game_data.active_nodes[j];
					break;
				}
			if (dad !== null) connection_dad = show_parent(dad, target);
		}
		if (target.connection_values.bro !== null) {
			let bro = null;
			j = -1;
			while (++j < game_data.active_nodes.length)
				if (game_data.active_nodes[j].value === target.connection_values.bro) {
					bro = game_data.active_nodes[j];
					break;
				}
			if (bro !== null) connection_bro = show_brother(bro, target);
		}
		target.connections = new scope.Group(connection_dad, connection_bro);
	}

	function hide_connections(target) {
		target.connections.remove();
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

		let leftie = elem % 2 !== 0;

		let total_node = {
			value: elem,
			position: elem,
			group: out_node,
			circle: basis,
			number: num,
			rad: half_size,
			relative_pos: relative_pos,
			popped: false,
			popper: false,
			connection_values: { dad: parent, bro: brother },
			connection_num: null,
			connections: null,
			faction_id: null,
			owner: null,
			tier: null,
			worth: null,
			contention: null,
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

		out_node.onMouseEnter = function() {
			if (total_node.moving) return;
			total_node.hovered = true;
			set_fraction(total_node);
			grow_node(total_node);
		};

		out_node.onMouseLeave = function() {
			if (total_node.moving) return;
			total_node.hovered = false;
			set_fraction(total_node);
			ungrow_node(total_node);
		};

		out_node.onClick = function() {
			if (total_node.moving) return;
			check_selection(total_node);
		};

		return total_node;
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
			game_data.buffer_nodes[0].move_target = game_data.active_nodes[relocs[i] - 1].relative_pos;
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
			game_data.buffer_nodes[0].move_target = game_data.active_nodes[
				relocs[i].value - 1].relative_pos;
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
		let width = scope.view.size.width;
		let height = scope.view.size.height;
		let i = -1;
		let prev_pos = game_data.old_root.circle.position;
		while (++i < game_data.active_nodes.length) {
			let cur_node = game_data.active_nodes[i];
			cur_node.popped = false;
			cur_node.circle.position.x = cur_node.move_target.x * width;
			cur_node.circle.position.y = cur_node.move_target.y * height;
			cur_node.circle.bounds.width = cur_node.move_target.size_dx * height;
			cur_node.circle.bounds.height = cur_node.move_target.size_dy * height;
			cur_node.value = cur_node.move_value;
			let leftie = cur_node.value % 2 !== 0;
			if (leftie !== cur_node.left_pointed) {
				cur_node.left_pointed = leftie;
				cur_node.circle.scale(-1, 1);
			}
			let node_color = game_data.colors[game_data.node_factions[cur_node.value].toString()];
			let num_digits = cur_node.value.toString().length;
			cur_node.relative_pos = cur_node.move_target;
			cur_node.base = null;
			cur_node.rad = cur_node.circle.bounds.width / 2;
			cur_node.number.content = cur_node.value;
			cur_node.moving = false;
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
			options.move.image.strokeWidth = 1;
			options.move.image.strokeColor = colors['num'];
			game_data.actions.push(options.move);
			options.move.group.onMouseEnter = function() {
				options.move.hovered = true;
				set_fraction(options.move);
				grow_node(options.move);
			};
			options.move.group.onMouseLeave = function() {
				options.move.hovered = false;
				set_fraction(options.move);
				ungrow_node(options.move);
			};
			options.move.group.onClick = function() {
				game_data.action_index = -1;
				remove_options(target);
				unselect_node(target);
				let index = game_data.selected_nodes.indexOf(target);
				game_data.selected_nodes.splice(index, 1);
				if (target === game_data.global_root) move_back(1);
				else move_to(target);
			};
		}
		theta = Math.PI / 2;
		options.attack = make_option_group(target.circle.position, small_rad, big_rad,
			theta, colors, ref_stroke_width / 2, 'attack', target.value);
		theta = 2 * Math.PI / 3;
		options.connect = make_option_group(target.circle.position, small_rad, big_rad,
			theta, colors, ref_stroke_width / 2, 'connect', target.value);
		theta = Math.PI / 3;
		options.node_info = make_option_group(target.circle.position, small_rad, big_rad,
			theta, colors, ref_stroke_width / 2, 'node_info', target.value);
		game_data.actions.push(options.attack);
		game_data.actions.push(options.connect);
		options.attack.group.onMouseEnter = function() {
			options.attack.hovered = true;
			set_fraction(options.attack);
			grow_node(options.attack);
		};
		options.attack.group.onMouseLeave = function() {
			options.attack.hovered = false;
			set_fraction(options.attack);
			ungrow_node(options.attack);
		};
		options.attack.group.onClick = function() {
			set_fraction(options.attack);
			select_action(options.attack);
		};
		options.connect.group.onMouseEnter = function() {
			options.connect.hovered = true;
			set_fraction(options.connect);
			grow_node(options.connect);
		};
		options.connect.group.onMouseLeave = function() {
			options.connect.hovered = false;
			set_fraction(options.connect);
			ungrow_node(options.connect);
		};
		options.connect.group.onClick = function() {
			set_fraction(options.connect);
			select_action(options.connect);
		};
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
			select_node(target);
			if (game_data.selected_nodes.length >= 1 && game_data.action_index !== -1) {
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
				game_data.user_interface.set_info_window(target);
				game_data.selected_nodes[0] = target;
				add_options(game_data.selected_nodes[0]);
			}
			else {
				game_data.selected_nodes.push(target);
				game_data.user_interface.set_info_window(target);
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

	d3.selection.prototype.moveToFront = function() {
		return this.each(function(){
			this.parentNode.appendChild(this);
		})
	};

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
		let out = [], cur_val = num, cur_id = add_to_id(null, num, 'b'), a, b,
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
		out.push(node);
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
				out.push(node);
			}
			cur_id = add_to_id(cur_id, a, 'u');
			node = { id: cur_id, value: a, depth: cur_depth, line: 0, stamp: ++cur_stamp };
			line_counts[0].nodes[cur_depth] = node;
			out.push(node);
			depth_counts[cur_depth].lines.push(0);
			cur_val = a;
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
			out.push(node);
			cur_val = a;
		}
		out.columns = ["id", "value", "depth", "line", "stamp"];
		return { data: out, line_counts: line_counts, depth_counts: depth_counts,
			cur_stamp: cur_stamp };
	}

	function move_everything_above(context, line, depth) {
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
				if (cur_branch.source_depth > depth && cur_branch.source_line === line) {
					avoid_arr.push(cur_branch);
					move_everything_above(context, arr.lines[i], cur_branch.source_depth);
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
							move_everything_above(context, next, cur_branch.source_depth);
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
					move_everything_above(context, cur_line, cur_depth - 1);
				}
				else if (cur_node.value !== a) {
					move_everything_above(context, cur_line, arr[source_index].source_depth);
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
						if (n_cur.source_depth < cur_depth && cur_depth <= n_cur.height)
							move_everything_above(context, cur_line + 1, n_cur.source_depth);
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
			console.log(context);
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
					cur_line = arr[source_index].source_line;
					i = -1;
					arr = lines[cur_line].branch;
					source_index = -1;
					while (++i < arr.length) {
						cur = arr[i];
						if (cur_depth > cur.source_depth && cur_depth <= cur.height)
							source_index = i;
					}
					if (source_index === -1) throw new Error("Late failure to update context");
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
	}

	function log_data(a, b, path) {
	}

	function setup_connection(a, b) {
		let ma = 0, start_nums = [a, b],
			bounding = document.getElementById("sandbox").getBoundingClientRect(),
			width = bounding.width, height = bounding.height, hooked = true,
			svg = d3.select("#sandbox").append("svg")
				.attr("width", width).attr("height", height),
			tree = d3.tree().size([width, height - 2 * ma]),
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
					d.source.x = width / 2 + d.source.data.line * frac;
					return [d.source.x, d.source.y];
				})
				.target(function (d) {
					d.target.y = height / 2 - d.target.data.depth * frac;
					d.target.x = width / 2 + d.target.data.line * frac;
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
						d.source.x = width / 2 + d.source.data.line * frac;
						return [d.source.x, d.source.y];
					})
					.target(function (d) {
						d.target.y = height / 2 - d.target.data.depth * frac;
						d.target.x = width / 2 + d.target.data.line * frac;
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
					}
				});
			link = temp.enter().append("path")
				.attr("class", "link")
				.attr("d", d3.linkVertical()
					.source(function (d) {
						d.source.y = height / 2 - d.source.data.depth * frac;
						d.source.x = width / 2 + d.source.data.line * frac;
						return [d.source.x, d.source.y];
					})
					.target(function (d) {
						d.target.y = height / 2 - d.target.data.depth * frac;
						d.target.x = width / 2 + d.target.data.line * frac;
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
			let i = -1;
			while (++i < data.length) {
				if (data[i].value === target) {
					setTimeout(function() {
						log_data(a, b, data[i].id);
						g.selectAll(".node")
							.filter(function(d) { return (d.data.value !== a && d.data.value !== b); })
							.transition().duration(3000)
							.style("opacity", 0).remove();
						let end_source = null, end_target = null,
							x_coordinate = d3.zoomTransform(svg).x,
							y_coordinate = d3.zoomTransform(svg).y,
							end_trans = g.selectAll(".node").filter(function(d) {
								if (d.data.value === a) {
									d.x0 = width * 7 / 24;
									end_source = d;
								}
								else if (d.data.value === b) {
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
						hooked = false;
					}, 750);
					return;
				}
			}
			rebind();
		}
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
						d.source.x = width / 2 + d.source.data.line * frac;
						return [d.source.x, d.source.y];
					})
					.target(function (d) {
						d.target.y = height / 2 - d.target.data.depth * frac;
						d.target.x = width / 2 + d.target.data.line * frac;
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
					}
				});
			link.enter().append("path").attr("class", "link")
				.attr("d", d3.linkVertical()
					.source(function (d) {
						d.source.y = height / 2 - d.source.data.depth * frac;
						d.source.x = width / 2 + d.source.data.line * frac;
						return [d.source.x, d.source.y];
					})
					.target(function (d) {
						d.target.y = height / 2 - d.target.data.depth * frac;
						d.target.x = width / 2 + d.target.data.line * frac;
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

	// function init() {
	// 	get_initial_node_data();
	// 	set_resize();
	// 	set_assets();
	// 	make_ui();
	// 	make_background();
	// 	scope.view.onFrame = function(event) {
	// 		tick(event);
	// 	};
	// }

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
		console.log("Setting up Connection Sandbox");
		setup_connection(44, 45);
		console.log("Canvas resize set up");
		scope.view.onFrame = function(event) {
			tick(event);
		};
		console.log("Ticking now...");
	}
	init_debug();

});
