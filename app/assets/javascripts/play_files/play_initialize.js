function init_scope() {
	let scope = new paper.PaperScope();
	scope.setup("myCanvas");
	return(scope);
}
function set_gain() {
	d3.select(".packet_field span").transition().duration(60000)
		.ease(d3.easeLinear).tween("text", function() {
			let node = this, i = d3.interpolateNumber(game_data.cur_dosh,
				game_data.cur_dosh + game_data.dosh_gain), off = 0.0;
			return function(t) {
				if (game_data.dosh_buff) off = game_data.dosh_buff;
				game_data.cur_dosh = i(t);
				node.textContent = Math.floor(game_data.cur_dosh + off);
			}
		}).on("end", function repeat() {
			if (game_data.dosh_buff) {
				game_data.cur_dosh += game_data.dosh_buff;
				game_data.dosh_buff = 0;
			}
			d3.select(".packet_field span").transition().duration(60000)
				.ease(d3.easeLinear).tween("text", function() {
				let node = this, i = d3.interpolateNumber(game_data.cur_dosh,
					game_data.cur_dosh + game_data.dosh_gain), off = 0.0;
				return function(t) {
					if (game_data.dosh_buff) off = game_data.dosh_buff;
					game_data.cur_dosh = i(t);
					node.textContent = Math.floor(game_data.cur_dosh + off);
				}
			}).on("end", repeat);
	});
}
