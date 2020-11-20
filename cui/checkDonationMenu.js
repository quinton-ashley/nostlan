class CuiState {

	async onAction(act) {
		if (act == 'continue') {
			let pass = $('#donorPassword').val();
			if (nostlan.premium.verify(pass)) {
				await cui.libMain.load();
				if (nostlan.premium.verify() && !prefs.saves) {
					cui.change('addSavesPathMenu_2');
				}
			} else {
				cui.change('donateMenu');
				// 'incorrect donor password'
				cui.err(lang.donateMenu.err0);
			}
		}
	}
}
module.exports = new CuiState();
