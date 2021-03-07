class CuiState extends cui.State {

	async onAction(act) {
		log(act);

		if (act == 'b') {
			$('#boxOpenMenu_2').hide();
		}
	}

	async onChange() {

	}
}
module.exports = new CuiState();
