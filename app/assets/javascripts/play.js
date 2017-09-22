// # Place all the behaviors and hooks related to the matching controller here.
// # All this logic will automatically be available in application.js.
// # You can use CoffeeScript in this file: http://coffeescript.org/

$(document).on('ready page:load', function() {
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
	var canvas = document.getElementById('myCanvas');

	paper.setup(canvas);

	var nodes;

	function get_initial_node_data() {
		$.ajax({
			type: "GET",
			url: "request_nodes",
			data: {
				ranges: [{
					from: 1,
					to: 31
				}]
			},
			datatype: "html",
			success: function (data) {
				console.log(data);
				in_nodes = data[0]["nodes"];
				console.log(in_nodes);
				in_nodes.forEach(function(node) {
					nodes[node['value']] = node['faction_id'];
				console.log(nodes);
				});
			},
			async: true
		});
	}

	function get_node(elem, center, size, thickness) {
		var num_digits = elem.toString().length;
		var half_size = size / 2;
		var sine_size = size / 2.3;
		var tan_size = size / 3.7;
		var quarter_size = size / 4;
		var basis = new paper.Path();
		var p1, p2, p3, p4, p5, p6, p7;
		var proper1, proper2, proper3, proper4;
		var partial1, partial2, from, to, gradient, stops;
		if (elem % 2 == 0)
		{
			p1 = new paper.Point(center.x, center.y + half_size);
			p2 = new paper.Point(center.x - half_size, center.y);
			p3 = new paper.Point(center.x, center.y - half_size);
			p4 = new paper.Point(center.x + half_size, center.y);
			p5 = new paper.Point(center.x + sine_size, center.y + quarter_size);
			p6 = new paper.Point(center.x + quarter_size, center.y + sine_size);
			p7 = new paper.Point(center.x + sine_size, center.y + sine_size);
			proper1 = new paper.Segment(p1, new paper.Point(size / 10, 0), new paper.Point(-tan_size, 0));
			proper2 = new paper.Segment(p2, new paper.Point(0, tan_size), new paper.Point(0, -tan_size));
			proper3 = new paper.Segment(p3, new paper.Point(-tan_size, 0), new paper.Point(tan_size, 0));
			proper4 = new paper.Segment(p4, new paper.Point(0, -tan_size), new paper.Point(0, size/10));
			partial1 = new paper.Segment(p5, new paper.Point(size/20, -size/12.5), new paper.Point(-size/25, size/16.7));
			partial2 = new paper.Segment(p6, new paper.Point(size/16.7, -size/25), new paper.Point(-size/12.5, size/20));
			stops = [
				['#1F3BFF', 0],
				['#343434', 0.9]
			];
			from = p7;
			to = new paper.Point(p7.x - quarter_size, p7.y - quarter_size);
		}
		else
		{
			p1 = new paper.Point(center.x, center.y + half_size);
			p2 = new paper.Point(center.x + half_size, center.y);
			p3 = new paper.Point(center.x, center.y - half_size);
			p4 = new paper.Point(center.x - half_size, center.y);
			p5 = new paper.Point(center.x - sine_size, center.y + quarter_size);
			p6 = new paper.Point(center.x - quarter_size, center.y + sine_size);
			p7 = new paper.Point(center.x - sine_size, center.y + sine_size);
			proper1 = new paper.Segment(p1, new paper.Point(-size / 10, 0), new paper.Point(tan_size, 0));
			proper2 = new paper.Segment(p2, new paper.Point(0, tan_size), new paper.Point(0, -tan_size));
			proper3 = new paper.Segment(p3, new paper.Point(tan_size, 0), new paper.Point(-tan_size, 0));
			proper4 = new paper.Segment(p4, new paper.Point(0, -tan_size), new paper.Point(0, size / 10));
			partial1 = new paper.Segment(p5, new paper.Point(-size/20, -size/12.5), new paper.Point(size/25, size/16.7));
			partial2 = new paper.Segment(p6, new paper.Point(-size/16.7, -size/25), new paper.Point(size/12.5, size/20));
			stops = [
				['#FF1F3B', 0],
				['#343434', 0.9]
			];
			from = p7;
			to = new paper.Point(p7.x + quarter_size, p7.y + quarter_size);
		}
		gradient = new paper.Gradient(stops, true);
		basis.add(proper1);
		basis.add(proper2);
		basis.add(proper3);
		basis.add(proper4);
		basis.add(partial1);
		basis.add(p7);
		basis.add(partial2);
		basis.closed = true;

		var gradient_color = new paper.Color(gradient, from, to);
		basis.strokeWidth = thickness;
		basis.strokeColor = gradient_color;
		basis.fillColor = '#B3B3B3';

		var num_w = sine_size * Math.pow(1.2, num_digits);
		var num_h = (num_w / num_digits) * 1.4;
		num = new paper.PointText(center);
		num.fillColor = '#343434';
		num.content = elem.toString();
		num.bounds = new paper.Rectangle({
			point: [center.x - num_w / 2, center.y - num_h / 2],
			size: [num_w, num_h]
		});

		out_node = new paper.Group(basis, num);
		return out_node;
	}

	function build_nodes(num_layers, width, height) {
		var nodes = [];
		var layer_height = height / 3;
		var node_height = height / 4;
		var y = height - (layer_height / 2);
		var point = new paper.Point();
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

	get_initial_node_data();
	var myNodes = build_nodes(5, paper.view.size.width, paper.view.size.height);

});
