const delay = require('delay');

module.exports = function () {
	cui.passthrough = (contro) => {
		if (!nostlan.launcher.jsEmu) return;

		nostlan.launcher.jsEmu.executeJavaScript(`jsEmu.controIn(${JSON.stringify(contro)})`);
	};

	cui.onResize = (adjust) => {};

	cui.clearDialogs = () => {
		$('#loadDialog0').text('');
		$('#loadDialog1').text('');
		$('#loadDialog2').text('');
	};

	cui.hideDialogs = () => {
		$('#dialogs').hide();
		cui.clearDialogs();
	};

	cui.onAction = async (act) => {
		let ui = cui.ui;
		if (act == 'quit') {
			await nostlan.quit();
			return;
		} else if (nostlan.launcher.state == 'running') {
			if (nostlan.launcher.jsEmu && ui == 'playing') {
				if (act == 'pause') {
					log('pausing emulation');
					nostlan.launcher.pause();
				}
			}
			return;
		} else if (act == 'escape') {
			electron.getCurrentWindow().minimize();
		}
		if (/^(x|start|y|b)/.test(act)) {
			let $btn;
			if (act == 'x') {
				$btn = $('#nav0');
			} else if (act == 'start') {
				$btn = $('#nav1');
			} else if (act == 'y') {
				$btn = $('#nav2');
			} else if (act == 'b') {
				$btn = $('#nav3');
			}
			if ($btn) {
				$btn.addClass('active');
				async function deactivate() {
					await delay(100);
					$btn.removeClass('active');
				}
				deactivate();
			}
		}

		if (act == 'x' && (ui == 'libMain' || ui == 'boxSelect')) {
			if (cui.$cursor.hasClass('cui-disabled')) return true;
			if (syst.emus.length > 1) {
				cui.change('playMenu');
			} else {
				$('body > :not(#dialogs)').addClass('dim');
				await nostlan.launcher.launch(cui.libMain.getCurGame());
			}
		} else if (act == 'start' && cui[ui].level < 10) {
			cui.change('nostlanMenu');
		} else if (
			act == 'b' &&
			(/menu/i.test(ui) || /select/i.test(ui)) &&
			ui != 'donateMenu' &&
			ui != 'setupMenu' &&
			ui != 'pauseMenu' &&
			ui != 'imgSearchMenu' &&
			cui.getParent() != 'loading'
		) {
			cui.doAction('back');
		} else if (act == 'select') {
			$('nav').toggleClass('hide');
			prefs.ui.autoHideCover = $('nav').hasClass('hide');
			let $elem = $('#interfaceMenu_12 .cui[name="toggleCover"] .text');
			if (!prefs.ui.autoHideCover) {
				cui.resize(true);
				$elem.text(lang.interfaceMenu.opt1[0]);
			} else {
				$elem.text(lang.interfaceMenu.opt1[1]);
			}
		} else {
			// return true if ui state onAction should be called
			return true;
		}
	};

	cui.onHeldAction = async (act, timeHeld) => {
		if (timeHeld < 2000) {
			return;
		}
		// log(act + ' held for ' + timeHeld);
		if (nostlan.launcher.state == 'running') {
			if (nostlan.launcher.jsEmu && act == prefs.inGame.pause.hold && timeHeld > prefs.inGame.pause.time) {
				cui.doAction('pause');
			} else if (act == prefs.inGame.quit.hold && timeHeld > prefs.inGame.quit.time) {
				log('shutting down emulator');
				nostlan.launcher.close();
			} else if (act == prefs.inGame.reset.hold && timeHeld > prefs.inGame.reset.time) {
				log('resetting emulator');
				nostlan.launcher.reset();
			}
		}
	};

	cui.onChange = async (state, subState) => {
		if (state == 'languageMenu') {
			cui.clearDialogs();
			return;
		}
		// init nav labels to empty string by default
		let labels = [' ', ' ', ' '];
		if (/(game|menu)/i.test(state)) {
			labels[2] = lang.nostlanMenu.msg0;
		}
		$('#nav0Lbl').text(labels[0]);
		$('#nav2Lbl').text(labels[1]);
		$('#nav3Lbl').text(labels[2]);

		for (let elem in lang[state]) {
			let txt = lang[state][elem];
			if (typeof txt != 'string') txt = txt[0];
			let $elem = $(`#${cui[state].id} .${elem}`);
			if (!$elem.length) $elem = $('#' + elem);
			if (!$elem.length) continue;
			$elem.text(txt);
		}

		for (let i = 0; i < 4; i++) {
			let $lbl = $(`#nav${i}Lbl`);
			let words = $lbl.text().split(' ');
			let maxLength = 0;
			for (let word of words) {
				if (word.length > maxLength) maxLength = word.length;
			}
			let fontSize = maxLength.map(6, 13, 3, 1.7);
			if (maxLength <= 6) fontSize = maxLength.map(3, 6, 4.3, 3.9);
			$lbl.css('font-size', fontSize + 'vw');

			// let $parent = $lbl.parent();
			// let txt = $lbl.text();
			// if (txt.includes(' ')) {
			// 	$lbl.addClass('twoLines');
			// 	$parent.addClass('twoLines');
			// } else {
			// 	$lbl.removeClass('twoLines');
			// 	$parent.removeClass('twoLines');
			// }
		}

		function adjust(flip) {
			if (flip && $('nav.fixed-top').find('#nav1Btn').length) {
				$('#nav3')
					.css({
						'border-radius': '0 0 0 32px',
						'border-width': '0 0 8px 0'
					})
					.appendTo('nav.fixed-top');
				$('#nav1')
					.css({
						'border-radius': '32px 0 0 0',
						'border-width': '8px 0 0 0'
					})
					.appendTo('nav.fixed-bottom');
			} else if (!flip && $('nav.fixed-top').find('#nav3Btn').length) {
				$('#nav3')
					.css({
						'border-radius': '32px 0 0 0',
						'border-width': '8px 0 0 0'
					})
					.appendTo('nav.fixed-bottom');
				$('#nav1')
					.css({
						'border-radius': '0 0 0 32px',
						'border-width': '0 0 8px 0'
					})
					.appendTo('nav.fixed-top');
			}
		}
		let buttons = ['X', 'Y', 'B'];
		if (/(xbox|arcade)/i.test(subState)) {
			buttons = ['Y', 'X', 'B'];
			adjust(true);
		} else if (/ps/i.test(subState)) {
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
	};
};
