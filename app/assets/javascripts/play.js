// # Place all the behaviors and hooks related to the matching controller here.
// # All this logic will automatically be available in application.js.
// # You can use CoffeeScript in this file: http://coffeescript.org/

$(document).on('ready page:load', function() {
	paper = require('paperjs');
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
	function node(elem, center, size) {
		var half_size = size / 2;
		var sine_size = size / 2.3;
		var tan_size = size / 3.7;
		var quarter_size = size / 4;
		var basis = new Path();
		if (elem % 2 == 0)
		{
			var p1 = new Point(center.x, center.y + half_size);
			var p2 = new Point(center.x - half_size, center.y);
			var p3 = new Point(center.x, center.y - half_size);
			var p4 = new Point(center.x + half_size, center.y);
			var p5 = new Point(center.x + sine_size, center.y + quarter_size);
			var p6 = new Point(center.x + quarter_size, center.y + sine_size);
			var stops = [
				['#1F3BFF', 0],
				['#343434', 0.9]
			];
			var mod = [-quarter_size, -quarter_size];
			var p7 = new Point(center.x + sine_size, center.y + sine_size);
			var proper1 = new Segment(p1, new Point(size / 10, 0), new Point(-tan_size, 0));
			var proper2 = new Segment(p2, new Point(0, tan_size), new Point(0, -tan_size));
			var proper3 = new Segment(p3, new Point(-tan_size, 0), new Point(tan_size, 0));
			var proper4 = new Segment(p4, new Point(0, -tan_size), new Point(0, size/10));
			var partial1 = new Segment(p5, new Point(size/20, -size/12.5), new Point(-size/25, size/16.7));
			var partial2 = new Segment(p6, new Point(size/16.7, -size/25), new Point(-size/12.5, size/20));
		}
		else
		{
			var p1 = new Point(center.x, center.y + half_size);
			var p2 = new Point(center.x + half_size, center.y);
			var p3 = new Point(center.x, center.y - half_size);
			var p4 = new Point(center.x - half_size, center.y);
			var p5 = new Point(center.x - sine_size, center.y + quarter_size);
			var p6 = new Point(center.x - quarter_size, center.y + sine_size);
			var stops = [
				['#FF1F3B', 0],
				['#343434', 0.9]
			];
			var mod = [quarter_size, quarter_size];
			var p7 = new Point(center.x - sine_size, center.y + sine_size);
			var proper1 = new Segment(p1, new Point(-size / 10, 0), new Point(tan_size, 0));
			var proper2 = new Segment(p2, new Point(0, tan_size), new Point(0, -tan_size));
			var proper3 = new Segment(p3, new Point(tan_size, 0), new Point(-tan_size, 0));
			var proper4 = new Segment(p4, new Point(0, -tan_size), new Point(0, size / 10));
			var partial1 = new Segment(p5, new Point(-size/20, -size/12.5), new Point(size/25, size/16.7));
			var partial2 = new Segment(p6, new Point(-size/16.7, -size/25), new Point(size/12.5, size/20));
		}
		basis.add(proper1);
		basis.add(proper2);
		basis.add(proper3);
		basis.add(proper4);
		basis.add(partial1);
		basis.add(p7);
		basis.add(partial2);

		var gradient = new Gradient(stops, true);
		var from = p7;
		var to = p7 + mod;
		var gradient_color = new Color(gradient, from, to);
		basis.strokeColor = gradient_color;
		basis.strokeWidth = 4;
		basis.fillColor = '#B3B3B3';
		basis.closed = true;

		num = new PointText(center);
		num.fillColor = '#343434';
		num.content = elem.toString();
		num.bounds = new Rectangle({
			point: [center.x - 15, center.y - 24],
			size: [30, 48]
		});

		out_node = new Group(basis, num);
		return out_node;
	}

	var g_center = view.center;

	var node_one = node(1, g_center, 150);
	var node_one = node(2, new Point(g_center.x - 120, g_center.y - 100), 100);
	var node_one = node(3, new Point(g_center.x + 120, g_center.y - 100), 100);
});
