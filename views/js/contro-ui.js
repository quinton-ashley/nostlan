const CUI = function() {
	let opt = {
		v: true
	};
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

	// electron support
	let remote = {};
	let dialog = {};
	try {
		remote = require('electron').remote;
		dialog = remote.dialog;
	} catch (e) {}

	let btnNames = [
		'a', 'b', 'x', 'y',
		'up', 'down', 'left', 'right',
		'view', 'start'
	];
	let btns = {};
	for (let i of btnNames) {
		btns[i] = gamepad.button(i);
	}
	let btnStates = {};
	let stickNue = {
		x: true,
		y: true
	};
	let cuis = {};
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
			file = replace(/\\/g, '/');
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
			file = replace(/\\/g, '/');
		} catch (ror) {}
		return file;
	}

	let customActions = () => {
		log('set custom actions with the setCustomActions method');
	};
	let doAction = (act) => {
		if (ui == 'errMenu') {
			$('#errMenu').hide();
		} else {
			customActions(act);
		}
	};

	let resize = () => {
		log('set custom resize with the setResize method');
	};

	this.setCustomActions = function(func) {
		customActions = func;
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

	function scrollToCursor(time, minDistance) {
		if ((/menu/gi).test(ui)) {
			return;
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
		if (minDistance == null) {
			minDistance = .4;
		}
		if (scrollDist < $(window).height() * minDistance) {
			return;
		}
		let sTime = time || ($(window).height() * 2 - $cur.height()) / 5;
		if (!time && scrollDist > $cur.height() * 1.1) {
			sTime += scrollDist;
		}
		scrollTo(position, sTime);
	}
	this.scrollToCursor = scrollToCursor;

	function coverClicked() {
		let $reel = $cur.parent();
		scrollToCursor(1000, 0);
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
		if (!$cursor) {
			return;
		}
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
		$(`#${state} .uie`).click(uieClicked);
	}
	this.addView = addView;

	function removeView(state) {
		$('#' + state).empty();
	}
	this.removeView = removeView;

	let uiOnChange = () => {
		log('set custom ui state change with the setUIStateChange method');
	};

	this.setUIOnChange = function(func) {
		uiOnChange = func;
	};

	function uiStateChange(state, subState) {
		if (state == ui) {
			log('b' + state);
			doAction('b');
			return;
		}
		uiOnChange(state, subState || uiSub);
		if (subState) {
			$('#' + state).removeClass(uiSub || 'XXXXX');
			$('#' + state).addClass(subState);
		}
		if ((/cover/gi).test(state)) {
			makeCursor(cuis[ui].$cur, state);
		} else if (state == 'sysMenu' || state == 'pauseMenu') {
			labels = ['', '', 'Back'];
		} else if ((/main/gi).test(state)) {
			$('.menu').hide();
			if (!(/cover/gi).test(ui) && !(/menu/gi).test(ui)) {
				let $mid = $('.reel.r0').children();
				$mid = $mid.eq(Math.round($mid.length * .5) - 1);
				makeCursor($mid, state);
				scrollToCursor(10, 0);
			} else {
				makeCursor(cuis[state].$cur, state);
			}
		}
		if ((/menu/gi).test(state)) {
			$('#' + state).show();
			makeCursor($('#' + state).find('.row-y').eq(0).children().eq(0), state);
		}
		resize(true);
		ui = state;
		uiSub = subState || uiSub;
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

					$button.text(i.toUpperCase());
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

	function err(msg) {
		log(msg);
		let $errMenu = $('#errMenu');
		if (!$errMenu.length) {
			$('body').append(pug('#errMenu.menu: .row-y: .uie(name="okay") Okay'));
			$errMenu = $('#errMenu');
		}
		$errMenu.prepend(md('# Error  \n' + msg));
		$errMenu.show();
		makeCursor($errMenu.find('.row-y').eq(0).children().eq(0), 'errMenu');
	}
	this.err = err;

};
module.exports = new CUI();
