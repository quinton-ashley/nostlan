class CuiState {

	async onAction(act) {
		let recheckImgs = (act == 'scanForImages');
		let fullRescan = (act == 'rescanGameLib');
		if (act == 'scanForGames' || recheckImgs || fullRescan) {
			cui.removeView('libMain');
			cui.change('loading');
			await cui.loading.intro();
			if (!recheckImgs) {
				if (!fullRescan) {
					games = await nostlan.scan.gameLib(games);
				} else {
					games = await nostlan.scan.gameLib();
				}
			}
			await viewerLoad(recheckImgs);
			await cui.loading.removeIntro();
			cui.change('libMain');
			cui.scrollToCursor(0);
		} else if (act == 'info') {
			cui.change('gameLibInfoMenu');
		} else if (act == 'identifyGames' || act == 'imageSearch') {
			// "This option is not available yet!"
			// "Not Implemented"
			cui.alert(lang.alertMenu.msg0,
				lang.alertMenu.title4);
		}
	}
}
module.exports = new CuiState();
