class CuiState {

	onAction(act) {
		if (act == 'a' || act == 'media') {
			if (syst.emus.length > 1) {
				cui.change('playMenu_5');
			} else {
				$('body > :not(#dialogs)').addClass('dim');
				await launcher.launch(getCurGame());
			}
		} else if (act == 'x') { // file
			opn(path.parse(getCurGame().file).dir);
		} else if (act == 'y') { // imgdir
			opn(await scraper.getImgDir(getCurGame()));
		}
	}

	afterChange() {
		$('#boxOpenMenu_2').show();
	}
}
module.exports = new CuiState();
