class CuiState {

	async onAction(act) {
		if (act == 'info') {
			cui.change('controInfoMenu_13');
		} else if (act == 'rumble') {
			prefs.ui.gamepad.haptic = !prefs.ui.gamepad.haptic;
			cui.opt.haptic = prefs.ui.gamepad.haptic;
			let $rumble = $('#controllerMenu_12 .cui[name="rumble"] .text');
			if (prefs.ui.gamepad.haptic) {
				log('rumble enabled');
				$rumble.text(lang.controllerMenu_12.opt1[0]);
			} else {
				log('rumble disabled');
				$rumble.text(lang.controllerMenu_12.opt1[1]);
			}
		} else if (/prof/.test(act)) {
			let type = 'xbox_ps';
			if (act == 'prof1') type = 'nintendo';
			if (act == 'prof2') type = 'other';
			let prof = prefs.ui.gamepad[type].profile;
			if (prof == 'adaptive') {
				prof = 'constant';
			} else if (prof == 'constant') {
				prof = 'none';
			} else if (prof == 'none') {
				prof = 'adaptive';
			}
			prefs.ui.gamepad[type].profile = prof;
			$(`#controllerMenu_12 .cui[name="${act}"]`).text(prof);
		}
	}
}
module.exports = new CuiState();
