class CuiState extends cui.State {

	async onAction(act) {
		if (act == 'full') {
			await prefsMng.update(prefs);
			cui.change('setupMenu');
		}
	}
}
module.exports = new CuiState();
