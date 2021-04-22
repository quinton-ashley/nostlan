class CuiState extends cui.State {
	constructor() {
		super();
		this.$elems = [];
		this.imgDir = '';
	}

	async onAction(act) {
		log(act);

		if (act == 'x') {
			cui.change('imgSearchMenu');
		} else if (act == 'y') { // imgDir
			opn(this.imgDir);
		}
	}

	async onChange() {

	}
}
module.exports = new CuiState();
