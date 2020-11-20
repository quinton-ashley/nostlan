class CuiState {
	async onAction(act) {
		if (!systems[act]) return;
		cui.removeView('libMain');
		sys = act;
		syst = systems[sys];
		cui.removeCursor();
		await cui.libMain.load();
	}
}
module.exports = new CuiState();
