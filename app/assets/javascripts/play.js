// # Place all the behaviors and hooks related to the matching controller here.
// # All this logic will automatically be available in application.js.
// # You can use CoffeeScript in this file: http://coffeescript.org/

$(document).on('ready page:load', function() {
	var play_check = document.getElementById('play');
	if (typeof(play_check) == 'undefined' || play_check == null) {
		console.log('aborting play.js due to no element with id play');
		return;
	}
	//paper = require('paper');
	// var selectedNodes = [];
	// var selectedIndex = -1;
	// var options = [document.getElementById("attack"),
	// 	document.getElementById("give"), document.getElementById("switch")];
	//
	// function call_event(node1, node2) {
	// 	var origin_node_id = parseInt(node1.id)
	// 	var target_node_id = parseInt(node2.id)
	// 	$.ajax({
	// 		type: "GET",
	// 		url: "take_action",
	// 		data: {
	// 			origin: origin_node_id,
	// 			target: target_node_id,
	// 			effect: selectedIndex + 1
	// 		},
	// 		datatype: "html",
	// 		success: function (data) {
	// 			console.log(data);
	// 		},
	// 		async: true
	// 	});
	// }
	//
	// function add_options(elem) {
	// 	options.forEach(function(e) {
	// 		elem.parentElement.appendChild(e);
	// 		e.style.display = "block";
	// 	});
	// }
	//
	// function remove_options(elem) {
	// 	options.forEach(function(e) {
	// 		elem = e.firstChild.firstChild;
	// 		if (elem.classList.contains("selected"))
	// 			elem.classList.remove("selected");
	// 		e.style.display = "none";
	// 	});
	// }
	//
	// $('.node').off().on("click", function(e) {
	// 	if (e.target.className == "node")
	// 	{
	// 		var node = e.target;
	// 		var elem = node.childNodes[0];
	// 		if (elem.classList.contains("selected"))
	// 		{
	// 			elem.classList.remove("selected");
	// 			var index = selectedNodes.indexOf(elem);
	// 			selectedNodes.splice(index, 1);
	// 			remove_options(elem);
	// 			selectedIndex = -1;
	// 		}
	// 		else
	// 		{
	// 			elem.className += " selected";
	// 			if (selectedNodes.length >= 1 && selectedIndex != -1)
	// 			{
	// 				selectedNodes.push(elem);
	// 				remove_options(selectedNodes[0]);
	// 				call_event(selectedNodes[0].parentElement,
	// 					selectedNodes[1].parentElement, options[selectedIndex]);
	// 				setTimeout(function() {
	// 					selectedNodes.forEach(function(e) {
	// 						e.classList.remove("selected");
	// 					});
	// 					selectedNodes.splice(0, selectedNodes.length);
	// 					selectedIndex = -1;
	// 				}, 300);
	// 			}
	// 			else if (selectedNodes.length >= 1)
	// 			{
	// 				remove_options(selectedNodes[0]);
	// 				selectedNodes[0].classList.remove("selected");
	// 				selectedNodes[0] = elem;
	// 				add_options(elem);
	// 			}
	// 			else
	// 			{
	// 				selectedNodes.push(elem);
	// 				add_options(elem);
	// 			}
	// 		}
	// 	}
	// 	else
	// 	{
	// 		var option = e.target;
	// 		var elem = option.firstChild.firstChild;
	// 		if (elem.classList.contains("selected"))
	// 		{
	// 			selectedIndex = -1;
	// 			elem.classList.remove("selected");
	// 		}
	// 		else
	// 		{
	// 			if (selectedIndex != -1)
	// 				options[selectedIndex].firstChild.firstChild.classList.remove("selected");
	// 			elem.className += " selected";
	// 			selectedIndex = options.indexOf(option);
	// 		}
	// 	}
	// });
	var canvas = document.getElementById("myCanvas");

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

	if (parseInt(navigator.appVersion) > 3) {
		canvas.onmousewheel = mouseDown;
		if (navigator.appName == "Netscape"
			&& parseInt(navigator.appVersion) == 4) {
			canvas.captureEvents(Event.MOUSEDOWN);
		}
	}

	var scope = new paper.PaperScope();
	scope.setup(canvas);

	var game_data = {
		node_factions: [],
		active_nodes: [],
		buffer_nodes: [],
		colors: {
			1: { // Neutral
				line: '#ffffff',
				num: '#ffffff',
				fill: '#8E8E8E',
				selected: '#ffffff',
				glow: '#ffffff'
			},
			2: { // Red Rocks
				line: '#e52d00',
				num: '#e52d00',
				fill: '#FAF9F9',
				selected: '#e52d00',
				glow: '#e52d00'
			},
			3: { // Green Elves
				line: '#edeec0',
				num: '#edeec0',
				fill: '#5eb22e',
				selected: '#97FC9C',
				glow: '#97FC9C'
			},
			4: { // Blue Jellyfish
				line: '#C9f0ff',
				num: '#C9f0ff',
				fill: '#2188dd',
				selected: '#E2E544',
				glow: '#E2E544'
			}
		},
		global_root,
		global_target
	};

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
				in_nodes = data['nodes']
				var i = 1;
				while (i < 64)
				{
					game_data.node_factions[i] = in_nodes[i]['faction_id'];
					i++;
				}
				game_data.active_nodes = build_nodes(6, paper.view.size.width,
					paper.view.size.height)
			},
			async: true
		});
	}

	function get_node(elem, center, size, thickness) {
		var num_digits = elem.toString().length;
		var ncol = colors[game_data.node_factions[elem].toString()];
		var half_size = size / 2;
		var sine_size = size / 2.3;
		var tan_size = size / 3.7;
		let quarter_size = size / 4;
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
		basis.strokeColor = ncol['line'];
		basis.fillColor = ncol['fill'];

		var num_w = sine_size * Math.pow(1.2, num_digits);
		var num_h = (num_w / num_digits) * 1.4;
		num = new scope.PointText(center);
		num.fillColor = ncol['num'];
		num.content = elem.toString();
		num.bounds = new scope.Rectangle({
			point: [center.x - num_w / 2, center.y - num_h / 2],
			size: [num_w, num_h]
		});

		let out_node = new scope.Group(basis, num);
		let selected = false;
		let myBounds = out_node.bounds;

		out_node.onMouseEnter = function(event) {
			out_node.scale(1.1);
		}

		out_node.onMouseLeave = function(event) {
			out_node.scale(0.9090909);
		}

		out_node.onClick = function(event) {
			var ncol = colors[game_data.node_factions[elem].toString()];
			if (!selected) {
				out_node.shadowColor = ncol['glow'];
				out_node.shadowBlur = quarter_size;
				out_node.firstChild.strokeColor = ncol['selected'];
				out_node.lastChild.fillColor = ncol['selected'];
				selected = true;
			}
			else {
				out_node.shadowColor = 0;
				out_node.shadowBlur = 0;
				out_node.firstChild.strokeColor = ncol['line'];
				out_node.lastChild.fillColor = ncol['num'];
				selected = false;
			}
		}
		return {
			value: elem,
			group: out_node
		};
	}

	function build_nodes(num_layers, width, height) {
		var nodes = [];
		var layer_height = height / 3;
		var node_height = height / 4;
		var y = height - (layer_height / 2);
		var point = new scope.Point();
		var index = 1;
		var i = 0;
		var thickness = 5;
		while (i < num_layers) {
			let layer = [];
			var num_sub = Math.pow(2, i);
			var j = 0;
			point.y = y;
			point.x = (width / num_sub) / 2;
			while (j < num_sub) {
				let new_node = get_node(index, point, node_height, thickness);
				layer.push(new_node);
				point.x += width / num_sub;
				j++;
				index++;
			}
			node_height /= 1.5;
			y -= layer_height / 2;
			layer_height /= 1.5;
			y -= layer_height / 2;
			i++;
			if (thickness > 1)
			{
				thickness--;
			}
			nodes.push(layer);
		}
		return nodes;
	}

	function init() {
		get_initial_node_data(); // Sets up the initial map
	}

});
