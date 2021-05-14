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
			cui.change('imgSearchMenu');
		} else if (act == 'b') {
			$(`#${game.id} textarea`).attr('readonly', true);
		}
	}

	async onChange() {
		let game = cui.libMain.getCurGame();

		$(`#${game.id} textarea`).attr('readonly', false);

		this.imgDir = await nostlan.scraper.getImgDir(game);
		this.game = game;
	}
}
module.exports = new CuiState();
