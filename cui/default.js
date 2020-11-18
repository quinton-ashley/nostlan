class CuiState {

	async onAction(act, $cursor) {
		let ui = cui.ui;
		log(act + ' on ' + ui);
		if (act == 'quit') {
			quit();
		} else if (launcher.state == 'running') {
			if (launcher.jsEmu) {
				if (ui == 'playing_4') {
					if (act == 'pause') {
						log('pausing emulation');
						launcher.pause();
					}
				}
			}
		} else if (/key-./.test(act)) {
			// letter by letter search for game
			searchForGame(act.slice(4));
		} else if (act == 'x' && (ui == 'libMain' || ui == 'boxSelect_1')) {
			if ($cursor.hasClass('cui-disabled')) return false;
			if (syst.emus.length > 1) {
				cui.change('playMenu_5');
			} else {
				$('body > :not(#dialogs)').addClass('dim');
				await launcher.launch(getCurGame());
			}
		} else if (act == 'start' && cui.getLevel(ui) < 10) {
			cui.change('nostlanMenu_10');
		} else if (act == 'b' && (/menu/i.test(ui) || /select/i.test(ui)) &&
			ui != 'donateMenu' && ui != 'setupMenu_1' &&
			ui != 'pauseMenu_10' && cui.getParent() != 'loading_1') {
			cui.doAction('back');
		} else if (act == 'select') {
			$('nav').toggleClass('hide');
			prefs.ui.autoHideCover = $('nav').hasClass('hide');
			let $elem = $('#interfaceMenu_12 .cui[name="toggleCover"] .text');
			if (!prefs.ui.autoHideCover) {
				cui.resize(true);
				$elem.text(lang.interfaceMenu_12.opt1[0]);
			} else {
				$elem.text(lang.interfaceMenu_12.opt1[1]);
			}
		}
	}

	onHeldAction(act, timeHeld) {
		if (timeHeld < 2000) {
			return;
		}
		// log(act + ' held for ' + timeHeld);
		if (launcher.state == 'running') {
			if (
				launcher.jsEmu &&
				act == prefs.inGame.pause.hold &&
				timeHeld > prefs.inGame.pause.time
			) {
				cui.doAction('pause');
			} else if (
				act == prefs.inGame.quit.hold &&
				timeHeld > prefs.inGame.quit.time
			) {
				log('shutting down emulator');
				launcher.close();
			} else if (
				act == prefs.inGame.reset.hold &&
				timeHeld > prefs.inGame.reset.time
			) {
				log('resetting emulator');
				launcher.reset();
			}
		}
	}

	onChange(state, subState) {
		if (state == 'languageMenu') {
			cui.clearDialogs();
			return;
		}
		let labels = [' ', ' ', ' '];
		if (/(game|menu)/i.test(state)) {
			labels[2] = lang.nostlanMenu_10.msg0;
		}
		$('#nav0Lbl').text(labels[0]);
		$('#nav2Lbl').text(labels[1]);
		$('#nav3Lbl').text(labels[2]);

		// TODO UI translation, english ui /lang/en.js

		for (let elem in lang[state]) {
			let txt = lang[state][elem];
			if (typeof txt != 'string') txt = txt[0];
			let $elem = $(`#${state} .${elem}`);
			if (!$elem.length) $elem = $('#' + elem);
			if (!$elem.length) continue;
			$elem.text(txt);
		}

		let lbls = ['#nav0Lbl', '#nav2Lbl', '#nav3Lbl'];
		for (let lbl of lbls) {
			let $lbl = $(lbl);
			let $parent = $lbl.parent();
			let txt = $lbl.text();
			if (txt.includes(' ')) {
				$lbl.addClass('twoLines');
				$parent.addClass('twoLines');
			} else {
				$lbl.removeClass('twoLines');
				$parent.removeClass('twoLines');
			}
		}

		$('nav .text').textfill();

		function adjust(flip) {
			if (flip && $('nav.fixed-top').find('#nav1Btn').length) {
				$('#nav3').css({
					'border-radius': '0 0 0 32px',
					'border-width': '0 0 8px 0'
				}).appendTo('nav.fixed-top');
				$('#nav1').css({
					'border-radius': '32px 0 0 0',
					'border-width': '8px 0 0 0'
				}).appendTo('nav.fixed-bottom');
			} else if (!flip && $('nav.fixed-top').find('#nav3Btn').length) {
				$('#nav3').css({
					'border-radius': '32px 0 0 0',
					'border-width': '8px 0 0 0'
				}).appendTo('nav.fixed-bottom');
				$('#nav1').css({
					'border-radius': '0 0 0 32px',
					'border-width': '0 0 8px 0'
				}).appendTo('nav.fixed-top');
			}
		}
		let buttons = ['X', 'Y', 'B'];
		if ((/(xbox|arcade)/i).test(subState)) {
			buttons = ['Y', 'X', 'B'];
			adjust(true);
		} else if ((/ps/i).test(subState)) {
			buttons = ['', '', ''];
			adjust(true);
		} else {
			adjust(false);
		}

		if (!(cui.gamepadConnected || cui.gca.connected) || !subState) {
			return;
		}
		$('#nav0Btn span').text(buttons[0]);
		$('#nav2Btn span').text(buttons[1]);
		$('#nav3Btn span').text(buttons[2]);
	}
}
module.exports = new CuiState();
