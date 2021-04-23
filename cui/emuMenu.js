class CuiState extends cui.State {

	async onAction(act) {
		// change emu to the selected emu
		// or run with the previously selected emu
		// by double clicking/pressing x or y
		let acts = act.split('_');
		if (syst.emus.includes(acts[0])) {
			emu = acts[0];
		} else if (act != 'x' && act != 'y') {
			return;
		}
		$('body > :not(#dialogs)').addClass('dim');
		if (acts[1] == 'update') {
			await nostlan.launcher.updateEmu();
		} else {
			await nostlan.launcher.configEmu();
		}
	}
}
module.exports = new CuiState();
