class CuiState {

	async onAction(act) {
		if (act == 'full') {
			await prefsMng.update(prefs);
			cui.change('setupMenu_1');
		}
	}
}
module.exports = new CuiState();
