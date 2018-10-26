const controUI = function() {
	let opt = {};
	const log = console.log;
	const {
		Mouse,
		Keyboard,
		Gamepad,
		or,
		and
	} = require('contro');

	let gamepad = new Gamepad();
	let gamepadConnected = false;

	let btnNames = ['A', 'B', 'X', 'Y', 'Up', 'Down', 'Left', 'Right', 'View', 'Start'];
	let btns = {};
	for (let i of btnNames) {
		btns[i] = gamepad.button(i);
	}
	let stickNue = {
		x: true,
		y: true
	};
	let cuis = {};
	let btnStates = {};
	let mouse;
	let mouseWheelDeltaNSS;
	let pos = 0;
	for (let i of btnNames) {
		btnStates[i] = false;
	}
	let gvMainMenuLabels = {
		X: 'power',
		Y: 'reset',
		B: 'open'
	};

	// Xbox One controller mapped to
	// Nintendo Switch controller button layout
	//  Y B  ->  X A
	// X A  ->  Y B
	let map = {
		A: 'B',
		B: 'A',
		X: 'Y',
		Y: 'X'
	};

	let doAction = () => {
		log('set up custom actions with the setAction method');
	};

	this.setAction = function(actionFunc) {
		doAction = actionFunc;
	};

	this.getCur = function(state) {
		return cuis[state].$cur;
	}

	this.setMouse = function(mouseInfo, delta) {
		mouse = mouseInfo;
		mouseWheelDeltaNSS = delta;
	};

	function scrollTo(position, time) {
		if (isNaN(position)) {
			log("pos can't be: " + position);
			return;
		}
		pos = position;
		time = ((time == undefined) ? 2000 : time);
		$('html').stop().animate({
			scrollTop: pos
		}, time);
		$('.reel.reverse').stop().animate({
			bottom: pos * -1
		}, time);
		// log(pos);
	}
	this.scrollTo = scrollTo;

	function scrollToGame(gameID, time, noSmallDistScrolling) {
		if (gameID) {
			global.$cur = $('.' + gameID).eq(0);
		}
		if (opt.v) {
			log(global.$cur);
		}
		let $reel = global.$cur.parent();
		let position = 0;
		for (let i = 0; i < global.$cur.index(); i++) {
			position += $reel.children().eq(i).height();
		}
		position += global.$cur.height() * .5;
		if ($reel.hasClass('reverse')) {
			position += $(window).height() * .5;
			position = $reel.height() - position;
		} else {
			position -= $(window).height() * .5;
		}
		let scrollDist = Math.abs(pos - position);
		if (noSmallDistScrolling && scrollDist < $(window).height() * .4) {
			return;
		}
		if (noSmallDistScrolling && scrollDist > global.$cur.height() * 1.1) {
			time += scrollDist;
		}
		cui.scrollTo(position, time);
	}
	this.scrollToGame = scrollToGame;

	function scrollToCursor() {
		if (global.ui == 'lib') {
			scrollToGame(null, ($(window).height() * 2 - global.$cur.height()) / 5, true);
		}
	}
	this.scrollToCursor = scrollToCursor;


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

	function removeCursor() {
		if (!global.$cur) {
			return;
		}
		global.$cur.removeClass('cursor');
	}
	this.removeCursor = removeCursor;

	function makeCursor($cur, view) {
		removeCursor();
		global.$cur = $cur;
		global.$cur.addClass('cursor');
		if (!cuis[view || global.ui]) {
			cuis[view || global.ui] = {};
		}
		cuis[view || global.ui].$cur = global.$cur;
	}
	this.makeCursor = makeCursor;

	function addView(view) {
		if ('lib') {
			$('#lib .uie').click(uieClicked);
		}
	}
	this.addView = addView;

	function removeView(view) {
		$('#' + view).empty();
	}
	this.removeView = removeView;

	function uiStateChange(view, subState) {
		if (view == global.ui) {
			doAction('b');
			return;
		}
		$('#lib').removeClass();
		$('#lib').addClass('row-x');
		$('#lib').addClass(view);
		let labels = ['Power', 'Reset', 'Open'];
		if (view == 'cover') {
			labels = ['Play', '', 'Back'];
		} else if (view == 'sysMenu') {
			labels = ['', '', 'Back'];
		} else if (view == 'pauseMenu') {
			labels = ['', '', 'Back'];
		} else if (view == 'introMenu') {
			labels = ['', '', ''];
		} else if (view == 'lib') {
			$('.menu').hide();
			if (global.ui != 'cover' && !(/menu/gi).test(global.ui)) {
				let $mid = $('.reel.r0').children();
				$mid = $mid.eq(Math.round($mid.length * .5) - 1);
				makeCursor($mid, 'lib');
				scrollToGame(null, 10);
			} else {
				makeCursor(cuis.lib.$cur, 'lib');
			}
		}
		if ((/menu/gi).test(view)) {
			$('#' + view).show();
			makeCursor($('#' + view).find('.row-y').eq(0).children().eq(0), view);
		}
		// if (subState == 'gcn') {
		// 	for (let i = 0; i < labels.length; i++) {
		// 		labels[i] = labels[i].toLowerCase();
		// 	}
		// }
		$('.cover.power .text').text(labels[0]);
		$('.cover.reset .text').text(labels[1]);
		$('.cover.open .text').text(labels[2]);
		global.ui = view;
		if (opt.v) {
			log('ui view: ' + view);
		}
	}
	this.uiStateChange = uiStateChange;

	function uieClicked() {
		let classes = $(this).attr('class').split(' ');
		if (classes.includes('uie-disabled')) {
			return;
		}
		makeCursor($(this));
		buttonPressed('a');
	}
	this.uieClicked = uieClicked;

	function uieHovered() {
		makeCursor($(this));
	}
	this.uieHovered = uieHovered;

	async function move(direction) {
		let $cur = global.$cur;
		let $rowX = $cur.closest('.row-x');
		let $rowY = $cur.closest('.row-y');
		let curX, curY;
		let inVerticalRow = $rowX.has($rowY.get(0)).length || !$rowX.length;
		if (inVerticalRow) {
			curX = $rowY.index(); // index of rowY in rowX
			curY = $cur.index();
		} else {
			curX = $cur.index();
			curY = $rowX.index(); // index of rowX in rowY
		}
		let x = curX;
		let y = curY;
		switch (direction.toLowerCase()) {
			case 'up':
				y -= 1;
				break;
			case 'down':
				y += 1;
				break;
			case 'left':
				x -= 1;
				break;
			case 'right':
				x += 1;
				break;
			default:

		}
		let ret = {
			$cur: $cur,
			$rowX: $rowX,
			$rowY: $rowY
		};
		if (x < 0 || y < 0) {
			return;
		}
		if (inVerticalRow) {
			if (x == curX) {
				ret.$cur = $rowY.children().eq(y);
			} else {
				if (!$rowX.length) {
					return;
				}
				ret.$rowY = $rowX.children().eq(x);
				if (!ret.$rowY.length) {
					return;
				}
				let curRect = $cur.get(0).getBoundingClientRect();
				while (y < ret.$rowY.children().length && y >= 0) {
					ret.$cur = ret.$rowY.children().eq(y);
					let elmRect = ret.$cur.get(0).getBoundingClientRect();
					let diff = curRect.top - elmRect.top;
					let halfHeight = Math.max($cur.height(), ret.$cur.height()) * .6;
					if (halfHeight < diff) {
						y++;
					} else if (-halfHeight > diff) {
						y--;
					} else {
						break;
					}
				}
			}
			$rowY.find('.cursor').removeClass('cursor');
		} else {

		}
		if (!ret.$cur.length) {
			return;
		}
		makeCursor(ret.$cur);
		scrollToCursor();
		return true;
	}
	this.move = move;

	async function buttonPressed(btn) {
		if (typeof btn == 'string') {
			btn = {
				label: btn
			};
		}
		let lbl = btn.label.toLowerCase();
		switch (lbl) {
			case 'up':
			case 'down':
			case 'left':
			case 'right':
				move(lbl);
				break;
			case 'a':
				await doAction(global.$cur.attr('name') || 'a');
				break;
			case 'b':
			case 'x':
			case 'y':
			case 'view':
			case 'start':
				await doAction(lbl);
				break;
			default:
				if (opt.v) {
					log('button does nothing');
				}
				return;
		}
	}
	this.buttonPressed = buttonPressed;

	async function loop() {
		if (gamepadConnected || gamepad.isConnected()) {
			for (let i in btns) {
				let btn = btns[i];
				// incomplete maps are okay
				// no one to one mapping necessary
				i = map[i] || i;

				if (!gamepadConnected) {
					let $button;

					$button = $('#' + gvMainMenuLabels[i]);

					$button.text(i);
				}
				let query = btn.query();
				// if button is not pressed, query is false and unchanged
				if (!btnStates[i] && !query) {
					continue;
				}
				// if button is held, query is true and unchanged
				if (btnStates[i] && query) {
					// log(i + ' button press held');
					continue;
				}
				// save button view change
				btnStates[i] = query;
				// if button press ended query is false
				if (!query) {
					// log(i + ' button press end');
					continue;
				}
				// if button press just started, query is true
				if (opt.v) {
					log(i + ' button press start');
				}
				await buttonPressed(i);
			}
			let vect = gamepad.stick('left').query();
			if (vect.y < -.5) {
				if (stickNue.y) move('up');
				stickNue.y = false;
			}
			if (vect.y > .5) {
				if (stickNue.y) move('down');
				stickNue.y = false;
			}
			if (vect.x < -.5) {
				if (stickNue.x) move('left');
				stickNue.x = false;
			}
			if (vect.x > .5) {
				if (stickNue.x) move('right');
				stickNue.x = false;
			}
			if (vect.x < .5 &&
				vect.x > -.5) {
				stickNue.x = true;
			}
			if (vect.y < .5 &&
				vect.y > -.5) {
				stickNue.y = true;
			}
			gamepadConnected = true;
		}
		requestAnimationFrame(loop);
	}
	this.start = function(options) {
		opt = options || {};
		$('.menu .uie').click(uieClicked);
		$('.menu .uie').hover(uieHovered);
		loop();
	};

	this.rebind = function() {
		$(window).bind('mousewheel', function(event) {
			event.preventDefault();
			if ($('.uie.selected').length) {
				return;
			}
			let scrollDelta = event.originalEvent.wheelDelta;
			if (mouse.wheel.smooth) {
				pos += scrollDelta * mouse.wheel.multi;
			} else {
				if (scrollDelta < 0) {
					pos += mouseWheelDeltaNSS;
				} else {
					pos -= mouseWheelDeltaNSS;
				}
			}
			cui.scrollTo(pos, ((!mouse.wheel.smooth) ? 2000 : 0));
		});
	}

};
module.exports = new controUI();
