const controUI = function(opt) {
	function coverClicked() {
		let $reel = global.$cur.parent();
		let id = global.$cur.attr('id');
		scrollToGame(null, 1000);
		global.$cur.toggleClass('selected');
		$reel.toggleClass('selected');
		$('.reel').toggleClass('bg');
		// $('nav').toggleClass('gameView');
		if (global.$cur.hasClass('selected')) {
			$reel.css('left', `${$(window).width()*.5-global.$cur.width()*.5}px`);
			global.$cur.css('transform', `scale(${$(window).height()/global.$cur.height()})`);
			uiStateChange('cover');
		} else {
			$reel.css('left', '');
			global.$cur.css('transform', '');
			uiStateChange('lib');
		}
	}
	this.coverClicked = coverClicked;

};
