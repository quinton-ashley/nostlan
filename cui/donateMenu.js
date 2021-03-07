class CuiState extends cui.State {

	async onAction(act) {
		if (act == 'verify') {
			cui.change('checkDonationMenu');
		} else if (act == 'patreon') {
			opn('https://www.patreon.com/nostlan');
		} else if (act == 'remind') {
			await cui.libMain.load();
		}
	}
}
module.exports = new CuiState();
