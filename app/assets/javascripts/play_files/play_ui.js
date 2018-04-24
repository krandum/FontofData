function string_to_color(str) {
	str = str.slice(1);
	return parseInt(str, 16);
}

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
	// ui.search_bar = document.getElementsByClassName('search_bar')[0];
	ui.chat_pane = document.getElementsByClassName('chat_pane')[0];
	ui.status_bar = document.getElementsByClassName('status_bar')[0];
	ui.messages = document.getElementById('messages');
	// ui.actionbar = document.getElementById('actionbar');
	// ui.buttons = ui.actionbar.children[0].children;
	// ui.prompt = document.getElementById('actionbar_prompt');
	// ui.minimap = document.getElementById('minimap');
	// ui.second_map = document.getElementById('second_map');
	ui.help_button = document.getElementById('help_button');
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
	ui.tutorial_ui_status = false;
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
		d3.selectAll('.tertiary')
			.classed(ui.faction_names[user.faction_id], true);
		// ui.actionbar.children[0].style.backgroundColor = ui.color_palette[user.faction_id].secondary;
		// ui.actionbar.children[0].style.borderColor = ui.color_palette[user.faction_id].accent;
		// ui.actionbar.children[1].style.backgroundColor = ui.color_palette[user.faction_id].highlight;
		// ui.actionbar.children[1].style.borderColor = ui.color_palette[user.faction_id].basis;
		d3.selectAll('.status_icon')
			.style('fill', ui.color_palette[user.faction_id].basis);
		d3.select('#tutorial_advance')
			.selectAll('path')
			.style('fill', ui.color_palette[user.faction_id].highlight);
	};
	ui.set_bar = function() {
		ui.status_bar.children[0].style.backgroundImage = 'url(' + user.picture + ')';
		ui.status_bar.children[0].style.backgroundRepeat = 'no-repeat';
		ui.status_bar.children[1].firstChild.appendChild(document.createTextNode(user.name));
		ui.status_bar.children[3].firstChild.appendChild(document.createTextNode(user.gems));
		ui.status_bar.children[5].firstChild.appendChild(document.createTextNode(user.resources));
	};
	ui.set_card = function(card_node) {
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
		//ui.card_spans[5].appendChild(document.createTextNode(card_node.connection_num));
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
		while (i < 3) {
			if (ui.window_container.children[i].classList.contains('hidden') == false && i !== num) {
				ui.window_container.children[i].classList.add('hidden');
			}
			i++;
		}
		i = 0;
		while (ui.window_container.children[1].children.length >= 1) {
			d3.selectAll(".connection_pane svg").remove();
			d3.selectAll(".connection_pane text").remove();
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
	ui.paper_tooltip = function(node) {
		d3.select('#local')
			.append("div").classed("tutorial_ui primary " + ui.faction_names[user.faction_id], true)
				.style("top", node.circle.position.y - (node.circle.bounds.width * .55) - 30 + "px")
				.style("left", node.circle.position.x - 85 + "px")
				.style("width", 170 + "px")
				.style("height", 30 + "px")
				.style("z-index", 10)
				.append("span").text(node.tooltip);
	}
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
				switch (e.keyCode) {
				case 27:
					ui.close_windows();
					d3.selectAll(".myForm").remove();
					break;
				case 73:
					ui.close_windows(0);
					ui.info_window.classList.toggle('hidden');
					ui.set_ui_size();
					break;
				case 81:
					ui.close_windows(2);
					ui.window_container.children[2].classList.toggle('hidden');
					ui.set_ui_size();
					break;
				}
			}
		});
		ui.help_button.addEventListener('click', function(e) {
			let hovers = d3.selectAll(".hoverable");
			if (ui.tutorial_ui_status === false) {
				ui.tutorial_ui_status = true;
				d3.select("#hotkey_help").classed("hidden", false);
				d3.select("#tutorial_help").classed("hidden", false);
				d3.select("#help_button")
					.selectAll('svg')
					.style("fill", ui.color_palette[user.faction_id].accent);
				let set_top, set_left, text;
				hovers.on("mouseenter", function() {
					let bounding = d3.event.target.getBoundingClientRect();
					switch (d3.event.target.id) {
						case 'info_pane':
							set_left = (bounding.width * .5 - 85);
							set_top = bounding.top - (bounding.height * .5);
							text = 'This is the information on the current node.';
							break;
						case 'chat_pane':
							set_left = (bounding.width * .5 - 85);
							set_top = bounding.top - (bounding.height * .5);
							text = 'Chat with your faction and discuss the game.';
							break;
						case 'key_img':
							set_left = (bounding.width * .5 - 85);
							set_top = bounding.bottom - (bounding.height * .5);
							text = 'Keys. Use these to create a new cluster.';
							break;
						case 'packet_img':
							set_left = (bounding.width * .5 - 85);
							set_top = bounding.bottom - (bounding.height * .5);
							text = 'Your data. Use it to attack and defend nodes.';
							break;
					}
					game_data.d3.space.append("div").classed("tutorial_ui primary " + ui.faction_names[user.faction_id], true)
						.style("top", set_top + "px")
						.style("left", bounding.left + set_left + "px")
						.style("width", 170 + "px")
						.style("height", 30 + "px")
						.append("span").text(text);
				});
				hovers.on("mouseleave", function() {
					d3.selectAll(".tutorial_ui").remove();
				});
			}
			else {
				ui.tutorial_ui_status = false;
				d3.select("#hotkey_help").classed("hidden", true);
				d3.select("#tutorial_help").classed("hidden", true);
				d3.select("#help_button")
					.selectAll('svg')
					.style("fill", ui.color_palette[user.faction_id].basis);
				hovers.on("mouseenter", null);
				hovers.on("mouseleave", null);
			}
		});
		d3.select("#local").on("click", function() {
			let target = d3.event.target;
			if (target.classList.contains('myInput') === false && target.classList.contains('myButton') === false
				&& target.classList.contains('myInputSubmit') === false) {
				d3.selectAll(".myForm").remove();
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
	ui.set_quests = function() {
		//dummy data
		user.quests = {
			0: 0,
			1: 1,
			2: 2
		};
		//end
		d3.selectAll(".quest_item")
			.each(function(item, i) {
				x = d3.select(this);
				x.append("h2").text('Placeholder ');
				x.append("span").text("Placeholder Placeholder Placeholder Placeholder Placeholder Placeholder Placeholder Placeholder Placeholder ");
			});
	};
	ui.init = function() {
		ui.set_colors();
		ui.set_bar();
		ui.create_listeners();
		ui.set_quests();
		ui.init_assets();
		ui.set_ui_size();
		let empty_window = { value: "", faction_id: 1, owner: "", tier: "",
			connection_num: "", function: "", worth: "", contention: "" };
		ui.set_info_window(empty_window);
	};
	ui.init();
}
