function dropper() {
	document.getElementById("account_menu").classList.toggle("show");
}

$(document).on('ready page:load', function() {
	var close = document.getElementById('close');
	var alert_box = document.getElementById('alert_box');
	if (typeof(alert_box) != 'undefined' && alert_box != null) {
		var v_timeout = setTimeout(function () {
			alert_box.fadeOut('fast');
		}, 3000);
	}
	/*	alert_box.addEventListener('mouseover', function(event) {
	console.log('over');
	clearTimeout(v_timeout);
});
alert_box.addEventListener('mouseout', function(event) {
v_timeout = setTimeout("timeout_fn()", 3000);
});
close.addEventListener('click', function(event) {
timeout_fn;
});
document.addEventListener('click', function() {
if (document.getElementById("account_menu").classList.contains("show")) {
document.getElementById("account_menu").classList.remove("show");
}
});
*/
});
