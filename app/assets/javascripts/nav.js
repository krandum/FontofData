function dropper() {
	document.getElementById("account_menu").classList.toggle("show");
}

var v_timeout = setTimeout("timeout_fn()", 3000);
$('#alert_box').mouseout( function () {
	v_timeout = setTimeout("timeout_fn()", 3000)
});
$('#alert_box').mouseover( function () {
	clearTimeout(v_timeout);
});
var timeout_fn = function () {
	$('#alert_box').fadeOut('fast');
}
$("#close").click(timeout_fn);
