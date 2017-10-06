function dropper() {
	document.getElementById("account_menu").classList.toggle("show");
}


var timeout_fn = function () {
	$('#alert_box').fadeOut('fast');
}
var v_timeout = setTimeout("timeout_fn()", 3000);

$(document).on('ready page:load', function() {
	bind_alert_events();
});

function bind_alert_events() {
	$('#alert_box').mouseout( function () {
		v_timeout = setTimeout("timeout_fn()", 3000)
	});
	$('#alert_box').mouseover( function () {
		clearTimeout(v_timeout);
	});
	$("#close").click(timeout_fn);
}
