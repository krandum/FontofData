// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

$(document).on('ready page:load', function() {
	console.log();
	var droppers = Array.from(document.getElementsByClassName('content_dropper'));
	var drop_cur = -1;
	while (++drop_cur < droppers.length) {
		var cur_dropper = droppers[drop_cur];
		cur_dropper.addEventListener('click', function(event) {
			var item = event.target.parentElement.parentElement;
			item.classList.toggle('expanded');
			if (item.querySelector('.content_dropper')) {
				item.querySelector('.chev_container').children[0].src = 'assets/icons/028-down-chevron.svg';
			}
			if (item.classList.contains('expanded')) {
				item.querySelector('.chev_container').children[0].src = 'assets/icons/029-up-chevron.svg';
			}
			var cur = -1, cur_item;
			while (++cur < droppers.length) {
				cur_item = droppers[cur].parentElement.parentElement;
				if (cur_item == item)
					continue;
				cur_item.classList.remove('expanded');
				if (cur_item.querySelector('.content_dropper')) {
					cur_item.querySelector('.chev_container').children[0].src = 'assets/icons/028-down-chevron.svg';
				}
			}
		});
	}
	var slides = document.querySelectorAll('#news_slider .slide');
	if (slides.length == 0) {
		return;
	}
	var currentSlide = 0;
	var playing = true;
	var next = document.getElementById('next_slide');
	var prev = document.getElementById('prev_slide');
	var slideInterval = setInterval(next_slide, 8000);
	function next_slide() {
		goto_slide(currentSlide+1);
	}
	function prev_slide() {
		goto_slide(currentSlide-1);
	}
	function goto_slide(n) {
		slides[currentSlide].className = 'slide';
		currentSlide = (n+slides.length)%slides.length;
		slides[currentSlide].className = 'slide showing';
	}
	function pause_slides() {
		playing = false;
		clearInterval(slideInterval);
	}
	function play_slides() {
		playing = true;
		slideInterval = setInterval(next_slide,8000);
	}
	next.addEventListener('click', function() {
		pause_slides();
		next_slide();
		play_slides();
	});
	prev.addEventListener('click', function() {
		pause_slides();
		prev_slide();
		play_slides();
	});



});
