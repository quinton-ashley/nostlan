class CuiState extends cui.State {

	async onAction(act) {
		if (act == 'start') {
			// nostlan main menu is not available
			// when running emulators
			cui.err(lang.pauseMenu.err0);
		} else if (act == 'unpause' || act == 'b' || act == 'pause') {
			nostlan.launcher.unpause();
		} else if (act == 'saveState') {
			cui.change('saveStateMenu');
		} else if (act == 'loadState') {
			cui.change('loadStateMenu');
		} else if (act == 'mute') {
			let $elem = $('#pauseMenu .cui[name="mute"] .text');
			if ($elem.text().includes('un')) {
				nostlan.launcher.unmute();
				// 'mute'
				$elem.text(lang.pauseMenu.opt4[1]);
			} else {
				nostlan.launcher.mute();
				// 'unmute'
				$elem.text(lang.pauseMenu.opt4[0]);
			}
		} else if (act == 'openDevTools') {
			nostlan.launcher.openDevTools();
		} else if (act == 'stop') {
			await cui.change('playing_4');
			nostlan.launcher.close();
		}
	}
}
module.exports = new CuiState();
