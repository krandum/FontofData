// # Place all the behaviors and hooks related to the matching controller here.
// # All this logic will automatically be available in application.js.
// # You can use CoffeeScript in this file: http://coffeescript.org/

//= require_self
//= require play_files/play_initialize
//= require play_files/play_ui
//= require play_files/play_background
//= require play_files/play_nodes
//= require play_files/play_connections
//= require play_files/play_movement
//= require play_files/play_buttons
//= require play_files/play_proofs
//= require play_files/play_tutorial

function add_value(data, from_value, to_value) {
	console.log("Adding value");
	console.log(data, from_value, to_value);
	App.game.perform('connection_add_worth', {
		head: parseInt(from_value),
		tail: parseInt(to_value),
		resources: parseInt(data)
	});
	d3.selectAll(".myForm").remove();
}
let scope, w, wl, wh, h, hh, m, g_theta, ca, sa, d, f;
let game_data = {
	fov: 400, view_dist: 342, tilt: -23, node_factions: [], node_connections: [],
	active_nodes: [], buffer_nodes: [], selected_nodes: [], action_index: -1,
	action_name: "", actions: [], animations: [], icon_data: {}, icons: {},
	colors: {
		0: { /*Background*/ light: [61, 196, 255], dark: [35, 82, 175] },
		1: { // Neutral
			line: '#000000', num: '#000000',
			fill: '#cecece', selected: '#000000',
			glow: '#000000', background: '#C0C0C0'
		},
		2: { // Red Rocks
			line: '#e52d00', num: '#e52d00',
			fill: '#faf9f9', selected: '#ff8300',
			glow: '#ff8300', background: '#E5522D'
		},
		3: { // Green Elves
			line: '#3eb200', num: '#3eb200',
			fill: '#ffffd8', selected: '#40ed4b',
			glow: '#40ed4b', background: '#5AE25F'
		},
		4: { // Blue Jellyfish
			line: '#2188dd', num: '#2188dd',
			fill: '#C9f0ff', selected: '#9428ab',
			glow: '#9428ab', background: '#3B94DD'
		}
	},
	background: {}, framework: [], user_info: null, user_interface: {},
	global_root: null, old_root: null, date: new Date(), card_set: false,
	positions: [], proved: null, cur_dosh: null, dosh_gain: null, dosh_buff: 0
};
$(document).on('ready page:load', function() {
	let play_check = document.getElementById('play');
	if (typeof(play_check) === 'undefined' || play_check === null) {
		console.log('aborting play.js due to no element with id play');
		return;
	}
	game_data.user_info = userinfo;
	game_data.proved = format_proved(userinfo.proved);
	game_data.cur_dosh = userinfo.resources;
	game_data.dosh_gain = userinfo.resource_gain;

	function format_proved(proved) {
		let out = [], i = -1, a, b;
		while (++i < proved.length) {
			a = proved[i][0];
			b = proved[i][1];
			if (typeof(out[a]) === 'undefined' || out[a] === null) out[a] = [b];
			else out[a].push(b);
			if (typeof(out[b]) === 'undefined' || out[b] === null) out[b] = [a];
			else out[b].push(a);
		}
		return out;
	}
	console.log(game_data.proved);
	console.log(userinfo);

	App.game = App.cable.subscriptions.create("GameChannel", {
		connected: function() {
			// Called when the subscription is ready for use on the server
		},

		disconnected: function() {
			// Called when the subscription has been terminated by the server
		},

		received: function(data) {
			// Called when there's incoming data on the websocket for this channel
			console.log();
			console.log(data);
			let i, target, origin, colors;
			switch(data['function_call']) {
				case 'claim_node':
					//take node
					// data['node']
					// data['faction']
					console.log('claim_node called');
					target = null;
					i = -1;
					while (++i < 63)
						if (game_data.active_nodes[i].value === data['node'])
							target = game_data.active_nodes[i];
					game_data.node_factions[data['node']] = data['faction'];
					colors = game_data.colors[data['faction'].toString()];
					target.circle.strokeColor = colors.line;
					target.circle.fillColor = colors.fill;
					target.number.fillColor = colors.num;
					break;
				case 'connection_finished':
					// data['target']
					// data['origin_fac']
					console.log('connection finished called');
					target = null;
					i = -1;
					while (++i < 63)
						if (game_data.active_nodes[i].value === data['target'])
							target = game_data.active_nodes[i];
					if (!target) return;
					game_data.node_factions[data['target']] = data['origin_fac'];
					colors = game_data.colors[data['origin_fac'].toString()];
					target.circle.strokeColor = colors.line;
					target.circle.fillColor = colors.fill;
					target.number.fillColor = colors.num;
					target.owner = userinfo.name;
					break;
				case 'logged_data':
					console.log("Data logged");
					let a = data['logging_nodes'][0], b = data['logging_nodes'][1];
					if (typeof(game_data.proved[a]) === 'undefined' || game_data.proved[a] === null)
						game_data.proved[a] = [b];
					else game_data.proved[a].push(b);
					if (typeof(game_data.proved[b]) === 'undefined' || game_data.proved[b] === null)
						game_data.proved[b] = [a];
					else game_data.proved[b].push(a);
					let a_node = null, b_node = null, cur_node;
					i = -1;
					while (++i < game_data.active_nodes.length) {
						cur_node = game_data.active_nodes[i];
						if (cur_node.value === a) a_node = cur_node;
						else if (cur_node.value === b) b_node = cur_node;
					}
					if (a_node !== null) {
						hide_connections(a_node);
						if (a_node.son.node !== null) hide_connections(a_node.son.node);
						if (a_node.daughter.node !== null) hide_connections(a_node.daughter.node);
						if (a_node.sister.node !== null) hide_connections(a_node.sister.node);
						show_connections(a_node);
						if (a_node.son.node !== null) show_connections(a_node.son.node);
						if (a_node.daughter.node !== null) show_connections(a_node.daughter.node);
						if (a_node.sister.node !== null) show_connections(a_node.sister.node);
					}
					if (b_node !== null) {
						hide_connections(b_node);
						if (b_node.son.node !== null) hide_connections(b_node.son.node);
						if (b_node.daughter.node !== null) hide_connections(b_node.daughter.node);
						if (b_node.sister.node !== null) hide_connections(b_node.sister.node);
						show_connections(b_node);
						if (b_node.son.node !== null) show_connections(b_node.son.node);
						if (b_node.daughter.node !== null) show_connections(b_node.daughter.node);
						if (b_node.sister.node !== null) show_connections(b_node.sister.node);
					}
					break;
				case 'take_action':
					take_action(data);
					break;
				case 'transaction':
					// data['currency'] gold(0), keys(1)
					// data['amount'] amount of currency to be modified
					console.log('transaction called');
					if (data['currency'] === 0) {
						game_data.dosh_buff += data['amount'];
					}
					break;
				case 'update_connection':
					origin = null;
					target = null;
					i = -1;
					while (++i < 63) {
						if (game_data.active_nodes[i].value === data['target'])
							target = game_data.active_nodes[i];
						if (game_data.active_nodes[i].value === data['origin'])
							origin = game_data.active_nodes[i];
					}
					if (!target || !origin) return;
					let relation = null, first = origin, second = target, index = 0;
					if (target.value === origin.value * 2 || target.value === origin.value * 2 + 1) {
						first = target;
						second = origin;
						relation = "dad";
						index = 1;
					}
					else if (target.value === origin.value + 1) {
						first = target;
						second = origin;
						relation = "bro";
						index = 1;
					}
					else if (origin.value === target.value * 2 || origin.value === target.value * 2 + 1) {
						relation = "dad";
					}
					else if (origin.value === target.value + 1) {
						relation = "bro";
					}
					else throw new Error("No connection relationship found from back end");
					let other = index === 1 ? 0 : 1;
					console.log(first, second, relation, index, other);
					first.connection_data[relation] = {
						completions: [data['completions'][index], data['completions'][other]],
						last_updated: data['last_updated'],
						value: second.value };
					game_data.node_connections[first.value][relation] = first.connection_data[relation];
					if (first[relation + "_push"]) {
						first[relation + "_push"].time = data['last_updated'];
						first[relation + "_push"].ratio = parseFloat(data['completions'][index].percentage) / 100.0;
						first[relation + "_push"].speed = data['completions'][index].speed / 100.0;
					}
					else {
						hide_connections(first);
						hide_connections(second);
						show_connections(first);
						show_connections(second);
					}
					break;
				case 'update_income':
					// data['new_income']
					console.log('update_income called');
					break;
				case 'status':
					console.log(data['status']);
					break;
				case 'error':
					console.log(data['error_msg']);
					d3.select("#error_frame")
						.classed("hidden", false)
						.on("click", function() {
							d3.select('#error_frame')
							.classed("hidden", true)
							.selectAll('span').remove();
						})
						.append('span').text(data['error_msg']);

					break;
				default:
					console.log('invalid call');
			}
		}
	});

	// function init() {
	// 	get_initial_node_data();
	// 	set_resize();
	// 	set_assets();
	// 	make_ui();
	// 	make_background();
	// 	create_button_space();
	// 	set_gain();
	// 	scope.view.onFrame = function(event) {
	// 		tick(event);
	// 	};
	// 	check_tutorial();
	// }

	function init_debug() {
		console.log("Starting init...");
		scope = init_scope();
		w = scope.view.size.width / 2, wl = -0.4 * w, wh = 2.4 * w,
			h = scope.view.size.height / 2, hh = 2.5 * h, m = Math.min(w, h),
			g_theta = game_data.tilt * Math.PI / 180;
		ca = Math.cos(g_theta);
		sa = Math.sin(g_theta);
		d = game_data.view_dist;
		f = game_data.fov;
		get_initial_node_data(); // Sets up the initial map
		console.log("Initial node data loaded");
		console.log("Setting up canvas resize...");
		set_resize();
		console.log("Setting up assets...");
		set_assets();
		console.log("Making UI pretty...");
		make_ui();
		console.log("Making background...");
		make_background();
		console.log("Enabling smooth buttons...");
		create_button_space();
		console.log("Setting up resource gain...");
		set_gain();
		scope.view.onFrame = function(event) {
			tick(event);
			// let fps = 1.0 / event.delta;
			// d3.select(".local").select("text").text(fps.toString());
		};
		console.log("Ticking now...");
		check_tutorial();
	}

	// init();
	init_debug();
});
