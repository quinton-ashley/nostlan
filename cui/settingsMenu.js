class CuiState {

	onAction(act) {
		if (act == 'editAppearance') {
			cui.change('interfaceMenu_12');
		} else if (act == 'controllerSettings') {
			cui.change('controllerMenu_12');
			let nameMsg = `<div>Name: ${cui.gamepadId}</div>`;
			let typeMsg = '';
			if (cui.gamepadConnected) {
				typeMsg = `<div>Type: ${cui.gamepadType}</div>`;
			}
			$('#controllerMenu_12 #controName').html(nameMsg);
			$('#controllerMenu_12 #controType').html(typeMsg);
			$('#prof0').text(prefs.ui.gamepad.xbox_ps.profile);
			$('#prof1').text(prefs.ui.gamepad.nintendo.profile);
			$('#prof2').text(prefs.ui.gamepad.other.profile);
		} else if (act == 'languageMenu') {
			await cui.languageMenu.create();
			cui.addListeners('#languageMenu');
			if (cui.ui == 'settingsMenu_11') {
				cui.removeView('libMain');
				cui.removeCursor();
			}
			cui.change('languageMenu');
		} else if (act == 'editPrefs') {
			opn(prefsMng.configPath);
			cui.doAction('quit');
		} else if (act == 'toggleConsole') {
			electron.getCurrentWindow().toggleDevTools();
			let $elem = $('#nostlanMenu_10 .cui[name="toggleConsole"] .text');
			if ($elem.text().includes('show')) {
				// 'hide console'
				$elem.text(lang.settingsMenu_11.opt2[1]);
			} else {
				// 'show console'
				$elem.text(lang.settingsMenu_11.opt2[0]);
			}
		}
	}
}
module.exports = new CuiState();
