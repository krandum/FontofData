function check_tutorial() {
	let user = game_data.user_info;
	let ui = game_data.user_interface;
	let button = d3.select('#tutorial_button_container');
	let textbox = d3.select('#tutorial_text_pane');
	let text_prompt = {};
	let i = 1;
	switch (user.tutorial_flag) {
		case 0:
			text_prompt = {
				0: "Welcome to the Font of Data, the cryptic artifact which holds a vast amount of information. If your faction is to unlock the secrets this relic contains, you will have to compete with the other two factions.",
				1: "What you see here is a representation of the digital space within the Font. You will vie with the other factions for control of these Nodes.",
				2: "If you want to claim a node which is not connected to one your faction owns, you will need to use Keys. Keys are obtained by completing your daily objectives.",
				3: "Use these Keys to claim Node 1 now."
			};
			textbox.selectAll('span').remove();
			textbox.append('span').text(text_prompt[0]);
			button.on('click', function() {
				textbox.selectAll('span').remove();
				textbox.append('span').text(text_prompt[i++]);
				if (i === 5) {
					textbox.classed('hidden', true);
					d3.select('canvas').on("click", function() {
						if (game_data.node_factions[1] !== 1) {
							user.tutorial_flag++;
							App.game.perform('set_tut_flag', {
								flag: user.tutorial_flag,
								});
							check_tutorial();
						}
					});
				}
			});
			break;
		case 1:
			text_prompt = {
				0: "When you claim a Node using Keys, it becomes a Core Node. Core Nodes support all Nodes you connect to them.",
				1: "Once you have claimed a Core Node, you can start expanding your territory. To do this, you must first prove a connection to the Node you want to attack.",
				2: "Start by proving the connection between 1 and 2.",
			};
			d3.select('canvas').on("click", null);
			textbox.classed('hidden', false);
			textbox.selectAll('span').remove();
			textbox.append('span').text(text_prompt[0]);
			button.on('click', function() {
				textbox.selectAll('span').remove();
				textbox.append('span').text(text_prompt[i++]);
				if (i === 4) {
					textbox.classed('hidden', true);
					d3.select('canvas').on("click", function() {
						if (typeof game_data.active_nodes[1].parent.line !== "undefined") {
							user.tutorial_flag++;
							App.game.perform('set_tut_flag', {
								flag: user.tutorial_flag,
							});
							check_tutorial();
						}
					});
				}
			});
			break;
		case 2:
			text_prompt = {
				0: "Very well done!",
				1: "In order for a connection to be proven, the numbers must converge within a simple pattern. By the rule of this pattern, If a number is even it just needs to be divided by two. Thus every even number will automatically be proven to connect to the number it branches off from, as 2 and 1 just showed.",
				2: "If the number is odd, however, it must be multiplied by 3 and then increased by 1. The resulting even number will then be divided by two.",
				3: "Try connecting 1 and 3 now."
			};
			d3.select('canvas').on("click", null);
			textbox.classed('hidden', false);
			textbox.selectAll('span').remove();
			textbox.append('span').text(text_prompt[0]);
			button.on('click', function() {
				textbox.selectAll('span').remove();
				textbox.append('span').text(text_prompt[i++]);
				if (i === 5) {
					textbox.classed('hidden', true);
					d3.select('canvas').on("click", function() {
						if (typeof game_data.active_nodes[2].parent.line !== "undefined") {
							user.tutorial_flag++;
							App.game.perform('set_tut_flag', {
								flag: user.tutorial_flag,
							});
							check_tutorial();
						}
					});
				}
			});
			break;
		case 3:
			text_prompt = {
				0: "By these rules 1, being an odd number, becomes 4, which becomes 2, which in turn becomes 1 and continues looping forever.",
				1: "If you press “i” with a Node selected, detailed information on that Node will be displayed. Go ahead and inspect Node 3 now.",
				2: "Press “esc” to close a window whenever you’re done.",
				3: "Go ahead and prove the connection between 3 and 6. Since it’s to the left of 3, it’s a trivial connection and will be confirmed immediately."
			};
			d3.select('canvas').on("click", null);
			textbox.classed('hidden', false);
			textbox.selectAll('span').remove();
			textbox.append('span').text(text_prompt[0]);
			button.on('click', function() {
				textbox.selectAll('span').remove();
				textbox.append('span').text(text_prompt[i++]);
				if (i === 5) {
					textbox.classed('hidden', true);
					d3.select('canvas').on("click", function() {
						if (typeof game_data.active_nodes[5].parent.line !== "undefined") {
							user.tutorial_flag++;
							App.game.perform('set_tut_flag', {
								flag: user.tutorial_flag,
							});
							check_tutorial();
						}
					});
				}
			});
			break;
		case 4:
			text_prompt = {
				0: "Notice that now, you cannot connect 6 to 12. You will need to first prove a non-trivial connection to 6 before you can continue to the left.",
				1: "When you select a node, an arrow button appears by it. This lets you move to that node. You can select the current node in order to move back a level.",
				2: "You can click the question mark in the top right to activate a helper interface which can help you get comfortable with everything.",
				3: "Nodes 1 through 15 will be your own personal area. Use it to practice and familiarize yourself with the game, then whenever you're ready, claim a node somewhere out there and start conquering!"
			};
			d3.select('canvas').on("click", null);
			textbox.classed('hidden', false);
			textbox.selectAll('span').remove();
			textbox.append('span').text(text_prompt[0]);
			button.on('click', function() {
				textbox.selectAll('span').remove();
				textbox.append('span').text(text_prompt[i++]);
				if (i === 5) {
					textbox.classed('hidden', true);
					d3.select('canvas').on("click", function() {
						if (i === 5) {
							user.tutorial_flag++;
							App.game.perform('set_tut_flag', {
								flag: user.tutorial_flag,
							});
							check_tutorial();
						}
					});
				}
			});
			break;
		case 5:
			textbox.classed('hidden', true);
			d3.select('canvas').on("click", null);
	}
}
