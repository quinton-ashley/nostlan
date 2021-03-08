class CuiState extends cui.State {
	constructor() {
		super();
		this.$elems = [];
	}

	load() {

	}

	async onAction(act) {
		log(act);

		if (act == 'x') {
			cui.change('imgSearchMenu');
		} else if (act == 'y') { // imgDir
			opn(await nostlan.scraper.getImgDir(cui.libMain.getCurGame()));
		}
	}

	async onChange() {

	}
}
module.exports = new CuiState();
