class CuiState {

	async onAction(act) {
		if (act == 'verify') {
			cui.change('checkDonationMenu_1');
		} else if (act == 'patreon') {
			opn('https://www.patreon.com/nostlan');
		} else if (act == 'remind') {
			await cui.libMain.load();
		}
	}
}
module.exports = new CuiState();
