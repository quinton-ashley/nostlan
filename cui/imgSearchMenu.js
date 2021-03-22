class CuiState extends cui.State {

	async onAction(act) {
		log(act);

		if (act == 'a') {
			cui.doAction('back');
		}
	}
}
module.exports = new CuiState();
