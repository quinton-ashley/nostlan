class CuiState extends cui.State {

	async onAction(act) {
		let recheckImgs = (act == 'scanForImages');
		let doFullRescan = (act == 'rescanGameLib');
		if (act == 'openGameLibs') {
			for (let lib of prefs[sys].libs) {
				opn(lib);
			}
		} else if (act == 'scanForGames' || recheckImgs || doFullRescan) {
			cui.removeView('libMain');
			cui.change('loading');
			await cui.loading.intro();
			if (!recheckImgs) {
				await cui.libMain.rescanLib(doFullRescan);
			}
			await cui.libMain.viewerLoad(recheckImgs);
			await cui.loading.removeIntro();
			cui.change('libMain');
			cui.scrollToCursor(0);
		} else if (act == 'info') {
			cui.change('gameLibInfoMenu');
		}
	}
}
module.exports = new CuiState();
