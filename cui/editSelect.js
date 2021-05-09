class CuiState extends cui.State {
	constructor() {
		super();
		this.$elems = [];
		this.imgDir = '';
	}

	async onAction(act) {
		log(act);

		if (act == 'x') {
			opn(this.imgDir);
		} else if (act == 'y') {
			cui.change('imgSelect_4');
		}
	}

	async onChange() {

	}
}
module.exports = new CuiState();
