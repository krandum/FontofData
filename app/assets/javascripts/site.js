// # Place all the behaviors and hooks related to the matching controller here.
// # All this logic will automatically be available in application.js.
// # You can use CoffeeScript in this file: http://coffeescript.org/

$(document).on('ready page:load', function() {
	var selectedNodes = [];
	var selectedIndex = -1;
	var options = [document.getElementById("attack"),
		document.getElementById("give"), document.getElementById("switch")];

	function call_event(node1, node2) {
	}

	function add_options(elem) {
		alert("adding options to " + elem.id);
		options.forEach(function(e) {
			elem.parentElement.appendChild(e);
			e.style.display = "block";
		});
	}

	function remove_options(elem) {
		alert("removing options from " + elem.id);
		options.forEach(function(e) {
			elem = e.firstChild.firstChild;
			if (elem.classList.contains("selected"))
				elem.classList.remove("selected");
			e.style.display = "none";
		});
		selectedIndex = -1;
	}

	// var i = 1;
	// while (i <= 32)
	// {
	// 	let name = '#' + i.toString();
	// 	$(document).on("click", name, function(e) {
	// 		var node = e.target;
	// 		var elem = node.childNodes[0];
	// 		// If you already selected it, unselected it with a second click
	// 		if (elem.classList.contains("selected"))
	// 		{
	// 			elem.classList.remove("selected");
	// 			var index = selectedNodes.indexOf(elem);
	// 			selectedNodes.splice(index, 1);
	// 			remove_options(elem);
	// 		}
	// 		else
	// 		{
	// 			elem.className += " selected";
	// 			// If a node is selected already and you've chosen an action
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
	// 	});
	// 	i++;
	// }
	//
	// options.forEach(function(o) {
	// 	$(document).on("click", '#' + o.id, function(e) {
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
	// 	});
	// });
	$('.node').on("click", function(e) {
		if (e.target.className == "node")
		{
			var node = e.target;
			var elem = node.childNodes[0];
			alert("clicking node " + node.id + " with elem " + elem.className)
			if (elem.classList.contains("selected"))
			{
				elem.classList.remove("selected");
				var index = selectedNodes.indexOf(elem);
				selectedNodes.splice(index, 1);
				remove_options(elem);
				alert("unselecting node");
			}
			else
			{
				elem.className += " selected";
				if (selectedNodes.length >= 1 && selectedIndex != -1)
				{
					alert("successfully called event");
					selectedNodes.push(elem);
					remove_options(selectedNodes[0]);
					call_event(selectedNodes[0].parentElement,
						selectedNodes[1].parentElement, options[selectedIndex]);
					setTimeout(function() {
						selectedNodes.forEach(function(e) {
							e.classList.remove("selected");
						});
						selectedNodes.splice(0, selectedNodes.length);
					}, 300);
				}
				else if (selectedNodes.length >= 1)
				{
					alert("switching selected");
					remove_options(selectedNodes[0]);
					selectedNodes[0].classList.remove("selected");
					selectedNodes[0] = elem;
					add_options(elem);
				}
				else
				{
					alert("selecting first node");
					selectedNodes.push(elem);
					add_options(elem);
				}
			}
		}
		else
		{
			alert("Selecting option");
			var option = e.target;
			var elem = option.firstChild.firstChild;
			if (elem.classList.contains("selected"))
			{
				alert("removing option selection");
				selectedIndex = -1;
				elem.classList.remove("selected");
			}
			else
			{
				if (selectedIndex != -1)
					options[selectedIndex].firstChild.firstChild.classList.remove("selected");
				elem.className += " selected";
				selectedIndex = options.indexOf(option);
				alert("successfully selected node");
			}
		}
	});
});
