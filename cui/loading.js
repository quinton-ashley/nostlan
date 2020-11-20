class CuiState {

	async intro() {
		$('#dialogs').show();
		await nostlan.themes.loadFrame('intro');
		$('#themeStyles link').remove();
		await nostlan.themes.applyStyle('colors');
		await nostlan.themes.applyStyle('theme');
	}

	async removeIntro(time) {
		time = time || prefs.load.delay;
		if (arg.testIntro) time = 1000000;
		log('removing intro: ' + time);
		await delay(time);
		$('#intro').remove();
		cui.hideDialogs();
	}
}
module.exports = new CuiState();
