
$(document).ready(function() {
	if ($("#map").length) {
		do_everything();
	}
});

function	do_everything() {
	var selectedNodes = [];
	var selectedIndex = -1;
	var options = [document.getElementById("attack"),
		document.getElementById("give"), document.getElementById("switch")];

	function call_event(node1, node2) {
	}

	function add_options(elem) {
		options.forEach(function(e) {
			elem.parentElement.appendChild(e);
			e.style.display = "block";
		});
	}

	function remove_options(elem) {
		options.forEach(function(e) {
			elem = e.firstChild.firstChild;
			if (elem.classList.contains("selected"))
				elem.classList.remove("selected");
			e.style.display = "none";
		});
		selectedIndex = -1;
	}

	$('.node').on("click", function(e) {
		if (e.target.className == "node")
		{
			var node = e.target;
			var elem = node.childNodes[0];
			if (elem.classList.contains("selected"))
			{
				elem.classList.remove("selected");
				var index = selectedNodes.indexOf(elem);
				selectedNodes.splice(index, 1);
				remove_options(elem);
			}
			else
			{
			elem.className += " selected";
				if (selectedNodes.length >= 1 && selectedIndex != -1)
				{
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
					remove_options(selectedNodes[0]);
					selectedNodes[0].classList.remove("selected");
					selectedNodes[0] = elem;
					add_options(elem);
				}
				else
				{
					selectedNodes.push(elem);
					add_options(elem);
				}
			}
		}
		else
		{
			var option = e.target;
			var elem = option.firstChild.firstChild;
			if (elem.classList.contains("selected"))
			{
				selectedIndex = -1;
				elem.classList.remove("selected");
			}
			else
			{
				if (selectedIndex != -1)
					options[selectedIndex].firstChild.firstChild.classList.remove("selected");
				elem.className += " selected";
				selectedIndex = options.indexOf(option);
			}
		}
	});
}
