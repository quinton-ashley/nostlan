const CUI = function() {
	let opt = this.opt = {
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
	// let gamepad = {
	// 	isConnected: () => {
	// 		return false;
	// 	}
	// };
	let gamepadConnected = false;
	let btnNames = [
		'a', 'b', 'x', 'y',
		'up', 'down', 'left', 'right',
		'view', 'start'
	];
	this.btns = btnNames;
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
	let uiPrevStates = [];
	let uiPrev;
	let ui;
	let uiSub;
	let $cur;
	for (let i of btnNames) {
		btnStates[i] = false;
	}

	let map = {};
	const remappingProfiles = {
		Xbox_PS_Adaptive: {
			map: {
				a: 'b',
				b: 'a',
				x: 'y',
				y: 'x'
			},
			disable: 'ps|xbox|pc'
		},
		Nintendo_Adaptive: {
			map: {
				a: 'b',
				b: 'a',
				x: 'y',
				y: 'x'
			},
			enable: 'ps|xbox|pc'
		},
		Xbox_PS_Consistent: {
			map: {
				a: 'b',
				b: 'a',
				x: 'y',
				y: 'x'
			}
		},
		Nintendo_Consistent: {
			map: {
				a: 'b',
				b: 'a',
				x: 'y',
				y: 'x'
			}
		},
		Xbox_PS_None: {
			map: {}
		},
		Nintendo_None: {
			map: {}
		}
	};

	this.mapButtons = function(gamepad, session, normalize) {
		let prof = remappingProfiles[gamepad.profile];
		if (!prof) {
			prof = remappingProfiles['Xbox_PS_Adaptive'];
		}
		let sys = session.sys;
		let enable;
		if (prof.enable) {
			enable = new RegExp(`(${prof.enable})`, 'i');
		}
		let disable;
		if (prof.disable) {
			disable = new RegExp(`(${prof.disable})`, 'i');
		}
		// Xbox/PS Adaptive profile usage example:

		// User is currently browsing their Nintendo Switch library
		// Xbox One controller is mapped to
		// Nintendo Switch controller button layout
		//  Y B  ->  X A
		// X A  ->  Y B

		// When browsing Xbox 360 games no mapping occurs
		//  Y B  ->  Y B
		// X A  ->  X A

		// When browsing PS3 games no mapping occurs either
		// since A(Xbox One) auto maps to X(PS3)
		//  Y B  ->  △ ○
		// X A  ->  □ X
		if ((!enable || enable.test(sys)) && (!disable || !disable.test(sys))) {
			// log('controller remapping enabled for ' + sys);
			map = {};
			for (let i in prof.map) {
				map[i] = gamepad.map[prof.map[i]] || prof.map[i];
			}
		} else {
			// log('no controller remapping for ' + sys);
			map = {};
		}

		// normalize X and Y to nintendo physical layout
		// this will make the physical layout of an app consistent
		// and doAction choices consistent for certain buttons
		if (normalize &&
			((normalize.disable &&
					!(new RegExp(`(${normalize.disable})`, 'i')).test(gamepad.profile)) ||
				(normalize.enable &&
					(new RegExp(`(${normalize.enable})`, 'i')).test(gamepad.profile))
			)) {
			for (let i in normalize.map) {
				map[i] = gamepad.map[normalize.map[i]] || normalize.map[i];
			}
		}
	}

	let customActions = () => {
		log('set custom actions with the setCustomActions method');
	};
	let doAction = (act) => {
		if (act == 'error-okay' || act == 'back') {
			if (uiPrev) {
				for (let i = uiPrevStates.length - 1; i >= 0; i--) {
					if (!(/menu/i).test(uiPrevStates[i]) && ui != uiPrevStates[i]) {
						this.uiStateChange(uiPrevStates[i]);
						break;
					}
				}
			} else {
				for (let state of uiPrevStates) {
					if ((/main/i).test(state)) {
						this.uiStateChange(state);
						break;
					}
				}
			}
		} else {
			customActions(act, this.btns.includes(act));
		}
	};
	this.doAction = doAction;

	let customHeldActions = () => {
		log('set custom actions with the setCustomHeldActions method');
	};
	let doHeldAction = (act, timeHeld) => {
		customHeldActions(act, this.btns.includes(act), timeHeld);
	};
	this.doHeldAction = doHeldAction;

	let resize = () => {
		log('set custom resize with the setResize method');
	};

	this.setCustomActions = function(func) {
		customActions = func;
	};

	this.setResize = function(func) {
		resize = func;
	};

	this.resize = function(adjust, state) {
		state = state || ui;
		if ((/menu/gi).test(state)) {
			let $menu = $('#' + state);
			$menu.css('margin-top', $(window).height() * .5 - $menu.outerHeight() * .5);
		}
		resize(adjust);
	}

	this.getCur = function(state) {
		return (cuis[state || ui] || {}).$cur || $('');
	}

	this.setMouse = function(mouseInfo, delta) {
		mouse = mouseInfo;
		mouseWheelDeltaNSS = delta;
	};

	function scrollTo(position, time) {
		if (isNaN(position)) {
			log(`pos can't be: ` + position);
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
		let sTime = ((time > -1) ? time || 1 : ($(window).height() * 2 - $cur.height()) / 5);
		if (time == undefined && scrollDist > $cur.height() * 1.1) {
			sTime += scrollDist;
		}
		scrollTo(position, sTime);
	}
	this.scrollToCursor = scrollToCursor;

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

	function addView(state, opt) {
		cuis[state] = opt;
		$(`#${state} .uie`).off('click').click(uieClicked);
		$(`#${state} .uie`).off('hover').hover(uieHovered);
	}
	this.addView = addView;

	function removeView(state) {
		$('#' + state).empty();
		if ((/main/i).test(state)) {
			uiPrev = null;
			this.uiPrev = null;
		}
	}
	this.removeView = removeView;

	let uiOnChange = () => {
		log('set custom ui state change with the setUIStateChange method');
	};

	this.setUIOnChange = function(func) {
		uiOnChange = func;
	};

	function uiStateChange(state, subState, opt) {
		opt = opt || {};
		if (state == ui) {
			log('b ' + state);
			doAction('b');
			return;
		}
		uiOnChange(state, subState || uiSub, gamepadConnected);
		if ((/main/gi).test(state)) {
			if (ui == 'errMenu' || (!(/select/gi).test(ui) && !(/menu/gi).test(ui))) {
				let $mid = $('#' + state + ' .reel.r0').children();
				$mid = $mid.eq(Math.round($mid.length * .5) - 1);
				makeCursor($mid, state);
			} else {
				makeCursor(cuis[state].$cur, state);
			}
			scrollToCursor(0, 0);
		} else if ((/select/gi).test(state)) {
			makeCursor(cuis[ui].$cur, state);
		} else {
			let $temp = $('#' + state).find('.row-y').eq(0).find('.uie').eq(0);
			if (!$temp.length) {
				$temp = $('#' + state).find('.row-x').eq(0).find('.uie').eq(0);
			}
			makeCursor($temp, state);
		}
		if (subState) {
			$('#' + state).removeClass(uiSub || 'XXXXX');
			$('#' + state).addClass(subState);
		}
		this.resize(true, state);
		if (!opt.b && !opt.keepBackground &&
			!(/select/gi).test(state) && !(/menu/gi).test(state) || (/menu/gi).test(ui)) {
			// $('.cui:not(.main)').hide();
			$('#' + ui).hide();
		} else {
			// log('keeping prev ui in background');
		}
		$('#' + state).show();
		if (ui) {
			uiPrevStates.push(ui);
		}
		uiPrev = ui;
		ui = state;
		uiSub = subState || uiSub;
		this.ui = ui;
		this.uiPrev = uiPrev;
		if (this.opt.v) {
			log('ui state changed from ' + uiPrev + ' to ' + state);
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
		if (!cuis[ui].hoverCurDisable) {
			makeCursor($(this));
		}
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
		log(ui);
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

	async function buttonHeld(btn) {
		if (typeof btn == 'string') {
			btn = {
				label: btn
			};
		}
		let lbl = btn.label.toLowerCase();
		log(ui);
		switch (lbl) {
			case 'a':
				await doHeldAction($cur.attr('name') || 'a');
				break;
			case 'up':
			case 'down':
			case 'left':
			case 'right':
			case 'b':
			case 'x':
			case 'y':
			case 'view':
			case 'start':
				await doHeldAction(lbl);
				break;
			default:
				if (opt.v) {
					log('button does nothing');
				}
				return;
		}
	}
	this.buttonHeld = buttonHeld;

	async function loop() {
		if (gamepadConnected || gamepad.isConnected()) {
			for (let i in btns) {
				let btn = btns[i];
				// incomplete maps are okay
				// no one to one mapping necessary
				i = map[i] || i;

				if (!gamepadConnected) {
					uiOnChange(ui, uiSub, true);
					$('html').addClass('cui-gamepadConnected');
				}
				let query = btn.query();
				// if button is not pressed, query is false and unchanged
				if (!btnStates[i] && !query) {
					continue;
				}
				// if button press ended query is false
				if (!query) {
					// log(i + ' button press end');
					btnStates[i] = 0;
					continue;
				}
				// if button is held, query is true and unchanged
				if (btnStates[i] && query) {
					btnStates[i] += 1;
					await buttonHeld(i, btnStates[i]);
					continue;
				}
				// save button state change
				btnStates[i] += 1;
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
		$('.uie').off('click').click(uieClicked);
		$('.uie').off('hover').hover(uieHovered);
		loop();
		$(window).resize(this.resize);
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
			$('body').append(`
<div class="menu" id="errMenu">
    <div class="row-y">
        <div class="uie" name="error-okay">Okay</div>
    </div>
</div>`);
			$errMenu = $('#errMenu');
			$errMenu.prepend(`<h1>Error</h1><p>unknown error</p>`);
			$('#errMenu .uie').click(uieClicked);
			$('#errMenu .uie').hover(uieHovered);
		}
		$('#errMenu p').text(msg);
		this.uiStateChange('errMenu');
	}
	this.err = err;
};
module.exports = new CUI();
