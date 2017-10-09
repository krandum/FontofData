// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

function expand_content(elem_num) {
	var content_list = document.querySelectorAll('#content_list .content_item');
	for (i=0; i<content_list.length; i++) {
		if (i == elem_num){
			content_list[i].classList.toggle('expanded');
			if (content_list[i].querySelector('.content_dropper')) {
				content_list[i].querySelector('.content_dropper').querySelector('.chev_img').src = 'assets/icons/028-down-chevron.svg';
			}
			if (content_list[i].classList.contains('expanded')) {
				content_list[i].querySelector('.content_dropper').querySelector('.chev_img').src = 'assets/icons/029-up-chevron.svg';
			}
		}
		else {
			content_list[i].classList.remove('expanded');
			if (content_list[i].querySelector('.content_dropper')) {
				content_list[i].querySelector('.content_dropper').querySelector('.chev_img').src = 'assets/icons/028-down-chevron.svg';
			}
		}
	}
}

$(document).on('ready page:load', function() {
	var slides = document.querySelectorAll('#news_slider .slide');
	if (slides.length == 0) {
		return;
	}
	var currentSlide = 0;
	var slideInterval = setInterval(nextSlide,8000);

	function nextSlide() {
		slides[currentSlide].className = 'slide';
		currentSlide = (currentSlide+1)%slides.length;
		slides[currentSlide].className = 'slide showing';
	}
});
