class CuiState {

	async onAction(act) {
		let recheckImgs = (act == 'scanForImages');
		let fullRescan = (act == 'rescanGameLib');
		if (act == 'scanForGames' || recheckImgs || fullRescan) {
			cui.removeView('libMain');
			cui.change('loading_1');
			await cui.loading.intro();
			if (!recheckImgs) {
				if (!fullRescan) {
					games = await scan.gameLib(games);
				} else {
					games = await scan.gameLib();
				}
			}
			await viewerLoad(recheckImgs);
			await cui.loading.removeIntro();
			cui.change('libMain');
			cui.scrollToCursor(0);
		} else if (act == 'info') {
			cui.change('gameLibInfoMenu_12');
		} else if (act == 'identifyGames' || act == 'imageSearch') {
			// "This option is not available yet!"
			// "Not Implemented"
			cui.alert(lang.alertMenu_9999.msg0,
				lang.alertMenu_9999.title4);
		}
	}
}
module.exports = new CuiState();
