const CUI = function() {
	let opt = {
		v: true
	};
	const log = console.log;
	const err = (msg) => {
		log(msg);
		alert(msg);
	};
	const {
		Mouse,
		Keyboard,
		Gamepad,
		or,
		and
	} = require('contro');
	const remote = require('electron').remote;
	const {
		app,
		dialog,
		Menu
	} = remote;

	let gamepad = new Gamepad();
	let gamepadConnected = false;

	let btnNames = [
		'a', 'b', 'x', 'y',
		'up', 'down', 'left', 'right',
		'view', 'start'
	];
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
	let ui;
	let uiSub;
	let $cur;
	for (let i of btnNames) {
		btnStates[i] = false;
	}
	let gvMainMenuLabels = {
		x: 'power',
		y: 'reset',
		b: 'open'
	};

	// Xbox One controller mapped to
	// Nintendo Switch controller button layout
	//  Y B  ->  X A
	// X A  ->  Y B
	let map = {
		a: 'b',
		b: 'a',
		x: 'y',
		y: 'x'
	};

	this.selectDir = function(msg) {
		let dir = [''];
		try {
			dir = dialog.showOpenDialog({
				properties: ['openDirectory'],
				title: 'choose folder',
				message: msg
			});
		} catch (ror) {}
		return dir[0];
	}

	this.selectFile = function(msg) {
		let file = '';
		try {
			file = dialog.showOpenDialog({
				properties: ['openFile'],
				title: 'choose file',
				message: msg
			});
		} catch (ror) {}
		return file;
	}

	let doAction = () => {
		log('set custom actions with the setAction method');
	};

	let resize = () => {
		log('set custom resize with the setResize method');
	};

	this.setAction = function(func) {
		doAction = func;
	};

	this.setResize = function(func) {
		resize = func;
		$(window).resize(resize);
	};

	this.resize = function(adjust) {
		resize(adjust);
	}

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
			$cur = $('.' + gameID).eq(0);
		}
		if (opt.v) {
			log($cur);
		}
		let $reel = $cur.parent();
		let position = 0;
		for (let i = 0; i < $cur.index(); i++) {
			position += $reel.children().eq(i).height();
		}
		position += $cur.height() * .5;
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
		if (noSmallDistScrolling && scrollDist > $cur.height() * 1.1) {
			time += scrollDist;
		}
		scrollTo(position, time);
	}
	this.scrollToGame = scrollToGame;

	function scrollToCursor() {
		if (ui == 'lib') {
			scrollToGame(null, ($(window).height() * 2 - $cur.height()) / 5, true);
		}
	}
	this.scrollToCursor = scrollToCursor;


	function coverClicked() {
		let $reel = $cur.parent();
		scrollToGame(null, 1000);
		$cur.toggleClass('selected');
		$reel.toggleClass('selected');
		$('.reel').toggleClass('bg');
		// $('nav').toggleClass('gamestate');
		if ($cur.hasClass('selected')) {
			$reel.css('left', `${$(window).width()*.5-$cur.width()*.5}px`);
			$cur.css('transform', `scale(${$(window).height()/$cur.height()})`);
		} else {
			$reel.css('left', '');
			$cur.css('transform', '');
		}
	}
	this.coverClicked = coverClicked;

	function removeCursor() {
		if (!$cur) {
			return;
		}
		$cur.removeClass('cursor');
	}
	this.removeCursor = removeCursor;

	function makeCursor($cursor, state) {
		removeCursor();
		$cur = $cursor;
		$cur.addClass('cursor');
		if (!cuis[state || ui]) {
			cuis[state || ui] = {};
		}
		cuis[state || ui].$cur = $cur;
	}
	this.makeCursor = makeCursor;

	function addView(state) {
		if ('lib') {
			$('#lib .uie').click(uieClicked);
		}
	}
	this.addView = addView;

	function removeView(state) {
		$('#' + state).empty();
	}
	this.removeView = removeView;

	function uiStateChange(state, subState) {
		uiSub = subState || uiSub;
		if (state == ui) {
			log('b' + state);
			doAction('b');
			return;
		}
		$('#lib').removeClass();
		$('#lib').addClass('row-x');
		$('#lib').addClass(state);
		let labels = ['Power', 'Reset', 'Open'];
		if (state == 'cover') {
			labels = ['Play', '', 'Back'];
			makeCursor(cuis.lib.$cur, state);
		} else if (state == 'sysMenu' || state == 'pauseMenu') {
			labels = ['', '', 'Back'];
		} else if (state == 'lib') {
			$('.menu').hide();
			if (ui != 'cover' && !(/menu/gi).test(ui)) {
				let $mid = $('.reel.r0').children();
				$mid = $mid.eq(Math.round($mid.length * .5) - 1);
				makeCursor($mid, 'lib');
				scrollToGame(null, 10);
			} else {
				makeCursor(cuis.lib.$cur, state);
			}
		} else {
			labels = ['', '', ''];
		}
		if ((/menu/gi).test(state)) {
			$('#' + state).show();
			makeCursor($('#' + state).find('.row-y').eq(0).children().eq(0), state);
		}
		if (uiSub == 'gcn') {
			for (let i = 0; i < labels.length; i++) {
				labels[i] = labels[i].toLowerCase();
			}
		}
		$('.cover.power .text').text(labels[0]);
		$('.cover.reset .text').text(labels[1]);
		$('.cover.open .text').text(labels[2]);
		resize(true);
		ui = state;
		this.ui = state;
		if (opt.v) {
			log('ui state: ' + state);
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
				await doAction($cur.attr('name') || 'a');
				break;
			case 'b':
			case 'x':
			case 'y':
			case 'state':
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
				// save button state change
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
			scrollTo(pos, ((!mouse.wheel.smooth) ? 2000 : 0));
		});
	}

};
module.exports = new CUI();
