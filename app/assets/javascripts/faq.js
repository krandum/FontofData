// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

$(document).on('ready page:load', function(){
	var links = Array.from(document.getElementsByClassName('faq_link'));
	var pages = Array.from(document.getElementsByClassName('faq_content'))
	var i = -1;
	while (++i < links.length) {
		var cur_link = links[i];
		cur_link.addEventListener('click', function(event) {
			var cur = -1;
			while (++cur < links.length) {
				if (event.target == links[cur]) {
					pages[cur].classList.add('showing');
					continue;
				}
				pages[cur].classList.remove('showing');
			}
		});
	}
});
