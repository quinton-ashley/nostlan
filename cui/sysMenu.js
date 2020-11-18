class CuiState {
	onAction(act) {
		cui.removeView('libMain');
		sys = act;
		syst = systems[sys];
		cui.removeCursor();
		await loadGameLib();
	}
}
module.exports = new CuiState();
