// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

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
