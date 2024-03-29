class CuiState extends cui.State {
	async onAction(act) {
		if (act == 'editAppearance') {
			cui.change('interfaceMenu');
		} else if (act == 'controllerSettings') {
			cui.change('controllerMenu');
			let nameMsg = `<div>Name: ${cui.gamepadId}</div>`;
			let typeMsg = '';
			if (cui.gamepadConnected) {
				typeMsg = `<div>Type: ${cui.gamepadType}</div>`;
			}
			$('#controllerMenu #controName').html(nameMsg);
			$('#controllerMenu #controType').html(typeMsg);
			$('#prof0').text(cf.ui.gamepad.xbox_ps.profile);
			$('#prof1').text(cf.ui.gamepad.nintendo.profile);
			$('#prof2').text(cf.ui.gamepad.other.profile);
		} else if (act == 'languageMenu') {
			if (cui.ui == 'settingsMenu') {
				cui.removeView('libMain');
				cui.removeCursor();
			}
			await cui.change('languageMenu');
		} else if (act == 'editPrefs') {
			opn(cfMng.configPath);
			await delay(2000);
			cui.doAction('quit');
		} else if (act == 'toggleConsole') {
			electron.getCurrentWindow().toggleDevTools();
			let $elem = $('#nostlanMenu .cui[name="toggleConsole"] .text');
			if ($elem.text().includes('show')) {
				// 'hide console'
				$elem.text(lang.settingsMenu.opt2[1]);
			} else {
				// 'show console'
				$elem.text(lang.settingsMenu.opt2[0]);
			}
		}
	}
}
module.exports = new CuiState();
