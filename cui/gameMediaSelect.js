class CuiState extends cui.State {

	async onAction(act) {
		if (act == 'a' || act == 'media') {
			if (syst.emus.length > 1) {
				cui.change('playMenu');
			} else {
				$('body > :not(#dialogs)').addClass('dim');
				await nostlan.launcher.launch(cui.libMain.getCurGame());
			}
		} else if (act == 'x') { // file
			opn(path.parse(cui.libMain.getCurGame().file).dir);
		} else if (act == 'y') { // imgdir
			opn(await nostlan.scraper.getImgDir(cui.libMain.getCurGame()));
		}
	}

	async afterChange() {
		$('#boxOpenMenu').show();
	}
}
module.exports = new CuiState();
